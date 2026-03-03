import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from './query-keys';
import type { CompanyProfileDTO, UpdateCompanyProfileRequest } from '@lehrstellen/shared';

export function useCompanyProfile() {
  return useQuery({
    queryKey: queryKeys.companyProfile.me(),
    queryFn: async () => {
      const res = await api.get<CompanyProfileDTO>('/companies/me');
      return res.data;
    },
  });
}

export function useUpdateCompanyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateCompanyProfileRequest) => {
      const res = await api.put<CompanyProfileDTO>('/companies/me', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companyProfile.all });
    },
  });
}
