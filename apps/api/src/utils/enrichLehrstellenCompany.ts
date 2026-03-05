import { prisma } from '@lehrstellen/database';

/**
 * For proxy listings (created from lehrstellen), the Prisma `company` relation
 * is null because companyId points to the Supabase `companies` table (ImportedCompany).
 * This function batch-fetches company info and injects it onto the listing objects.
 */
export async function enrichLehrstellenCompanyData(listings: any[]): Promise<void> {
  const needEnrichment = listings.filter((l) => l && !l.company);
  if (needEnrichment.length === 0) return;

  const companyIds = [...new Set(needEnrichment.map((l) => l.companyId).filter(Boolean))];
  if (companyIds.length === 0) return;

  const companies = await prisma.importedCompany.findMany({
    where: { id: { in: companyIds } },
    select: { id: true, companyName: true, logoUrl: true, canton: true, city: true },
  });

  const companyMap = new Map(companies.map((c) => [c.id, c]));

  for (const listing of needEnrichment) {
    const c = companyMap.get(listing.companyId);
    if (c) {
      listing.company = {
        companyName: c.companyName,
        logoUrl: c.logoUrl,
        canton: c.canton,
        city: c.city,
      };
    }
  }
}
