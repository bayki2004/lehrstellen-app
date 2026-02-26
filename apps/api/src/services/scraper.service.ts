/**
 * Web scraping service for enriching beruf and school data.
 *
 * NOTE: This service requires the `cheerio` package.
 * Install it with:  pnpm add cheerio --filter @lehrstellen/api
 */

import * as cheerio from 'cheerio';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScrapedBerufData {
  description?: string;
  requirements?: string[];
  dailyRoutine?: string;
  salary?: string;
  careerPaths?: string[];
  relatedProfessions?: string[];
  duration?: string;
  scrapedAt: string;
}

export interface ScrapedSchoolData {
  about?: string;
  programs?: string[];
  contact?: { email?: string; phone?: string };
  scrapedAt: string;
}

// ---------------------------------------------------------------------------
// In-memory cache for scraped school data (TTL: 1 hour)
// ---------------------------------------------------------------------------

const schoolCache = new Map<string, { data: ScrapedSchoolData; expiresAt: number }>();

function getSchoolCached(url: string): ScrapedSchoolData | null {
  const entry = schoolCache.get(url);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    schoolCache.delete(url);
    return null;
  }
  return entry.data;
}

function setSchoolCache(url: string, data: ScrapedSchoolData): void {
  schoolCache.set(url, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ---------------------------------------------------------------------------
// In-memory cache for scraped beruf data (TTL: 1 hour)
// ---------------------------------------------------------------------------

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const berufCache = new Map<string, { data: ScrapedBerufData; expiresAt: number }>();

function getCached(bbId: string): ScrapedBerufData | null {
  const entry = berufCache.get(bbId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    berufCache.delete(bbId);
    return null;
  }
  return entry.data;
}

function setCache(bbId: string, data: ScrapedBerufData): void {
  berufCache.set(bbId, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ---------------------------------------------------------------------------
// Beruf scraping — uses berufsberatung.ch detail pages
// ---------------------------------------------------------------------------

export async function scrapeBerufDetail(bbId: string): Promise<ScrapedBerufData | null> {
  if (!bbId) return null;

  // Check cache first
  const cached = getCached(bbId);
  if (cached) return cached;

  try {
    const url = `https://www.berufsberatung.ch/dyn/show/2093?lang=de&idx=10000&id=${bbId}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'LehrMatch/1.0 (Educational App)' },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);

    // --- Description: try multiple selectors ---
    let description: string | undefined;
    // Main content paragraphs
    const contentPs = $('article p, .content p, [class*="description"] p, .beruf-description p');
    if (contentPs.length > 0) {
      const paragraphs: string[] = [];
      contentPs.each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 30) paragraphs.push(text);
      });
      if (paragraphs.length > 0) description = paragraphs.join('\n\n');
    }
    // Fallback: meta description
    if (!description) {
      description = $('meta[name="description"]').attr('content')?.trim() || undefined;
    }
    // Fallback: first substantial paragraph anywhere
    if (!description) {
      $('p').each((_, el) => {
        if (description) return;
        const text = $(el).text().trim();
        if (text.length > 60) description = text;
      });
    }

    // --- Requirements ---
    const requirements: string[] = [];
    $('[class*="requirement"] li, [class*="voraussetzung"] li, .requirements li').each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 2) requirements.push(text);
    });
    // Also try h2/h3 sections titled "Voraussetzungen" or "Anforderungen"
    if (requirements.length === 0) {
      $('h2, h3').each((_, heading) => {
        const title = $(heading).text().trim().toLowerCase();
        if (title.includes('voraussetzung') || title.includes('anforderung')) {
          $(heading).nextAll('ul').first().find('li').each((__, li) => {
            const text = $(li).text().trim();
            if (text && text.length > 2) requirements.push(text);
          });
        }
      });
    }

    // --- Career Paths ---
    const careerPaths: string[] = [];
    $('[class*="career"] li, [class*="weiterbildung"] li, .career-paths li').each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 2) careerPaths.push(text);
    });
    if (careerPaths.length === 0) {
      $('h2, h3').each((_, heading) => {
        const title = $(heading).text().trim().toLowerCase();
        if (title.includes('weiterbildung') || title.includes('karriere') || title.includes('laufbahn')) {
          $(heading).nextAll('ul').first().find('li').each((__, li) => {
            const text = $(li).text().trim();
            if (text && text.length > 2) careerPaths.push(text);
          });
        }
      });
    }

    // --- Duration ---
    let duration: string | undefined;
    $('dt, th, strong, b').each((_, el) => {
      const label = $(el).text().trim().toLowerCase();
      if (label.includes('dauer') || label.includes('ausbildungsdauer')) {
        const value = $(el).next('dd, td').text().trim() || $(el).parent().text().replace($(el).text(), '').trim();
        if (value) duration = value;
      }
    });

    // --- Related Professions ---
    const relatedProfessions: string[] = [];
    $('h2, h3').each((_, heading) => {
      const title = $(heading).text().trim().toLowerCase();
      if (title.includes('verwandt') || title.includes('ähnlich')) {
        $(heading).nextAll('ul').first().find('li').each((__, li) => {
          const text = $(li).text().trim();
          if (text && text.length > 2) relatedProfessions.push(text);
        });
        // Also check for links
        if (relatedProfessions.length === 0) {
          $(heading).nextAll('a, p a').each((__, link) => {
            const text = $(link).text().trim();
            if (text && text.length > 2) relatedProfessions.push(text);
          });
        }
      }
    });

    const result: ScrapedBerufData = {
      description,
      requirements: requirements.length > 0 ? requirements : undefined,
      careerPaths: careerPaths.length > 0 ? careerPaths : undefined,
      relatedProfessions: relatedProfessions.length > 0 ? relatedProfessions : undefined,
      duration: duration || undefined,
      scrapedAt: new Date().toISOString(),
    };

    // Cache the result
    setCache(bbId, result);

    return result;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// School scraping
// ---------------------------------------------------------------------------

export async function scrapeSchoolInfo(websiteUrl: string): Promise<ScrapedSchoolData | null> {
  if (!websiteUrl) return null;

  // Check cache first
  const cached = getSchoolCached(websiteUrl);
  if (cached) return cached;

  try {
    const url = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'LehrMatch/1.0 (Educational App)' },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);

    // --- About / Description ---
    let about: string | undefined;
    // Try meta description first
    const metaDesc = $('meta[name="description"]').attr('content')?.trim();
    if (metaDesc && metaDesc.length > 20) {
      about = metaDesc;
    }
    // Fallback: try main content paragraphs
    if (!about) {
      const paragraphs: string[] = [];
      $('main p, article p, .content p, #content p, [role="main"] p').each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 40) paragraphs.push(text);
      });
      if (paragraphs.length > 0) about = paragraphs.slice(0, 3).join('\n\n');
    }
    // Last fallback: first substantial paragraph
    if (!about) {
      $('p').each((_, el) => {
        if (about) return;
        const text = $(el).text().trim();
        if (text.length > 60) about = text.substring(0, 600);
      });
    }

    // --- Programs / Bildungsangebote ---
    const programs: string[] = [];
    // Try nav links or dedicated sections
    $('h2, h3, h4').each((_, heading) => {
      const title = $(heading).text().trim().toLowerCase();
      if (title.includes('bildungsangebot') || title.includes('berufe') ||
          title.includes('ausbildung') || title.includes('angebot') ||
          title.includes('formation') || title.includes('offre')) {
        $(heading).nextAll('ul').first().find('li').each((__, li) => {
          const text = $(li).text().trim();
          if (text && text.length > 2 && text.length < 100) programs.push(text);
        });
      }
    });
    // Also try nav items with common patterns
    if (programs.length === 0) {
      $('nav a, .menu a, .navigation a').each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 3 && text.length < 80 &&
            (text.toLowerCase().includes('efz') || text.toLowerCase().includes('eba') ||
             text.toLowerCase().includes('lehre') || text.toLowerCase().includes('grundbildung'))) {
          programs.push(text);
        }
      });
    }

    // --- Contact info ---
    const emailMatch = html.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
    const phoneMatch = html.match(/(?:\+41|0)\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}/);

    const contact: ScrapedSchoolData['contact'] = {};
    if (emailMatch) contact.email = emailMatch[0];
    if (phoneMatch) contact.phone = phoneMatch[0];

    const result: ScrapedSchoolData = {
      about,
      programs: programs.length > 0 ? programs : undefined,
      contact: Object.keys(contact).length > 0 ? contact : undefined,
      scrapedAt: new Date().toISOString(),
    };

    // Cache the result
    setSchoolCache(websiteUrl, result);

    return result;
  } catch {
    return null;
  }
}
