import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

const FAVORITES_KEY = ['berufe', 'favorites'] as const;

export function useFavoriteBerufe() {
  return useQuery({
    queryKey: [...FAVORITES_KEY],
    queryFn: async (): Promise<string[]> => {
      const response = await api.get('/berufe/favorites');
      const raw = response.data?.data ?? response.data;
      return Array.isArray(raw) ? raw : [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useToggleFavoriteBeruf() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const response = await api.post(`/berufe/${code}/favorite`);
      return response.data?.data ?? response.data;
    },
    onMutate: async (code) => {
      await queryClient.cancelQueries({ queryKey: [...FAVORITES_KEY] });
      const previous = queryClient.getQueryData<string[]>([...FAVORITES_KEY]) ?? [];

      const next = previous.includes(code)
        ? previous.filter((c) => c !== code)
        : [...previous, code];

      queryClient.setQueryData([...FAVORITES_KEY], next);
      return { previous };
    },
    onError: (_err, _code, context) => {
      queryClient.setQueryData([...FAVORITES_KEY], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [...FAVORITES_KEY] });
    },
  });
}
