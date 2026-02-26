import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { queryKeys } from '../queryKeys';
import type { Berufsschule, BerufsschuleDetail, CantonCount } from '../../types/beruf.types';

export function useSchoolDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.schulen.detail(id!),
    queryFn: async (): Promise<BerufsschuleDetail> => {
      const res = await api.get(`/berufsschulen/${id}`);
      return res.data.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

export function useAllSchulen(filters?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.schulen.list(filters as any),
    queryFn: async (): Promise<Berufsschule[]> => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, val]) => {
          if (val) params.set(key, val);
        });
      }
      const qs = params.toString();
      const url = qs ? `/berufsschulen?${qs}` : '/berufsschulen';
      const res = await api.get(url);
      const raw = res.data?.data ?? res.data;
      return Array.isArray(raw) ? raw : [];
    },
    staleTime: 30 * 60 * 1000,
  });
}

export function useSchulenCantons() {
  return useQuery({
    queryKey: ['schulen', 'cantons'] as const,
    queryFn: async (): Promise<CantonCount[]> => {
      const res = await api.get('/berufsschulen/cantons');
      const raw = res.data?.data ?? res.data;
      return Array.isArray(raw) ? raw : [];
    },
    staleTime: 30 * 60 * 1000,
  });
}
