import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from './query-keys';
import type { MatchDTO, MessageDTO } from '@lehrstellen/shared';

export function useMatches() {
  return useQuery({
    queryKey: queryKeys.matches.list(),
    queryFn: async () => {
      const res = await api.get<{ data: MatchDTO[] }>('/matches');
      return res.data.data;
    },
  });
}

export function useMatchDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.matches.detail(id),
    queryFn: async () => {
      const res = await api.get<MatchDTO>(`/matches/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useChatMessages(matchId: string) {
  return useQuery({
    queryKey: queryKeys.chat.messages(matchId),
    queryFn: async () => {
      const res = await api.get<{ data: MessageDTO[] }>(`/chat/${matchId}/messages`);
      return res.data.data;
    },
    enabled: !!matchId,
    refetchInterval: false,
  });
}
