import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { queryKeys } from '../queryKeys';
import type { ApplicationDossierDTO } from '@lehrstellen/shared';

export function useApplicationDossier(applicationId: string, enabled = false) {
  return useQuery({
    queryKey: queryKeys.applications.dossier(applicationId),
    queryFn: async (): Promise<ApplicationDossierDTO> => {
      const res = await api.get(`/applications/${applicationId}/dossier`);
      return res.data;
    },
    enabled: !!applicationId && enabled,
    staleTime: 5 * 60 * 1000,
  });
}
