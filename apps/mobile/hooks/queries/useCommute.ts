import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import {
  fetchTransitDuration,
  haversineDistanceKm,
  estimateBikeMinutes,
  resolveLocationName,
  resolveCoordinates,
} from '../../utils/commuteUtils';

export interface CommuteData {
  transitMinutes: number;
  bikeMinutes: number;
  distanceKm: number;
  transfers?: number;
}

interface LocationInput {
  city?: string;
  canton?: string;
}

async function fetchCommuteData(
  origin: LocationInput,
  destination: LocationInput,
): Promise<CommuteData> {
  const fromName = resolveLocationName(origin.city, origin.canton);
  const toName = resolveLocationName(destination.city, destination.canton);

  if (!fromName || !toName) {
    throw new Error('Missing origin or destination');
  }

  const originCoords = resolveCoordinates(origin.canton);
  const destCoords = resolveCoordinates(destination.canton);

  const transitResult = await fetchTransitDuration(fromName, toName);

  let distanceKm = 0;
  if (originCoords && destCoords) {
    distanceKm = haversineDistanceKm(
      originCoords.latitude,
      originCoords.longitude,
      destCoords.latitude,
      destCoords.longitude,
    );
  }

  const bikeMinutes = distanceKm > 0 ? estimateBikeMinutes(distanceKm) : 0;

  return {
    transitMinutes: transitResult?.durationMinutes ?? 0,
    bikeMinutes,
    distanceKm: Math.round(distanceKm * 10) / 10,
    transfers: transitResult?.transfers,
  };
}

export function useCommuteCalculation(
  origin: LocationInput | null,
  destination: LocationInput | null,
) {
  const enabled = !!(
    origin &&
    destination &&
    (origin.city || origin.canton) &&
    (destination.city || destination.canton)
  );

  return useQuery({
    queryKey: queryKeys.commute.route(
      origin?.city ?? '',
      origin?.canton ?? '',
      destination?.city ?? '',
      destination?.canton ?? '',
    ),
    queryFn: () => fetchCommuteData(origin!, destination!),
    enabled,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
  });
}
