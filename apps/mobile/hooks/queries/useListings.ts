import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { queryKeys } from '../queryKeys';
import type { ListingDTO, CreateListingRequest } from '@lehrstellen/shared';

export function useMyListings() {
  return useQuery({
    queryKey: queryKeys.listings.mine(),
    queryFn: async (): Promise<ListingDTO[]> => {
      const res = await api.get('/listings/mine');
      const raw = res.data;
      return Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateListingRequest> }) => {
      const res = await api.put(`/listings/${id}`, data);
      return res.data as ListingDTO;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.mine() });
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.detail(variables.id) });
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/listings/${id}`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.listings.mine() });
      const previous = queryClient.getQueryData<ListingDTO[]>(queryKeys.listings.mine());

      queryClient.setQueryData<ListingDTO[]>(queryKeys.listings.mine(), (old) =>
        (old ?? []).filter((l) => l.id !== id),
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.listings.mine(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
    },
  });
}
