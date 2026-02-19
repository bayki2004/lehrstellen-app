#!/usr/bin/env python3
"""
Orchestrator: seed LehrMatch database with real Swiss data.

Usage:
    python seed_database.py              # Run all steps
    python seed_database.py --step berufsschulen   # Run single step
    python seed_database.py --skip-lena  # Skip LENA fetch (Wave 2)

Steps (in order):
    1. berufsschulen  — Fetch ~340 vocational schools from RBS API
    2. lehrberufe     — Enrich berufe table from SDBB Excel export
    3. geocode        — Backfill missing lat/lng via Swisstopo
    4. school_map     — Build beruf-to-school mappings
"""

import argparse
import importlib
import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
logger = logging.getLogger(__name__)

STEPS = [
    ("berufsschulen", "fetch_berufsschulen", "Fetching vocational schools from RBS API"),
    ("lehrberufe", "enrich_lehrberufe", "Enriching berufe from SDBB Excel"),
    ("geocode", "geocode_addresses", "Geocoding missing addresses via Swisstopo"),
    ("school_map", "build_beruf_school_map", "Building beruf-to-school mappings"),
]


def run_step(module_name: str):
    """Import and run a seed script's main() function."""
    mod = importlib.import_module(module_name)
    mod.main()


def main():
    parser = argparse.ArgumentParser(description="LehrMatch data seeding orchestrator")
    parser.add_argument(
        "--step",
        choices=[s[0] for s in STEPS],
        help="Run a single step only",
    )
    parser.add_argument(
        "--skip-lena",
        action="store_true",
        help="Skip LENA fetch (not yet implemented in Wave 1)",
    )
    args = parser.parse_args()

    logger.info("=" * 60)
    logger.info("LehrMatch Data Seeding Pipeline")
    logger.info("=" * 60)

    success = 0
    failed = 0

    for step_key, module_name, description in STEPS:
        if args.step and args.step != step_key:
            continue

        logger.info("")
        logger.info("=" * 60)
        logger.info("Step: %s", description)
        logger.info("=" * 60)

        try:
            run_step(module_name)
            success += 1
            logger.info(">>> COMPLETED: %s", step_key)
        except Exception as e:
            failed += 1
            logger.error(">>> FAILED: %s — %s", step_key, e)

            # Critical steps: abort if they fail
            if step_key in ("berufsschulen", "lehrberufe"):
                logger.error("Critical step failed — aborting pipeline")
                sys.exit(1)
            # Non-critical steps: log and continue

    logger.info("")
    logger.info("=" * 60)
    logger.info("Pipeline complete: %d succeeded, %d failed", success, failed)
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
