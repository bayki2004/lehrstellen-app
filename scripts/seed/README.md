# LehrMatch — Data Seeding Scripts

Python scripts to populate the LehrMatch Supabase database with real Swiss apprenticeship data.

## Prerequisites

- Python 3.9+
- Local Supabase running (`supabase start`)
- Migrations applied (`supabase db reset` or `supabase migration up`)

## Setup

```bash
cd scripts/seed
pip install -r requirements.txt
```

## Data Sources

| Script | Source | Auth | Output |
|--------|--------|------|--------|
| `fetch_berufsschulen.py` | RBS API (rbs.sdbb.ch) | None | ~340 vocational schools |
| `enrich_lehrberufe.py` | SDBB Excel export | None (file) | ~300 enriched professions |
| `geocode_addresses.py` | Swisstopo API | None | Lat/lng for addresses |
| `build_beruf_school_map.py` | Local DB inference | None | Beruf-school mappings |

## Usage

### Run everything
```bash
python seed_database.py
```

### Run individual steps
```bash
python seed_database.py --step berufsschulen
python seed_database.py --step lehrberufe
python seed_database.py --step geocode
python seed_database.py --step school_map
```

### Run scripts directly
```bash
python fetch_berufsschulen.py
python enrich_lehrberufe.py --excel ~/Downloads/Export_Professions_details_18.02.2026.xlsx
python geocode_addresses.py --table berufsschulen
python build_beruf_school_map.py
```

## Re-running

All scripts are idempotent — they use `ON CONFLICT DO UPDATE` (upsert). Re-running will update existing records without creating duplicates.

## Wave 2 (planned)

- `fetch_lehrstellen.py` — Scrape LENA via berufsberatung.ch for real Lehrstellen data
