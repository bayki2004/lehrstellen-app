#!/usr/bin/env python3
"""
Enrich the berufe table with data from the SDBB Profession Excel export.

Imports all Hauptberuf + LENA-relevant professions from the Excel file.
Preserves existing personality_fit data for our original 30 berufe.

Usage:
    python enrich_lehrberufe.py
    python enrich_lehrberufe.py --excel /path/to/file.xlsx
"""

import argparse
import logging
import sys
import zipfile
import xml.etree.ElementTree as ET

from config import LEHRBERUFE_EXCEL
from db import get_connection, upsert_beruf

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
logger = logging.getLogger(__name__)

# Mapping from profession keywords to Berufsfeld categories
# Must match the Berufsfeld enum in the Swift app
FIELD_KEYWORDS = {
    "informatik": [
        "informatik", "ict", "mediamatik", "interactive media",
        "telematik", "entwickl", "plattform", "geomatik",
    ],
    "kaufmaennisch": [
        "kaufmann", "kauffrau", "büroassist", "fachmann/-frau information",
        "buchhändl", "kundendialog",
    ],
    "gesundheit": [
        "gesundheit", "pflege", "fage", "ags", "medizinisch", "dental",
        "pharma", "drogist", "augenoptik", "orthopäd", "podolog",
        "hörsystem", "kosmetik", "zahntechn", "medizinprodukte",
        "apotheke",
    ],
    "technik": [
        "polymechanik", "automatik", "elektro", "elektronik", "mechani",
        "produktionsmech", "konstrukteur", "anlagen", "mikrotechn",
        "uhrmach", "goldschmied", "automobil", "kunststoff",
        "montage-elektri", "solarinstall", "solarmonteu",
        "kältesystem", "kältemontage", "seilbahn", "feinwerkoptik",
        "formenbau", "formenpraktik", "fahrzeugschloss",
        "oberflächenbeschicht", "industrielackier", "reifenpraktik",
        "apparateglasbläs", "physiklaborant", "veranstaltungsfach",
        "papiertechnolog", "verpackungstechnolog",
    ],
    "detailhandel": [
        "detailhandel", "drogist",
    ],
    "handwerk": [
        "schreiner", "zimmer", "spengler", "sanitär", "heizung",
        "gebäudetechnik", "metallbau", "carrosser", "maler", "gipser",
        "bodenleger", "polster", "coiffeu", "fleischfach",
        "holz", "bootbau", "bootfach", "schuhmach", "küfer",
        "graveur", "geigenbau", "orgelbau", "klavierbau",
        "büchsenmach", "messerschmied", "silberschmied", "hufschmied",
        "keramik", "ofenbau", "kaminfeg", "raumausstatt", "vergold",
        "glaser", "edelsteinfass", "polisseu", "zinnpfeifen",
        "säger", "plattenlege", "marmorist", "steinbildhau",
        "steinmetz", "sonnenschutz", "storen", "architekturmodell",
    ],
    "gastronomie": [
        "koch", "köchin", "restaurant", "hotel", "bäcker", "konditor",
        "confiseu", "systemgastro", "hotelfach",
        "küchenangestellt", "lebensmittelpraktik", "milchpraktik",
        "milchtechnolog", "weintechnolog",
    ],
    "bau": [
        "maurer", "zeichner", "strassenbau", "pflästerer", "gleisbau",
        "grundbau", "beton", "baupraktik", "haustechnikpraktik",
        "abdicht", "dachdeck", "fassadenbau", "gerüstbau",
        "bauwerktren", "entwässerung", "steinsetz", "steinwerk",
    ],
    "design": [
        "grafik", "interactive media", "polydesign", "gestalter",
        "fotograf", "drucktechnolog", "printmedien", "bekleidung",
        "florist", "polygraf", "fotomedien", "druckausrüst",
        "flexodruck", "verpackungsdruck", "dekorationsnäh",
    ],
    "soziales": [
        "betreuung", "sozial", "assistent/-in gesundheit und soziales",
        "hauswirtschaft", "reinigungstechn", "gebäudereinig",
        "unterhaltspraktik",
    ],
    "logistik": [
        "logistik", "strassentransport", "recyclist",
        "bahntransport", "öffentlicher verkehr", "binnenschiff",
        "matros",
    ],
    "natur": [
        "landwirt", "gärtner", "forstwart", "winzer", "tiermedizin",
        "tierpfleg", "geflügel", "pferdewart", "obstfach",
        "forstpraktik",
    ],
}


