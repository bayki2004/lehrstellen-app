#!/usr/bin/env python3
"""
O*NET RIASEC Import for LehrMatch
==================================
Downloads O*NET 30.1 Interests data and generates a SQL migration that updates
berufe.personality_fit with real RIASEC scores normalised to 0.0–1.0.

Usage:
    python3 scripts/onet_import.py

Output:
    supabase/migrations/00014_update_berufe_riasec.sql
"""

import csv
import io
import json
import os
import sys
import urllib.request
from collections import defaultdict

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

ONET_INTERESTS_URL = (
    "https://www.onetcenter.org/dl_files/database/db_30_1_text/Interests.txt"
)

# Element ID → RIASEC dimension
ELEMENT_MAP = {
    "1.B.1.a": "realistic",
    "1.B.1.b": "investigative",
    "1.B.1.c": "artistic",
    "1.B.1.d": "social",
    "1.B.1.e": "enterprising",
    "1.B.1.f": "conventional",
}

# Swiss beruf code → O*NET SOC code
SWISS_ONET_MAP = {
    "68500": "43-6014.00",   # Kaufmann/-frau EFZ -> Secretaries
    "68600": "43-9061.00",   # Kaufmann/-frau EBA -> Office Clerks
    "88611": "15-1252.00",   # Informatiker/in Applikationsentwicklung -> Software Developers
    "88612": "15-1244.00",   # Informatiker/in Plattformentwicklung -> Network Admins
    "88900": "15-1232.00",   # ICT-Fachmann/-frau -> Computer User Support
    "88613": "15-1255.00",   # Mediamatiker/in -> Web Designers
    "86914": "31-1131.00",   # FaGe -> Nursing Assistants
    "86916": "31-1131.00",   # AGS -> Nursing Assistants
    "86930": "31-9092.00",   # MPA -> Medical Assistants
    "71300": "41-2031.00",   # Detailhandelsfachmann/-frau -> Retail Salespersons
    "71400": "41-2031.00",   # Detailhandelsassistent/in -> Retail Salespersons
    "45700": "51-4041.00",   # Polymechaniker/in -> Machinists
    "45800": "51-4041.00",   # Produktionsmechaniker/in -> Machinists
    "47600": "17-3024.00",   # Automatiker/in -> Mechatronics Technicians
    "46500": "47-2111.00",   # Elektroinstallateur/in -> Electricians
    "51700": "51-7011.00",   # Schreiner/in -> Cabinetmakers
    "51200": "47-2031.00",   # Zimmermann -> Carpenters
    "33200": "47-2021.00",   # Maurer/in -> Brickmasons
    "34500": "17-3011.00",   # Zeichner/in -> Architectural Drafters
    "79000": "35-2014.00",   # Koch/Köchin -> Cooks
    "79100": "35-3031.00",   # Restaurantfachmann/-frau -> Waiters
    "21104": "51-3011.00",   # Bäcker/in-Konditor/in -> Bakers
    "94300": "39-9011.00",   # FaBe -> Childcare Workers
    "64700": "27-1024.00",   # Grafiker/in -> Graphic Designers
    "64800": "15-1255.00",   # Interactive Media Designer -> Web Designers
    "95600": "53-7062.00",   # Logistiker/in EFZ -> Laborers/Freight
    "95700": "53-7062.00",   # Logistiker/in EBA -> Laborers/Freight
    "17000": "37-3011.00",   # Gärtner/in -> Landscaping Workers
    "15000": "11-9013.00",   # Landwirt/in -> Farmers
}

# Field assignments for each beruf code (from seed data)
BERUF_FIELD = {
    "68500": "Kaufmännisch",
    "68600": "Kaufmännisch",
    "88611": "Informatik",
    "88612": "Informatik",
    "88900": "Informatik",
    "88613": "Informatik",
    "86914": "Gesundheit",
    "86916": "Gesundheit",
    "86930": "Gesundheit",
    "71300": "Detailhandel",
    "71400": "Detailhandel",
    "45700": "Technik",
    "45800": "Technik",
    "47600": "Technik",
    "46500": "Technik",
    "51700": "Handwerk",
    "51200": "Handwerk",
    "33200": "Bau",
    "34500": "Bau",
    "79000": "Gastronomie",
    "79100": "Gastronomie",
    "21104": "Gastronomie",
    "94300": "Soziales",
    "64700": "Design",
    "64800": "Design",
    "95600": "Logistik",
    "95700": "Logistik",
    "17000": "Natur",
    "15000": "Natur",
}

