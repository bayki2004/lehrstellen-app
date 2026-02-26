-- Drop the FK constraint on listings.companyId so proxy listings
-- can store Supabase company UUIDs (from the "companies" table)
-- without requiring a matching row in "company_profiles".
--
-- Background: When a student swipes on a lehrstelle (Supabase table),
-- a proxy Listing row is created in the Prisma "listings" table.
-- The companyId is set to the Supabase company UUID, which doesn't
-- exist in company_profiles. Without dropping this FK, the insert fails.

ALTER TABLE "listings" DROP CONSTRAINT IF EXISTS "listings_companyId_fkey";
