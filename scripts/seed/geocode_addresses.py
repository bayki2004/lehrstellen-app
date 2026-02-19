#!/usr/bin/env python3
"""
Backfill missing lat/lng coordinates using the Swisstopo geocoding API.

Geocodes berufsschulen and lehrstellen records that have addresses but no coordinates.

Usage:
    python geocode_addresses.py
    python geocode_addresses.py --table berufsschulen
    python geocode_addresses.py --table lehrstellen
"""

import argparse
import logging

from db import get_connection
from geocoder import geocode_address, geocode_city

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
logger = logging.getLogger(__name__)


def geocode_berufsschulen(cur):
    """Geocode berufsschulen with missing coordinates."""
    cur.execute(
        """
        SELECT id, name, address, postal_code, city, canton
        FROM berufsschulen
        WHERE lat IS NULL AND (address IS NOT NULL OR city IS NOT NULL)
        """
    )
    rows = cur.fetchall()
    if not rows:
        logger.info("All berufsschulen already have coordinates")
        return 0

    logger.info("Geocoding %d berufsschulen...", len(rows))
    updated = 0

    for school_id, name, address, postal_code, city, canton in rows:
        # Try full address first
        if address and postal_code and city:
            result = geocode_address(f"{address}, {postal_code} {city}")
        elif postal_code and city:
            result = geocode_city(postal_code, city)
        elif city:
            result = geocode_address(f"{city}, {canton}")
        else:
            continue

        if result:
            lat, lng = result
            cur.execute(
                "UPDATE berufsschulen SET lat = %s, lng = %s WHERE id = %s",
                (lat, lng, school_id),
            )
            updated += 1
            if updated % 20 == 0:
                logger.info("  ...geocoded %d / %d", updated, len(rows))
        else:
            logger.warning("  Could not geocode: '%s' (%s, %s)", name, city, canton)

    logger.info("[OK] Geocoded %d / %d berufsschulen", updated, len(rows))
    return updated


def geocode_lehrstellen(cur):
    """Geocode lehrstellen with missing coordinates."""
    cur.execute(
        """
        SELECT id, workplace_address, postal_code, city, canton
        FROM lehrstellen
        WHERE lat IS NULL AND (workplace_address IS NOT NULL OR city IS NOT NULL)
        """
    )
    rows = cur.fetchall()
    if not rows:
        logger.info("All lehrstellen already have coordinates (or no address data)")
        return 0

    logger.info("Geocoding %d lehrstellen...", len(rows))

    # Cache by city+postal_code to avoid redundant API calls
    city_cache = {}
    updated = 0

    for lehrstelle_id, address, postal_code, city, canton in rows:
        # Try city-level cache first (most lehrstellen share cities)
        city_key = f"{postal_code or ''} {city or ''}".strip()
        if city_key in city_cache:
            result = city_cache[city_key]
        elif address and postal_code and city:
            result = geocode_address(f"{address}, {postal_code} {city}")
            city_cache[city_key] = result
        elif postal_code and city:
            result = geocode_city(postal_code, city)
            city_cache[city_key] = result
        elif city:
            result = geocode_address(f"{city}, {canton}")
            city_cache[city_key] = result
        else:
            continue

        if result:
            lat, lng = result
            cur.execute(
                "UPDATE lehrstellen SET lat = %s, lng = %s WHERE id = %s",
                (lat, lng, lehrstelle_id),
            )
            updated += 1
            if updated % 50 == 0:
                logger.info("  ...geocoded %d / %d", updated, len(rows))

    logger.info("[OK] Geocoded %d / %d lehrstellen", updated, len(rows))
    return updated


def main():
    parser = argparse.ArgumentParser(description="Geocode missing addresses")
    parser.add_argument(
        "--table",
        choices=["berufsschulen", "lehrstellen", "all"],
        default="all",
        help="Which table to geocode",
    )
    args = parser.parse_args()

    conn = get_connection()
    try:
        cur = conn.cursor()

        if args.table in ("berufsschulen", "all"):
            geocode_berufsschulen(cur)

        if args.table in ("lehrstellen", "all"):
            geocode_lehrstellen(cur)

        conn.commit()

        # Summary
        cur.execute(
            "SELECT COUNT(*), COUNT(lat) FROM berufsschulen"
        )
        total, with_coords = cur.fetchone()
        logger.info("berufsschulen: %d total, %d with coordinates (%.0f%%)",
                     total, with_coords, 100 * with_coords / max(total, 1))

        cur.execute(
            "SELECT COUNT(*), COUNT(lat) FROM lehrstellen"
        )
        total, with_coords = cur.fetchone()
        logger.info("lehrstellen: %d total, %d with coordinates (%.0f%%)",
                     total, with_coords, 100 * with_coords / max(total, 1))

    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()
