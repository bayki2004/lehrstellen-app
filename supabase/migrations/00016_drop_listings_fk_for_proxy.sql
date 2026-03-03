-- Drop the FK constraint on listings.companyId so proxy listings
-- can store Supabase company UUIDs (from the "companies" table)
-- without requiring a matching row in "company_profiles".
--
-- Background: When a student swipes on a lehrstelle (Supabase table),
-- a proxy Listing row is created in the Prisma "listings" table.
-- The companyId is set to the Supabase company UUID, which doesn't
-- exist in company_profiles. Without dropping this FK, the insert fails.

-- Only run if the listings table exists (created by Prisma db push)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'listings') THEN
    ALTER TABLE "listings" DROP CONSTRAINT IF EXISTS "listings_companyId_fkey";
  END IF;
END $$;
