"""Shared configuration for LehrMatch seed scripts."""

import os

# Database (local Supabase)
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "54322")
DB_NAME = os.getenv("DB_NAME", "postgres")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")

DB_DSN = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# API endpoints
RBS_API_URL = "https://rbs.sdbb.ch/api/institutions/"
LENA_SEARCH_URL = "https://www.berufsberatung.ch/LenaWeb/AjaxWebSearch"
SWISSTOPO_GEOCODE_URL = "https://api3.geo.admin.ch/rest/services/api/SearchServer"

# Rate limiting
GEOCODE_DELAY_SEC = 1.0
LENA_DELAY_SEC = 2.0

# Swiss bounding box (WGS84) for geocoding validation
SWISS_LAT_MIN = 45.8
SWISS_LAT_MAX = 47.9
SWISS_LON_MIN = 5.9
SWISS_LON_MAX = 10.5

# All 26 Swiss cantons
SWISS_CANTONS = [
    "ZH", "BE", "LU", "UR", "SZ", "OW", "NW", "GL", "ZG", "FR",
    "SO", "BS", "BL", "SH", "AR", "AI", "SG", "GR", "AG", "TG",
    "TI", "VD", "VS", "NE", "GE", "JU",
]

# Excel file path (SDBB Profession export)
LEHRBERUFE_EXCEL = os.getenv(
    "LEHRBERUFE_EXCEL",
    os.path.expanduser("~/Downloads/Export_Professions_details_18.02.2026.xlsx"),
)