RIASEC_KEYS = ["realistic", "investigative", "artistic", "social", "enterprising", "conventional"]
RIASEC_LETTERS = {"realistic": "R", "investigative": "I", "artistic": "A",
                   "social": "S", "enterprising": "E", "conventional": "C"}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def download_interests(url: str) -> str:
    """Download O*NET Interests.txt and return contents as string."""
    print(f"Downloading {url} ...")
    req = urllib.request.Request(url, headers={"User-Agent": "LehrMatch-OnetImport/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = resp.read().decode("utf-8")
    print(f"  Downloaded {len(data):,} bytes")
    return data


def parse_riasec(tsv_text: str) -> dict:
    """
    Parse Interests.txt (tab-separated) and return a dict:
        { soc_code: { "realistic": float, ... } }
    Only rows with Scale ID == "OI" are used.
    Values are normalised from O*NET 1-7 scale to 0.0-1.0.
    """
    reader = csv.DictReader(io.StringIO(tsv_text), delimiter="\t")
    raw = defaultdict(dict)

    for row in reader:
        if row.get("Scale ID") != "OI":
            continue
        element_id = row.get("Element ID", "").strip()
        if element_id not in ELEMENT_MAP:
            continue
        soc = row["O*NET-SOC Code"].strip()
        value = float(row["Data Value"])
        normalised = round((value - 1) / 6, 2)
        dimension = ELEMENT_MAP[element_id]
        raw[soc][dimension] = normalised

    # Keep only SOC codes that have all 6 dimensions
    result = {}
    for soc, dims in raw.items():
        if len(dims) == 6:
            result[soc] = dims
    return result


def holland_code(scores: dict) -> str:
    """Return top-3 RIASEC letters sorted by score descending."""
    ranked = sorted(RIASEC_KEYS, key=lambda k: scores.get(k, 0), reverse=True)
    return "".join(RIASEC_LETTERS[k] for k in ranked[:3])


def compute_field_averages(beruf_scores: dict) -> dict:
    """
    Given { beruf_code: { dim: val, ... } } for mapped berufe,
    compute averages per field (Berufsfeld).
    Returns { field_name: { dim: val, ... } }.
    """
    field_accum = defaultdict(lambda: defaultdict(list))
    for code, scores in beruf_scores.items():
        field = BERUF_FIELD.get(code)
        if not field:
            continue
        for dim in RIASEC_KEYS:
            field_accum[field][dim].append(scores[dim])

    field_avg = {}
    for field, dims in field_accum.items():
        field_avg[field] = {
            dim: round(sum(vals) / len(vals), 2) for dim, vals in dims.items()
        }
    return field_avg


def generate_sql(beruf_scores: dict, field_averages: dict) -> str:
    """Generate the SQL migration file content."""
    lines = []
    lines.append("-- =============================================================================")
    lines.append("-- Migration: Update berufe with O*NET 30.1 RIASEC scores")
    lines.append("-- Generated by scripts/onet_import.py")
    lines.append("-- Source: https://www.onetcenter.org/database.html (O*NET 30.1)")
    lines.append("-- =============================================================================")
    lines.append("")
    lines.append("-- Add new columns for Holland code and O*NET SOC cross-reference")
    lines.append("ALTER TABLE berufe ADD COLUMN IF NOT EXISTS holland_code TEXT;")
    lines.append("ALTER TABLE berufe ADD COLUMN IF NOT EXISTS onet_soc_code TEXT;")
    lines.append("")
    lines.append("-- =============================================================================")
    lines.append("-- Directly-mapped berufe (Swiss code -> O*NET SOC)")
    lines.append("-- =============================================================================")

    for code in sorted(SWISS_ONET_MAP.keys()):
        soc = SWISS_ONET_MAP[code]
        if code not in beruf_scores:
            lines.append(f"-- WARNING: No O*NET data found for {code} -> {soc}")
            continue

        scores = beruf_scores[code]
        hc = holland_code(scores)
        pf_json = json.dumps(
            {k: scores[k] for k in RIASEC_KEYS},
            separators=(", ", ": "),
        )

        lines.append(f"UPDATE berufe SET")
        lines.append(f"    personality_fit = '{pf_json}',")
        lines.append(f"    holland_code = '{hc}',")
        lines.append(f"    onet_soc_code = '{soc}'")
        lines.append(f"WHERE code = '{code}';")
        lines.append("")

    # Field-based fallback for unmapped berufe
    lines.append("-- =============================================================================")
    lines.append("-- Field-based averages for berufe NOT in the direct mapping")
    lines.append("-- These use averaged RIASEC scores from mapped berufe in the same field.")
    lines.append("-- =============================================================================")

    mapped_codes = set(SWISS_ONET_MAP.keys())
    # Build a list of WHERE NOT IN codes for each field
    for field in sorted(field_averages.keys()):
        avg = field_averages[field]
        hc = holland_code(avg)
        pf_json = json.dumps(
            {k: avg[k] for k in RIASEC_KEYS},
            separators=(", ", ": "),
        )

        # Get the mapped codes in this field so we can exclude them
        field_codes = [c for c in mapped_codes if BERUF_FIELD.get(c) == field]
        exclusion = ", ".join(f"'{c}'" for c in sorted(field_codes))

        lines.append(f"-- Field: {field} (average RIASEC from {len(field_codes)} mapped berufe)")
        lines.append(f"UPDATE berufe SET")
        lines.append(f"    personality_fit = '{pf_json}',")
        lines.append(f"    holland_code = '{hc}'")
        lines.append(f"WHERE field = '{field}'")
        lines.append(f"  AND code NOT IN ({exclusion})")
        lines.append(f"  AND holland_code IS NULL;")
        lines.append("")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    # Resolve paths relative to project root
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    output_path = os.path.join(
        project_root, "supabase", "migrations", "00014_update_berufe_riasec.sql"
    )

    # 1. Download O*NET data
    tsv_text = download_interests(ONET_INTERESTS_URL)

    # 2. Parse RIASEC scores by SOC code
    soc_scores = parse_riasec(tsv_text)
    print(f"  Parsed RIASEC for {len(soc_scores)} SOC codes")

    # 3. Map Swiss berufe -> O*NET scores
    needed_socs = set(SWISS_ONET_MAP.values())
    missing_socs = needed_socs - set(soc_scores.keys())
    if missing_socs:
        print(f"  WARNING: Missing SOC codes in O*NET data: {missing_socs}")

    beruf_scores = {}
    for code, soc in SWISS_ONET_MAP.items():
        if soc in soc_scores:
            beruf_scores[code] = soc_scores[soc]

    print(f"  Mapped {len(beruf_scores)}/{len(SWISS_ONET_MAP)} berufe to RIASEC scores")

    # Print a summary table
    print("\n{:<8} {:<20} {:>4} {:>4} {:>4} {:>4} {:>4} {:>4}  {:<5}".format(
        "Code", "SOC", "R", "I", "A", "S", "E", "C", "HC"
    ))
    print("-" * 80)
    for code in sorted(beruf_scores.keys()):
        soc = SWISS_ONET_MAP[code]
        s = beruf_scores[code]
        hc = holland_code(s)
        print("{:<8} {:<20} {:>4} {:>4} {:>4} {:>4} {:>4} {:>4}  {:<5}".format(
            code, soc,
            s["realistic"], s["investigative"], s["artistic"],
            s["social"], s["enterprising"], s["conventional"],
            hc,
        ))

    # 4. Compute field averages for unmapped berufe
    field_avg = compute_field_averages(beruf_scores)
    print("\nField averages:")
    for field in sorted(field_avg.keys()):
        a = field_avg[field]
        hc = holland_code(a)
        print(f"  {field:<15} R={a['realistic']:.2f} I={a['investigative']:.2f} "
              f"A={a['artistic']:.2f} S={a['social']:.2f} E={a['enterprising']:.2f} "
              f"C={a['conventional']:.2f}  HC={hc}")

    # 5. Generate SQL migration
    sql = generate_sql(beruf_scores, field_avg)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(sql)
        f.write("\n")

    print(f"\nSQL migration written to: {output_path}")
    print(f"  ({len(sql)} bytes, {sql.count('UPDATE berufe SET')} UPDATE statements)")


if __name__ == "__main__":
    main()
