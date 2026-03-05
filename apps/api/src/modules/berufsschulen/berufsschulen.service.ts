import { prisma } from '@lehrstellen/database';
import { scrapeSchoolInfo, type ScrapedSchoolData } from '../../services/scraper.service';

interface BerufsschuleDTO {
  id: string;
  name: string;
  city: string;
  canton: string;
  address: string | null;
  website: string | null;
  lat: number | null;
  lng: number | null;
  institutionalStatus: string | null;
  specializations: string[];
}

interface BerufsschuleDetailDTO extends BerufsschuleDTO {
  postalCode: string | null;
  email: string | null;
  phone: string | null;
  scraped?: ScrapedSchoolData | null;
}

export interface CantonCount {
  canton: string;
  count: number;
}

export interface BerufsschulenFilterParams {
  canton?: string;
  q?: string;
  letter?: string;
}

export async function getBerufsschulen(filters?: BerufsschulenFilterParams): Promise<BerufsschuleDTO[]> {
  try {
    const rows = await prisma.berufsschule.findMany({
      where: {
        ...(filters?.canton && { canton: filters.canton }),
        ...(filters?.q && filters.q.length >= 2 && {
          OR: [
            { name: { contains: filters.q, mode: 'insensitive' as const } },
            { city: { contains: filters.q, mode: 'insensitive' as const } },
          ],
        }),
        ...(filters?.letter && filters.letter.length === 1 && {
          name: { startsWith: filters.letter, mode: 'insensitive' as const },
        }),
      },
      include: {
        berufMappings: {
          include: { beruf: { select: { nameDe: true } } },
          orderBy: { beruf: { nameDe: 'asc' } },
        },
      },
      orderBy: { name: 'asc' },
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      city: row.city,
      canton: row.canton,
      address: row.address,
      website: row.website,
      lat: row.lat,
      lng: row.lng,
      institutionalStatus: row.institutionalStatus,
      specializations: row.berufMappings.map((m) => m.beruf.nameDe),
    }));
  } catch (error) {
    console.error('[API] getBerufsschulen error:', error);
    throw error;
  }
}

export async function getBerufsschulenCantons(): Promise<CantonCount[]> {
  const groups = await prisma.berufsschule.groupBy({
    by: ['canton'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  });
  return groups.map((g) => ({ canton: g.canton, count: g._count.id }));
}

export async function getBerufsschuleById(id: string): Promise<BerufsschuleDetailDTO | null> {
  const row = await prisma.berufsschule.findUnique({
    where: { id },
    include: {
      berufMappings: {
        include: { beruf: { select: { nameDe: true } } },
        orderBy: { beruf: { nameDe: 'asc' } },
      },
    },
  });

  if (!row) return null;

  // Attempt to enrich with scraped data if the school has a website
  let scraped: ScrapedSchoolData | null = null;
  if (row.website) {
    try {
      scraped = await scrapeSchoolInfo(row.website);
    } catch {
      // Scraping failures are non-fatal
    }
  }

  return {
    id: row.id,
    name: row.name,
    city: row.city,
    canton: row.canton,
    address: row.address,
    postalCode: row.postalCode,
    website: row.website,
    lat: row.lat,
    lng: row.lng,
    email: row.email ?? scraped?.contact?.email ?? null,
    phone: row.phone ?? scraped?.contact?.phone ?? null,
    institutionalStatus: row.institutionalStatus,
    specializations: row.berufMappings.map((m) => m.beruf.nameDe),
    scraped,
  };
}
