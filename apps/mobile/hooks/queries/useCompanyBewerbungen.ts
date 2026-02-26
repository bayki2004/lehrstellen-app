import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { queryKeys } from '../queryKeys';

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId, status, note }: {
      applicationId: string;
      status: string;
      note?: string;
    }) => {
      await api.put(`/applications/${applicationId}/status`, { status, note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bewerbungen.all });
    },
  });
}
