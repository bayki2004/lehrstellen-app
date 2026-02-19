"""Database utilities for LehrMatch seed scripts."""

import logging
import psycopg2
import psycopg2.extras
from config import DB_DSN

logger = logging.getLogger(__name__)


def get_connection():
    """Return a psycopg2 connection to the local Supabase database."""
    conn = psycopg2.connect(DB_DSN)
    conn.autocommit = False
    return conn


def upsert_berufsschule(cur, data):
    """Upsert a single berufsschule record. Returns the UUID."""
    cur.execute(
        """
        INSERT INTO berufsschulen (
            rbs_id, name, canton, city, address, postal_code,
            lat, lng, website, email, phone, bsx_id, ech_id,
            institutional_status
        ) VALUES (
            %(rbs_id)s, %(name)s, %(canton)s, %(city)s, %(address)s, %(postal_code)s,
            %(lat)s, %(lng)s, %(website)s, %(email)s, %(phone)s, %(bsx_id)s, %(ech_id)s,
            %(institutional_status)s
        )
        ON CONFLICT (rbs_id) DO UPDATE SET
            name = EXCLUDED.name,
            canton = EXCLUDED.canton,
            city = EXCLUDED.city,
            address = COALESCE(EXCLUDED.address, berufsschulen.address),
            postal_code = COALESCE(EXCLUDED.postal_code, berufsschulen.postal_code),
            lat = COALESCE(EXCLUDED.lat, berufsschulen.lat),
            lng = COALESCE(EXCLUDED.lng, berufsschulen.lng),
            website = COALESCE(EXCLUDED.website, berufsschulen.website),
            email = COALESCE(EXCLUDED.email, berufsschulen.email),
            phone = COALESCE(EXCLUDED.phone, berufsschulen.phone),
            bsx_id = COALESCE(EXCLUDED.bsx_id, berufsschulen.bsx_id),
            ech_id = COALESCE(EXCLUDED.ech_id, berufsschulen.ech_id),
            institutional_status = COALESCE(EXCLUDED.institutional_status, berufsschulen.institutional_status)
        RETURNING id
        """,
        data,
    )
    return cur.fetchone()[0]


def upsert_beruf(cur, data):
    """Upsert a single beruf record."""
    cur.execute(
        """
        INSERT INTO berufe (
            code, name_de, name_fr, name_it, field, education_type,
            duration_years, swissdoc_id, lena_relevant, data_source
        ) VALUES (
            %(code)s, %(name_de)s, %(name_fr)s, %(name_it)s, %(field)s, %(education_type)s,
            %(duration_years)s, %(swissdoc_id)s, %(lena_relevant)s, %(data_source)s
        )
        ON CONFLICT (code) DO UPDATE SET
            name_de = COALESCE(EXCLUDED.name_de, berufe.name_de),
            name_fr = COALESCE(EXCLUDED.name_fr, berufe.name_fr),
            name_it = COALESCE(EXCLUDED.name_it, berufe.name_it),
            field = COALESCE(EXCLUDED.field, berufe.field),
            duration_years = COALESCE(EXCLUDED.duration_years, berufe.duration_years),
            swissdoc_id = COALESCE(EXCLUDED.swissdoc_id, berufe.swissdoc_id),
            lena_relevant = COALESCE(EXCLUDED.lena_relevant, berufe.lena_relevant),
            data_source = EXCLUDED.data_source
        """,
        data,
    )


def upsert_beruf_school_mapping(cur, berufsschule_id, beruf_code, canton):
    """Upsert a single beruf-school mapping."""
    cur.execute(
        """
        INSERT INTO berufsschule_beruf_mapping (berufsschule_id, beruf_code, canton)
        VALUES (%s, %s, %s)
        ON CONFLICT (berufsschule_id, beruf_code) DO NOTHING
        """,
        (berufsschule_id, beruf_code, canton),
    )
