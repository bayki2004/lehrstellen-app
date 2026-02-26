import { CANTON_COORDINATES } from '../constants/cantonCoordinates';

// ── Haversine distance ──────────────────────────────────────────────

const EARTH_RADIUS_KM = 6371;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

// ── Bike time estimate ──────────────────────────────────────────────

const BIKE_SPEED_KMH = 15;
const ROAD_FACTOR = 1.3; // straight-line → approximate road distance

export function estimateBikeMinutes(distanceKm: number): number {
  const roadDistance = distanceKm * ROAD_FACTOR;
  return Math.round((roadDistance / BIKE_SPEED_KMH) * 60);
}

// ── Swiss Transport API ─────────────────────────────────────────────

export interface TransitResult {
  durationMinutes: number;
  transfers: number;
}

/** Parses the SBB duration format "00d00:56:00" into total minutes. */
function parseDuration(duration: string): number {
  if (!duration) return 0;
  const match = duration.match(/(\d+)d(\d+):(\d+):(\d+)/);
  if (!match) return 0;
  const days = parseInt(match[1], 10);
  const hours = parseInt(match[2], 10);
  const minutes = parseInt(match[3], 10);
  return days * 1440 + hours * 60 + minutes;
}

export async function fetchTransitDuration(
  from: string,
  to: string,
): Promise<TransitResult | null> {
  try {
    const params = new URLSearchParams({ from, to, limit: '1' });
    const response = await fetch(
      `https://transport.opendata.ch/v1/connections?${params.toString()}`,
    );
    if (!response.ok) return null;

    const data = await response.json();
    const connection = data.connections?.[0];
    if (!connection) return null;

    return {
      durationMinutes: parseDuration(connection.duration),
      transfers: connection.transfers ?? 0,
    };
  } catch {
    return null;
  }
}

// ── Location resolvers ──────────────────────────────────────────────

export const CANTON_MAIN_CITY: Record<string, string> = {
  AG: 'Aarau',
  AI: 'Appenzell',
  AR: 'Herisau',
  BE: 'Bern',
  BL: 'Liestal',
  BS: 'Basel',
  FR: 'Fribourg',
  GE: 'Genf',
  GL: 'Glarus',
  GR: 'Chur',
  JU: 'Delémont',
  LU: 'Luzern',
  NE: 'Neuchâtel',
  NW: 'Stans',
  OW: 'Sarnen',
  SG: 'St. Gallen',
  SH: 'Schaffhausen',
  SO: 'Solothurn',
  SZ: 'Schwyz',
  TG: 'Frauenfeld',
  TI: 'Bellinzona',
  UR: 'Altdorf',
  VD: 'Lausanne',
  VS: 'Sion',
  ZG: 'Zug',
  ZH: 'Zürich',
};

/** Resolves city + canton to a name suitable for the Swiss Transport API. */
export function resolveLocationName(
  city?: string,
  canton?: string,
): string | null {
  if (city && city.trim().length > 0) return city.trim();
  if (canton) return CANTON_MAIN_CITY[canton.toUpperCase()] ?? null;
  return null;
}

/** Resolves canton to coordinates via CANTON_COORDINATES. */
export function resolveCoordinates(
  canton?: string,
): { latitude: number; longitude: number } | null {
  if (!canton) return null;
  return CANTON_COORDINATES[canton.toUpperCase()] ?? null;
}