def classify_berufsfeld(name_de: str) -> str:
    """Classify a profession into one of the 12 Berufsfeld categories."""
    name_lower = name_de.lower()
    for field, keywords in FIELD_KEYWORDS.items():
        for kw in keywords:
            if kw in name_lower:
                return field
    return "kaufmaennisch"  # Default fallback


def parse_excel(filepath):
    """Parse the SDBB Profession Excel export (handles inline strings)."""
    ns = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

    with zipfile.ZipFile(filepath) as z:
        tree = ET.parse(z.open("xl/worksheets/sheet1.xml"))

    rows = tree.findall(".//s:sheetData/s:row", ns)

    def parse_row(row):
        cells = []
        for c in row.findall("s:c", ns):
            ctype = c.get("t", "")
            if ctype == "inlineStr":
                is_elem = c.find("s:is", ns)
                if is_elem is not None:
                    t_elem = is_elem.find("s:t", ns)
                    cells.append(t_elem.text if t_elem is not None else "")
                else:
                    cells.append("")
            else:
                v_elem = c.find("s:v", ns)
                cells.append(v_elem.text if v_elem is not None else "")
        return cells

    headers = parse_row(rows[0])
    records = []
    for row in rows[1:]:
        values = parse_row(row)
        record = dict(zip(headers, values))
        records.append(record)

    return records


def map_profession(record):
    """Map an Excel profession record to our berufe schema."""
    sbfi_code = record.get("Berufsnummer SBFI", "").strip()
    if not sbfi_code:
        return None

    # Only import Hauptberufe (hierarchy level 1) that are LENA-relevant
    if record.get("Hauptberuf") != "Ja":
        return None
    if record.get("LENA-relevant") != "Ja":
        return None

    name_de = record.get("Name M/F DE", "").strip()
    name_fr = record.get("Name M/F FR", "").strip() or None
    name_it = record.get("Name M/F IT", "").strip() or None
    swissdoc_id = record.get("Swissdoc-Nummer", "").strip() or None

    diploma_type = record.get("diplomaType", "").strip()
    education_type = "EFZ" if diploma_type == "EFZ" else "EBA"

    duration_str = record.get("Lehrdauer", "").strip()
    try:
        duration_years = int(duration_str) if duration_str else None
    except ValueError:
        duration_years = None

    field = classify_berufsfeld(name_de)

    return {
        "code": sbfi_code,
        "name_de": name_de,
        "name_fr": name_fr,
        "name_it": name_it,
        "field": field,
        "education_type": education_type,
        "duration_years": duration_years,
        "swissdoc_id": swissdoc_id,
        "lena_relevant": True,
        "data_source": "sdbb_excel",
    }


def main():
    parser = argparse.ArgumentParser(description="Enrich berufe from SDBB Excel")
    parser.add_argument("--excel", default=LEHRBERUFE_EXCEL, help="Path to Excel file")
    args = parser.parse_args()

    logger.info("Reading Excel file: %s", args.excel)
    records = parse_excel(args.excel)
    logger.info("Parsed %d total records from Excel", len(records))

    conn = get_connection()
    try:
        cur = conn.cursor()

        # Track what was there before
        cur.execute("SELECT COUNT(*) FROM berufe")
        before_count = cur.fetchone()[0]

        inserted = 0
        skipped = 0
        seen_codes = set()

        for record in records:
            mapped = map_profession(record)
            if mapped is None:
                skipped += 1
                continue

            # Skip duplicates within the Excel (multiple variants of same SBFI code)
            if mapped["code"] in seen_codes:
                skipped += 1
                continue
            seen_codes.add(mapped["code"])

            upsert_beruf(cur, mapped)
            inserted += 1

        conn.commit()

        cur.execute("SELECT COUNT(*) FROM berufe")
        after_count = cur.fetchone()[0]

        logger.info(
            "[OK] Processed %d professions (skipped %d non-Hauptberuf/non-LENA)",
            inserted,
            skipped,
        )
        logger.info(
            "  berufe table: %d -> %d records (%d new)",
            before_count,
            after_count,
            after_count - before_count,
        )

        # Show breakdown by field
        cur.execute(
            "SELECT field, COUNT(*) FROM berufe GROUP BY field ORDER BY COUNT(*) DESC"
        )
        for field, count in cur.fetchall():
            logger.info("  %s: %d berufe", field, count)

    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()
