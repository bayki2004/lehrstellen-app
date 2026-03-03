import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from './query-keys';
import type { ApplicationDTO, ApplicationDossierDTO, UpdateApplicationStatusRequest } from '@lehrstellen/shared';

export function useApplications() {
  return useQuery({
    queryKey: queryKeys.applications.list(),
    queryFn: async () => {
      const res = await api.get<{ data: ApplicationDTO[] }>('/applications');
      return res.data.data;
    },
  });
}

export function useApplicationDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.applications.detail(id),
    queryFn: async () => {
      const res = await api.get<ApplicationDTO>(`/applications/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useApplicationDossier(id: string, enabled: boolean) {
  return useQuery({
    queryKey: [...queryKeys.applications.detail(id), 'dossier'],
    queryFn: async () => {
      const res = await api.get<ApplicationDossierDTO>(`/applications/${id}/dossier`);
      return res.data;
    },
    enabled: !!id && enabled,
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateApplicationStatusRequest;
    }) => {
      const res = await api.put(`/applications/${id}/status`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    },
  });
}
