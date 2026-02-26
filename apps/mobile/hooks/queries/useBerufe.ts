import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { queryKeys } from '../queryKeys';
import type { Beruf, BerufDetail, FieldCount, LehrstelleForBeruf } from '../../types/beruf.types';

interface BerufMatchResponse {
  beruf: Beruf;
  matchPercentage: number;
  sharedDimensions: { key: string; label: string; userScore: number; berufScore: number }[];
  explanations: string[];
}

function mapRowToBeruf(r: any): Beruf {
  return {
    code: r.code,
    nameDe: r.nameDe ?? r.name_de ?? '',
    field: r.field,
    educationType: r.educationType ?? r.education_type,
    durationYears: r.durationYears ?? r.duration_years,
    descriptionDe: r.descriptionDe ?? r.description_de,
    personalityFit: r.personalityFit ?? r.personality_fit,
    hollandCode: r.hollandCode ?? r.holland_code,
    bbId: r.bbId ?? r.bb_id,
    anforderungMathematik: r.anforderungMathematik ?? r.anforderung_mathematik ?? undefined,
    anforderungSchulsprache: r.anforderungSchulsprache ?? r.anforderung_schulsprache ?? undefined,
    anforderungNaturwissenschaften: r.anforderungNaturwissenschaften ?? r.anforderung_naturwissenschaften ?? undefined,
    anforderungFremdsprachen: r.anforderungFremdsprachen ?? r.anforderung_fremdsprachen ?? undefined,
    lohnLehrjahre: r.lohnLehrjahre ?? r.lohn_lehrjahre ?? undefined,
  };
}

export interface BerufeFilters {
  letter?: string;
  field?: string;
  q?: string;
  type?: string;
}

export function useAllBerufe(filters?: BerufeFilters) {
  const params: Record<string, string> = {};
  if (filters?.letter) params.letter = filters.letter;
  if (filters?.field) params.field = filters.field;
  if (filters?.q) params.q = filters.q;
  if (filters?.type) params.type = filters.type;

  return useQuery({
    queryKey: queryKeys.berufe.list(params),
    queryFn: async () => {
      const response = await api.get('/berufe', { params });
      const raw = response.data?.data ?? response.data;
      const rows = Array.isArray(raw) ? raw : [];
      return rows.map(mapRowToBeruf);
    },
    staleTime: 30 * 60 * 1000,
  });
}

export function useBerufeFields() {
  return useQuery({
    queryKey: queryKeys.berufe.fields(),
    queryFn: async (): Promise<FieldCount[]> => {
      const response = await api.get('/berufe/fields');
      const raw = response.data?.data ?? response.data;
      return Array.isArray(raw) ? raw : [];
    },
    staleTime: 30 * 60 * 1000,
  });
}

// Keep for backward compat
export function useBerufe() {
  return useAllBerufe();
}

export function useBerufeMatches() {
  return useQuery({
    queryKey: queryKeys.berufe.matches(),
    queryFn: async (): Promise<BerufMatchResponse[]> => {
      const response = await api.get('/berufe/matches');
      const raw = response.data?.data ?? response.data;
      return Array.isArray(raw) ? raw : [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useBerufDetail(code: string) {
  return useQuery({
    queryKey: queryKeys.berufe.detail(code),
    queryFn: async (): Promise<BerufDetail> => {
      const response = await api.get(`/berufe/${code}`);
      const raw = response.data?.data ?? response.data;
      return {
        ...mapRowToBeruf(raw),
        scraped: raw.scraped ?? null,
      };
    },
    enabled: !!code,
  });
}

export function useLehrstellenForBeruf(code: string) {
  return useQuery({
    queryKey: [...queryKeys.berufe.detail(code), 'lehrstellen'],
    queryFn: async (): Promise<{ count: number; lehrstellen: LehrstelleForBeruf[] }> => {
      const response = await api.get(`/berufe/${code}/lehrstellen`);
      const raw = response.data?.data ?? response.data;
      return {
        count: raw.count ?? 0,
        lehrstellen: (raw.lehrstellen ?? []).map((r: any) => ({
          id: r.id,
          title: r.title,
          companyName: r.company_name ?? '',
          city: r.city,
          canton: r.canton,
          positionsAvailable: r.positions_available ?? 1,
        })),
      };
    },
    enabled: !!code,
    staleTime: 5 * 60 * 1000,
  });
}
