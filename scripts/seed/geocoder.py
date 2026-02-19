"""Swisstopo geocoding wrapper with caching and rate limiting."""

import logging
import time

import requests

from config import (
    GEOCODE_DELAY_SEC,
    SWISS_LAT_MAX,
    SWISS_LAT_MIN,
    SWISS_LON_MAX,
    SWISS_LON_MIN,
    SWISSTOPO_GEOCODE_URL,
)

logger = logging.getLogger(__name__)

# In-memory cache keyed by normalized address string
_cache = {}


def geocode_address(address):
    """
    Geocode a Swiss address via Swisstopo SearchServer.
    Returns (lat, lon) or None if no result found.
    """
    if not address or not address.strip():
        return None

    normalized = address.strip().lower()
    if normalized in _cache:
        return _cache[normalized]

    time.sleep(GEOCODE_DELAY_SEC)

    try:
        resp = requests.get(
            SWISSTOPO_GEOCODE_URL,
            params={
                "searchText": address,
                "type": "locations",
                "origins": "address",
                "sr": "4326",
            },
            timeout=10,
        )
        resp.raise_for_status()
        results = resp.json().get("results", [])

        if results:
            attrs = results[0]["attrs"]
            lat = attrs.get("lat")
            lon = attrs.get("lon")

            # Validate Swiss bounding box
            if (
                lat is not None
                and lon is not None
                and SWISS_LAT_MIN <= lat <= SWISS_LAT_MAX
                and SWISS_LON_MIN <= lon <= SWISS_LON_MAX
            ):
                result = (lat, lon)
                _cache[normalized] = result
                return result

        _cache[normalized] = None
        return None

    except Exception as e:
        logger.warning("Geocoding failed for '%s': %s", address, e)
        _cache[normalized] = None
        return None


def geocode_city(postal_code, city):
    """Geocode by postal code + city (less precise but good for clustering)."""
    key = f"{postal_code} {city}".strip()
    return geocode_address(key)
