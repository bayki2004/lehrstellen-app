/**
 * Import Supabase seed data (companies, lehrstellen) into Prisma tables.
 *
 * The Supabase SQL tables have 60 companies and 282 lehrstellen.
 * The Prisma tables (listings) only have 7 rows from the original seed.
 * This script reads from the Supabase tables via $queryRaw and writes
 * into Prisma-managed tables using the regular Prisma client.
 *
 * Usage:  npx tsx src/import-supabase-seeds.ts
 */

import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Supabase row types
// ---------------------------------------------------------------------------

interface SupabaseCompany {
  id: string;
  company_name: string;
  industry: string;
  canton: string;
  city: string;
  postal_code: string | null;
  address: string | null;
  website_url: string | null;
  description: string | null;
  logo_url: string | null;
  video_url: string | null;
  company_size: string | null;
  contact_person: string | null;
  contact_email: string;
  verified: boolean;
  culture_tags: any;
  culture_description: string | null;
}

interface SupabaseLehrstelle {
  id: string;
  company_id: string;
  beruf_code: string;
  title: string;
  description: string;
  duration_years: number;
  canton: string;
  city: string;
  status: string;
  positions_available: number;
  culture_description: string | null;
  start_date: Date | null;
}

interface SupabaseBeruf {
  code: string;
  name_de: string;
  field: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[äàâ]/g, 'a')
    .replace(/[öòô]/g, 'o')
    .replace(/[üùû]/g, 'u')
    .replace(/[éèêë]/g, 'e')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function mapCompanySize(size: string | null): string {
  switch (size) {
    case 'micro':
      return '1-10';
    case 'small':
      return '11-50';
    case 'medium':
      return '51-200';
    case 'large':
      return '201-1000';
    default:
      return '11-50';
  }
}

// ---------------------------------------------------------------------------
// Main import
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== Import Supabase seed data into Prisma tables ===\n');

  // 1. Shared password hash for all generated company users
  const passwordHash = await bcrypt.hash('Test1234!', 10);

  // 2. Read berufe table for beruf_code -> field mapping
  console.log('Reading berufe table...');
  const berufe = await prisma.$queryRaw<SupabaseBeruf[]>`
    SELECT code, name_de, field FROM berufe ORDER BY code
  `;
  const berufMap = new Map<string, SupabaseBeruf>();
  for (const b of berufe) {
    berufMap.set(b.code, b);
  }
  console.log(`  Found ${berufe.length} berufe.\n`);

  // 3. Read all companies from Supabase table
  console.log('Reading companies from Supabase table...');
  const companies = await prisma.$queryRaw<SupabaseCompany[]>`
    SELECT id, company_name, industry, canton, city, postal_code, address,
           website_url, description, logo_url, video_url, company_size,
           contact_person, contact_email, verified, culture_tags, culture_description
    FROM companies
    ORDER BY company_name
  `;
  console.log(`  Found ${companies.length} companies.\n`);

  // 4. Import companies
  const companyMapping = new Map<string, string>(); // supabase company id -> prisma CompanyProfile id
  let companiesCreated = 0;
  let companiesSkipped = 0;

  for (const c of companies) {
    // Check if a CompanyProfile with this name already exists
    const existing = await prisma.companyProfile.findFirst({
      where: { companyName: c.company_name },
    });

    if (existing) {
      companyMapping.set(c.id, existing.id);
      companiesSkipped++;
      continue;
    }

    // Create a User for this company
    const slug = slugify(c.company_name);
    const email = `${slug}@company.ch`;

    // Ensure email uniqueness — if collisions, append a suffix
    let finalEmail = email;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      finalEmail = `${slug}-${Date.now()}@company.ch`;
    }

    const user = await prisma.user.create({
      data: {
        email: finalEmail,
        passwordHash,
        role: UserRole.COMPANY,
        isVerified: c.verified,
        companyProfile: {
          create: {
            companyName: c.company_name,
            description: c.description || `${c.company_name} — ${c.industry}`,
            industry: c.industry,
            companySize: mapCompanySize(c.company_size),
            website: c.website_url,
            logoUrl: c.logo_url,
            videoUrl: c.video_url,
            canton: c.canton,
            city: c.city,
            address: c.address,
            contactPersonName: c.contact_person || 'Berufsbildung',
            contactPersonRole: 'Berufsbildung',
            isVerified: c.verified,
          },
        },
      },
      include: { companyProfile: true },
    });

    companyMapping.set(c.id, user.companyProfile!.id);
    companiesCreated++;
  }

  console.log(`Companies: ${companiesCreated} created, ${companiesSkipped} skipped (already exist).\n`);

  // 5. Read all lehrstellen from Supabase table
  console.log('Reading lehrstellen from Supabase table...');
  const lehrstellen = await prisma.$queryRaw<SupabaseLehrstelle[]>`
    SELECT id, company_id, beruf_code, title, description, duration_years,
           canton, city, status, positions_available, culture_description, start_date
    FROM lehrstellen
    ORDER BY company_id, title
  `;
  console.log(`  Found ${lehrstellen.length} lehrstellen.\n`);

  // 6. Import lehrstellen as Prisma Listings
  let listingsCreated = 0;
  let listingsSkipped = 0;
  let listingsNoCompany = 0;

  for (const l of lehrstellen) {
    // Look up the Prisma CompanyProfile id
    const companyProfileId = companyMapping.get(l.company_id);
    if (!companyProfileId) {
      listingsNoCompany++;
      continue;
    }

    // Check if listing with same title + companyId already exists
    const existingListing = await prisma.listing.findFirst({
      where: {
        companyId: companyProfileId,
        title: l.title,
      },
    });

    if (existingListing) {
      listingsSkipped++;
      continue;
    }

    // Look up beruf to get the field name
    const beruf = berufMap.get(l.beruf_code);
    const field = beruf?.field || 'Andere';

    // Get personality fit from berufe for ideal RIASEC scores
    const berufWithFit = await prisma.$queryRaw<
      { personality_fit: any }[]
    >`SELECT personality_fit FROM berufe WHERE code = ${l.beruf_code}`;

    const fit = berufWithFit[0]?.personality_fit;

    await prisma.listing.create({
      data: {
        companyId: companyProfileId,
        title: l.title,
        description: l.description,
        field: field,
        berufsfeld: l.beruf_code,
        canton: l.canton,
        city: l.city,
        durationYears: l.duration_years,
        spotsAvailable: l.positions_available || 2,
        isActive: l.status === 'active',
        requiredLanguages: ['Deutsch'],
        startDate: l.start_date || undefined,
        // Map RIASEC personality fit from berufe table
        ...(fit && {
          idealRiasecRealistic: fit.realistic ?? undefined,
          idealRiasecInvestigative: fit.investigative ?? undefined,
          idealRiasecArtistic: fit.artistic ?? undefined,
          idealRiasecSocial: fit.social ?? undefined,
          idealRiasecEnterprising: fit.enterprising ?? undefined,
          idealRiasecConventional: fit.conventional ?? undefined,
        }),
      },
    });

    listingsCreated++;
  }

  console.log(`Listings: ${listingsCreated} created, ${listingsSkipped} skipped (already exist), ${listingsNoCompany} skipped (no company mapping).\n`);

  // 7. Summary
  console.log('=== Import complete ===');
  console.log(`Total companies in Prisma: ${await prisma.companyProfile.count()}`);
  console.log(`Total listings in Prisma:  ${await prisma.listing.count()}`);
  console.log('\nAll imported company accounts use password: Test1234!');
}

main()
  .catch((e) => {
    console.error('Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
