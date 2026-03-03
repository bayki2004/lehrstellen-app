import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from './query-keys';
import type { CompanyCulturePresetDTO } from '@lehrstellen/shared';

export function useCulturePresets() {
  return useQuery({
    queryKey: queryKeys.culturePresets.all(),
    queryFn: async () => {
      const res = await api.get<{ data: CompanyCulturePresetDTO[] }>('/companies/culture-presets');
      return res.data.data;
    },
  });
}
