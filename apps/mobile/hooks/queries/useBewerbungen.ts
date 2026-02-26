import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { queryKeys } from '../queryKeys';
import type { UnifiedBewerbungItem, BewerbungSegment } from '../../types/bewerbung.types';

export function useBewerbungen() {
  return useQuery({
    queryKey: queryKeys.bewerbungen.list(),
    queryFn: async (): Promise<UnifiedBewerbungItem[]> => {
      const response = await api.get<{ data: UnifiedBewerbungItem[] }>('/applications');
      const raw = response.data;
      const list = Array.isArray(raw) ? raw : (raw && typeof raw === 'object' && Array.isArray((raw as any).data)) ? (raw as any).data : [];
      return list;
    },
    staleTime: 2 * 60 * 1000, // 2 min
  });
}

export interface SubmitBewerbungPayload {
  matchId: string;
  motivationsschreiben?: string;
  verfuegbarkeit?: string;
  relevanteErfahrungen?: string[];
  fragenAnBetrieb?: string;
  schnupperlehreWunsch?: boolean;
}

export function useSubmitBewerbung() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SubmitBewerbungPayload) => {
      await api.post('/applications', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bewerbungen.all });
    },
  });
}

export function useDismissMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchId: string) => {
      await api.delete(`/matches/${matchId}`);
    },
    onMutate: async (matchId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.bewerbungen.list() });
      const previous = queryClient.getQueryData<UnifiedBewerbungItem[]>(queryKeys.bewerbungen.list());

      queryClient.setQueryData<UnifiedBewerbungItem[]>(queryKeys.bewerbungen.list(), (old) =>
        (old ?? []).filter((b) => b.matchId !== matchId),
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.bewerbungen.list(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bewerbungen.all });
    },
  });
}

export function useWithdrawBewerbung() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationId: string) => {
      await api.put(`/applications/${applicationId}/status`, { status: 'WITHDRAWN' });
    },
    onMutate: async (applicationId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.bewerbungen.list() });
      const previous = queryClient.getQueryData<UnifiedBewerbungItem[]>(queryKeys.bewerbungen.list());

      queryClient.setQueryData<UnifiedBewerbungItem[]>(queryKeys.bewerbungen.list(), (old) =>
        (old ?? []).map((b) =>
          b.applicationId === applicationId
            ? { ...b, segment: 'erledigt' as BewerbungSegment, applicationStatus: 'WITHDRAWN' }
            : b,
        ),
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.bewerbungen.list(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bewerbungen.all });
    },
  });
}
