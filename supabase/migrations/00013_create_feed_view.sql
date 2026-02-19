-- Migration: Create lehrstellen_feed view for the discovery feed and map
-- JOINs lehrstellen + companies + berufe into the LehrstelleCard shape

-- =============================================================================
-- 1. Create the feed view
-- =============================================================================
CREATE OR REPLACE VIEW lehrstellen_feed AS
SELECT
    l.id,
    l.company_id,
    c.company_name,
    c.logo_url AS company_logo_url,
    l.beruf_code,
    b.name_de AS beruf_title,
    l.title,
    l.description,
    l.canton,
    l.city,
    l.education_type,
    l.start_date,
    l.duration_years,
    l.video_url,
    COALESCE(l.photos, '[]'::jsonb) AS photo_urls,
    l.culture_description,
    COALESCE(c.culture_tags, '[]'::jsonb) AS culture_tags,
    COALESCE(l.requirements, '[]'::jsonb) AS requirements,
    0.5 AS compatibility_score,
    l.canton AS berufsschule_canton,
    c.company_size,
    COALESCE(c.verified, false) AS is_verified,
    COALESCE(c.premium, false) AS is_premium,
    l.workplace_address,
    l.lat,
    l.lng,
    l.berufsschule_id,
    l.berufsschule_days,
    COALESCE(l.beruf_category, b.field) AS beruf_category,
    l.status
FROM lehrstellen l
JOIN companies c ON c.id = l.company_id
LEFT JOIN berufe b ON b.code = l.beruf_code;

-- =============================================================================
-- 2. Grant access — views inherit the underlying table's RLS,
--    but we also need to allow the anon role to query it.
-- =============================================================================
GRANT SELECT ON lehrstellen_feed TO anon, authenticated;
