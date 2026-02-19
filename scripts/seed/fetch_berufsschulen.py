#!/usr/bin/env python3
"""
Fetch all Swiss Berufsfachschulen from the RBS API (rbs.sdbb.ch).

Usage:
    python fetch_berufsschulen.py
"""

import logging
import sys
import time

import requests

from config import RBS_API_URL
from db import get_connection, upsert_berufsschule

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
logger = logging.getLogger(__name__)

MAX_RETRIES = 3


def fetch_institutions():
    """Fetch all institutions from the RBS API."""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logger.info("Fetching institutions from RBS API (attempt %d)...", attempt)
            resp = requests.get(RBS_API_URL, timeout=30)
            resp.raise_for_status()
            data = resp.json()

            # The API returns {"data": [...]} or just a list
            if isinstance(data, dict) and "data" in data:
                institutions = data["data"]
            elif isinstance(data, list):
                institutions = data
            else:
                logger.error("Unexpected API response format: %s", type(data))
                return []

            logger.info("Received %d institutions from RBS API", len(institutions))
            return institutions

        except requests.RequestException as e:
            logger.warning("Attempt %d failed: %s", attempt, e)
            if attempt < MAX_RETRIES:
                time.sleep(2 ** attempt)
            else:
                logger.error("All %d attempts failed", MAX_RETRIES)
                raise


def map_institution(inst):
    """Map an RBS API institution to our berufsschulen schema."""
    try:
        rbs_id = inst.get("id")
        if not rbs_id:
            return None

        # Name: prefer German, fall back to French, then Italian
        name_obj = inst.get("name", {}) or {}
        name = (
            name_obj.get("de")
            or name_obj.get("fr")
            or name_obj.get("it")
            or ""
        )
        if not name:
            logger.warning("Skipping institution %s: no name", rbs_id)
            return None

        # Address
        addr = inst.get("address", {}) or {}
        canton = (addr.get("canton") or "").upper()
        city = addr.get("city") or ""
        street_name = addr.get("streetName") or ""
        street_number = addr.get("streetNumber") or ""
        address = f"{street_name} {street_number}".strip() or None
        postal_code = addr.get("postalCode")

        if not canton or len(canton) != 2:
            logger.warning("Skipping %s: invalid canton '%s'", name, canton)
            return None

        # Coordinates
        latlng = inst.get("latlng") or []
        lat = latlng[0] if len(latlng) >= 2 else None
        lng = latlng[1] if len(latlng) >= 2 else None

        # Contact info
        contact = inst.get("contactInformation", {}) or {}
        website = contact.get("url")
        email = contact.get("email")
        phone = contact.get("phoneNumber")

        # SDBB IDs
        sdbb_id = inst.get("sdbbId", {}) or {}
        bsx_id = sdbb_id.get("bsxId")
        ech_id = sdbb_id.get("echId")

        # Status
        institutional_status = inst.get("institutionalStatus")

        return {
            "rbs_id": str(rbs_id),
            "name": name,
            "canton": canton,
            "city": city,
            "address": address,
            "postal_code": postal_code,
            "lat": lat,
            "lng": lng,
            "website": website,
            "email": email,
            "phone": phone,
            "bsx_id": bsx_id,
            "ech_id": ech_id,
            "institutional_status": institutional_status,
        }

    except Exception as e:
        logger.warning("Error mapping institution: %s", e)
        return None


def backfill_existing_schools(cur):
    """Try to match existing hand-entered schools (without rbs_id) to RBS records."""
    cur.execute(
        """
        SELECT id, name, canton FROM berufsschulen WHERE rbs_id IS NULL
        """
    )
    orphans = cur.fetchall()
    if not orphans:
        return

    logger.info("Attempting to backfill %d existing schools without rbs_id...", len(orphans))

    matched = 0
    for school_id, school_name, school_canton in orphans:
        # Try exact match by name + canton among newly imported records
        cur.execute(
            """
            SELECT rbs_id FROM berufsschulen
            WHERE rbs_id IS NOT NULL
              AND canton = %s
              AND name ILIKE %s
            LIMIT 1
            """,
            (school_canton, f"%{school_name}%"),
        )
        row = cur.fetchone()
        if row:
            # Found a match — the orphan is a duplicate; just delete it
            # (the RBS version is more complete)
            cur.execute("DELETE FROM berufsschulen WHERE id = %s", (school_id,))
            matched += 1
            logger.info("  Merged duplicate: '%s' (%s)", school_name, school_canton)

    logger.info("Backfill: merged %d / %d orphan schools", matched, len(orphans))


def main():
    institutions = fetch_institutions()
    if not institutions:
        logger.error("No institutions fetched — aborting")
        sys.exit(1)

    conn = get_connection()
    try:
        cur = conn.cursor()

        inserted = 0
        skipped = 0
        cantons = set()

        for inst in institutions:
            mapped = map_institution(inst)
            if mapped is None:
                skipped += 1
                continue

            # Skip disabled institutions
            if inst.get("disabledAt") is not None:
                skipped += 1
                continue

            upsert_berufsschule(cur, mapped)
            inserted += 1
            cantons.add(mapped["canton"])

        # Try to merge hand-entered duplicates
        backfill_existing_schools(cur)

        conn.commit()
        logger.info(
            "[OK] Upserted %d Berufsfachschulen across %d cantons (skipped %d)",
            inserted,
            len(cantons),
            skipped,
        )

        # Summary by canton
        cur.execute(
            "SELECT canton, COUNT(*) FROM berufsschulen GROUP BY canton ORDER BY COUNT(*) DESC"
        )
        for canton, count in cur.fetchall():
            logger.info("  %s: %d schools", canton, count)

    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()
