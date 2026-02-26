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

interface BerufsschuleRow {
  id: string;
  name: string;
  city: string;
  canton: string;
  address: string | null;
  postal_code: string | null;
  website: string | null;
  lat: number | null;
  lng: number | null;
  email: string | null;
  phone: string | null;
  institutional_status: string | null;
}

interface SpecRow {
  berufsschule_id: string;
  beruf_name: string;
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
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIdx = 1;

    if (filters?.canton) {
      conditions.push(`canton = $${paramIdx}`);
      values.push(filters.canton);
      paramIdx++;
    }
    if (filters?.q && filters.q.length >= 2) {
      conditions.push(`(name ILIKE $${paramIdx} OR city ILIKE $${paramIdx})`);
      values.push(`%${filters.q}%`);
      paramIdx++;
    }
    if (filters?.letter && filters.letter.length === 1) {
      conditions.push(`UPPER(LEFT(name, 1)) = $${paramIdx}`);
      values.push(filters.letter.toUpperCase());
      paramIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT id, name, city, canton, address, postal_code, website, lat, lng, institutional_status
                 FROM berufsschulen ${whereClause} ORDER BY name`;

    const rows = await prisma.$queryRawUnsafe<BerufsschuleRow[]>(sql, ...values);

    // Fetch specializations for all returned schools
    const ids = rows.map((r) => r.id);
    const specMap = new Map<string, string[]>();
    if (ids.length > 0) {
      try {
        const specs = await prisma.$queryRaw<SpecRow[]>`
          SELECT m.berufsschule_id, b.name_de as beruf_name
          FROM berufsschule_beruf_mapping m
          JOIN berufe b ON b.code = m.beruf_code
          WHERE m.berufsschule_id::text = ANY(${ids})
          ORDER BY b.name_de
        `;
        for (const s of specs) {
          const arr = specMap.get(s.berufsschule_id) || [];
          arr.push(s.beruf_name);
          specMap.set(s.berufsschule_id, arr);
        }
      } catch {
        // Specialization lookup is non-fatal
      }
    }

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      city: row.city,
      canton: row.canton,
      address: row.address,
      website: row.website,
      lat: row.lat,
      lng: row.lng,
      institutionalStatus: row.institutional_status,
      specializations: specMap.get(row.id) || [],
    }));
  } catch (error) {
    console.error('[API] getBerufsschulen error:', error);
    throw error;
  }
}

export async function getBerufsschulenCantons(): Promise<CantonCount[]> {
  const rows = await prisma.$queryRaw<{ canton: string; count: bigint }[]>`
    SELECT canton, COUNT(*) as count
    FROM berufsschulen
    GROUP BY canton
    ORDER BY count DESC
  `;
  return rows.map((r) => ({ canton: r.canton, count: Number(r.count) }));
}

export async function getBerufsschuleById(id: string): Promise<BerufsschuleDetailDTO | null> {
  const rows = await prisma.$queryRaw<BerufsschuleRow[]>`
    SELECT id, name, city, canton, address, postal_code, website, lat, lng, email, phone, institutional_status
    FROM berufsschulen
    WHERE id = ${id}::uuid
  `;

  const row = rows[0];
  if (!row) return null;

  // Fetch specializations
  let specializations: string[] = [];
  try {
    const specs = await prisma.$queryRaw<{ beruf_name: string }[]>`
      SELECT b.name_de as beruf_name
      FROM berufsschule_beruf_mapping m
      JOIN berufe b ON b.code = m.beruf_code
      WHERE m.berufsschule_id = ${id}::uuid
      ORDER BY b.name_de
    `;
    specializations = specs.map((s) => s.beruf_name);
  } catch {
    // Non-fatal
  }

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
    postalCode: row.postal_code,
    website: row.website,
    lat: row.lat,
    lng: row.lng,
    email: row.email ?? scraped?.contact?.email ?? null,
    phone: row.phone ?? scraped?.contact?.phone ?? null,
    institutionalStatus: row.institutional_status,
    specializations,
    scraped,
  };
}
