import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { queryKeys } from '../queryKeys';
import type { ListingDTO } from '@lehrstellen/shared';
import type { Berufsschule } from '../../types/beruf.types';
import { CANTON_COORDINATES } from '../../constants/cantonCoordinates';

export function useMapListings() {
  return useQuery({
    queryKey: queryKeys.listings.list(),
    queryFn: async (): Promise<ListingDTO[]> => {
      const res = await api.get('/listings');
      const raw = (res.data as any).data || res.data;
      return Array.isArray(raw) ? raw : [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useMapSchools() {
  return useQuery({
    queryKey: queryKeys.schulen.list(),
    queryFn: async (): Promise<Berufsschule[]> => {
      const res = await api.get('/berufsschulen');
      const raw = (res.data as any).data || res.data;
      return Array.isArray(raw) ? raw : [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Deterministic hash of a string to a float in [0, 1). */
function hashToFloat(str: string, salt: number): number {
  let hash = salt;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return ((hash & 0x7fffffff) % 10000) / 10000;
}

/** Produce a stable coordinate for a listing (canton center + deterministic offset). */
export function getListingCoordinate(listing: ListingDTO) {
  const canton = listing.canton?.toUpperCase();
  const coords = CANTON_COORDINATES[canton];
  if (!coords) return null;
  const latOffset = (hashToFloat(listing.id, 1) - 0.5) * 0.02;
  const lngOffset = (hashToFloat(listing.id, 2) - 0.5) * 0.02;
  return {
    latitude: coords.latitude + latOffset,
    longitude: coords.longitude + lngOffset,
  };
}

/** Produce a stable coordinate for a school. */
export function getSchoolCoordinate(school: Berufsschule) {
  if (school.lat && school.lng) {
    return { latitude: school.lat, longitude: school.lng };
  }
  const canton = school.canton?.toUpperCase();
  const coords = CANTON_COORDINATES[canton];
  if (!coords) return null;
  const latOffset = (hashToFloat(school.id, 3) - 0.5) * 0.015;
  const lngOffset = (hashToFloat(school.id, 4) - 0.5) * 0.015;
  return {
    latitude: coords.latitude + latOffset,
    longitude: coords.longitude + lngOffset,
  };
}
