import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { queryKeys } from '../queryKeys';
import type { ListingDTO } from '@lehrstellen/shared';
import type { Beruf, Berufsschule } from '../../types/beruf.types';

export function useLehrstellenSearch() {
  return useQuery({
    queryKey: queryKeys.listings.list(),
    queryFn: async (): Promise<ListingDTO[]> => {
      const response = await api.get<{ data: ListingDTO[] }>('/listings');
      const listings = response.data.data || (response.data as any);
      return Array.isArray(listings) ? listings : [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useBerufeSearch() {
  return useQuery({
    queryKey: queryKeys.berufe.list(),
    queryFn: async (): Promise<Beruf[]> => {
      const response = await api.get('/berufe');
      const raw = (response.data as any)?.data ?? response.data;
      const rows = Array.isArray(raw) ? raw : [];
      return rows.map((r: any) => ({
        code: r.code,
        nameDe: r.nameDe ?? r.name_de ?? '',
        field: r.field,
        educationType: r.educationType ?? r.education_type,
        durationYears: r.durationYears ?? r.duration_years,
        descriptionDe: r.descriptionDe ?? r.description_de,
        personalityFit: r.personalityFit ?? r.personality_fit,
        hollandCode: r.hollandCode ?? r.holland_code,
      }));
    },
    staleTime: 30 * 60 * 1000,
  });
}

export function useSchulenSearch() {
  return useQuery({
    queryKey: queryKeys.schulen.list(),
    queryFn: async (): Promise<Berufsschule[]> => {
      const response = await api.get('/berufsschulen');
      const raw = (response.data as any)?.data ?? response.data;
      return Array.isArray(raw) ? raw : [];
    },
    staleTime: 30 * 60 * 1000,
  });
}
