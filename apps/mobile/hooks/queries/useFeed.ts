import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { queryKeys } from '../queryKeys';
import type { ListingWithScoreDTO, SwipeResponse } from '@lehrstellen/shared';

export function useSwipeFeed() {
  return useQuery({
    queryKey: queryKeys.feed.list(),
    queryFn: async (): Promise<ListingWithScoreDTO[]> => {
      const response = await api.get<{ data: ListingWithScoreDTO[] }>('/swipes/feed');
      const feed = Array.isArray(response.data) ? response.data : response.data.data ?? [];
      return feed;
    },
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

export function useSwipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listingId, direction }: { listingId: string; direction: 'LEFT' | 'RIGHT' }) => {
      const response = await api.post<SwipeResponse>('/swipes/', { listingId, direction });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bewerbungen.all });
    },
  });
}
