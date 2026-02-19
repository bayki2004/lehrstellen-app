#!/usr/bin/env python3
"""
Build the berufsschule_beruf_mapping table by inferring which Berufe
each school teaches, based on the school's name.

Usage:
    python build_beruf_school_map.py
"""

import logging

from db import get_connection, upsert_beruf_school_mapping

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
logger = logging.getLogger(__name__)

# Keyword-based rules to map school names → Berufsfeld → beruf_codes
# Each rule: (keywords_any_match, berufsfeld_name, beruf_codes)
SCHOOL_RULES = [
    # Commercial / KV schools
    (
        ["kv ", "wirtschaft", "handelsschule", "commercial", "wks ", "hkvbs"],
        "Kaufmännisch",
        None,  # will be resolved from berufe table
    ),
    # IT schools
    (
        ["informatik", "ict", "gibb"],  # GIBB Bern has strong IT department
        "Informatik",
        None,
    ),
    # Health schools
    (
        ["gesundheit", "pflege", "santé", "bfgs", "careum", "bzgs"],
        "Gesundheit",
        None,
    ),
    # Technical / industrial schools
    (
        [
            "technik", "industrielle", "gewerblich", "technisch",
            "libs ", "sfb ", "mechatronik",
        ],
        "Technik",
        None,
    ),
    # Retail
    (
        ["detailhandel", "bds "],
        "Detailhandel",
        None,
    ),
    # Gastronomy / hospitality
    (
        ["gastronomie", "hotel", "hotellerie", "richemont", "belvédère"],
        "Gastronomie",
        None,
    ),
    # Construction
    (
        ["bau", "baugewerblich", "architektur", "campus sursee"],
        "Bau",
        None,
    ),
    # Design / arts
    (
        ["kunst", "gestaltung", "design", "schule für gestaltung", "sfgz"],
        "Design",
        None,
    ),
    # Social work
    (
        ["sozial", "agogik", "bfs "],
        "Soziales",
        None,
    ),
    # Crafts
    (
        ["handwerk", "holz", "schreiner"],
        "Handwerk",
        None,
    ),
    # Logistics
    (
        ["logistik", "transport", "verkehrswegbau"],
        "Logistik",
        None,
    ),
    # Nature / agriculture
    (
        ["landwirtschaft", "garten", "agrar", "inforama", "strickhof"],
        "Natur",
        None,
    ),
]

# General vocational schools (Berufsbildungszentren) teach many fields
GENERAL_KEYWORDS = [
    "berufsbildungszentrum", "bbz", "bzb", "bzf", "bwz",
    "bildungszentrum", "berufschulzentrum", "gewerblich-industriell",
    "allgemeine berufsschule", "berufsfachschule",
]


def get_beruf_codes_by_field(cur):
    """Load beruf codes grouped by field from the database."""
    cur.execute("SELECT code, field FROM berufe WHERE field IS NOT NULL")
    field_codes = {}
    for code, field in cur.fetchall():
        # Normalize field name to match our Berufsfeld enum
        field_lower = field.lower().replace("ä", "ae").replace("ü", "ue")
        # Map common field names to our enum values
        field_map = {
            "kaufmannisch": "kaufmaennisch",
            "kaufmännisch": "kaufmaennisch",
        }
        field_key = field_map.get(field_lower, field_lower)
        field_codes.setdefault(field_key, []).append(code)
    return field_codes


def infer_fields_for_school(school_name):
    """Return list of Berufsfeld names this school likely teaches."""
    name_lower = school_name.lower()
    matched_fields = []

    # Check specific rules first
    for keywords, field_name, _ in SCHOOL_RULES:
        for kw in keywords:
            if kw in name_lower:
                if field_name not in matched_fields:
                    matched_fields.append(field_name)
                break

    # If it's a general school, add common fields
    is_general = any(kw in name_lower for kw in GENERAL_KEYWORDS)
    if is_general and not matched_fields:
        # General schools typically teach Kaufmännisch, Technik, Gesundheit, Detailhandel
        matched_fields.extend(["Kaufmännisch", "Technik", "Gesundheit", "Detailhandel"])

    return matched_fields


def main():
    conn = get_connection()
    try:
        cur = conn.cursor()

        # Load beruf codes by field
        field_codes = get_beruf_codes_by_field(cur)
        logger.info("Loaded beruf codes for %d fields", len(field_codes))
        for field, codes in sorted(field_codes.items()):
            logger.info("  %s: %d berufe", field, len(codes))

        # Load all schools
        cur.execute("SELECT id, name, canton FROM berufsschulen")
        schools = cur.fetchall()
        logger.info("Processing %d schools...", len(schools))

        # Clear existing mappings (fresh rebuild)
        cur.execute("DELETE FROM berufsschule_beruf_mapping")

        total_mappings = 0
        schools_matched = 0
        schools_unmatched = 0

        for school_id, school_name, canton in schools:
            fields = infer_fields_for_school(school_name)

            if not fields:
                schools_unmatched += 1
                logger.debug("  No match: '%s' (%s)", school_name, canton)
                continue

            schools_matched += 1
            for field_name in fields:
                # Normalize field name for lookup
                field_key = field_name.lower().replace("ä", "ae").replace("ü", "ue")
                field_map = {
                    "kaufmannisch": "kaufmaennisch",
                    "kaufmännisch": "kaufmaennisch",
                }
                field_key = field_map.get(field_key, field_key)

                codes = field_codes.get(field_key, [])
                for code in codes:
                    upsert_beruf_school_mapping(cur, school_id, code, canton)
                    total_mappings += 1

        conn.commit()

        logger.info(
            "[OK] Created %d beruf-school mappings for %d schools (%d unmatched)",
            total_mappings,
            schools_matched,
            schools_unmatched,
        )

        # Verify
        cur.execute("SELECT COUNT(*) FROM berufsschule_beruf_mapping")
        logger.info("  Total mappings in DB: %d", cur.fetchone()[0])

    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()
