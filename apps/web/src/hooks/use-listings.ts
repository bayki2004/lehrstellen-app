import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from './query-keys';
import type { ListingDTO, CreateListingRequest } from '@lehrstellen/shared';

export function useMyListings() {
  return useQuery({
    queryKey: queryKeys.listings.mine(),
    queryFn: async () => {
      const res = await api.get<{ data: ListingDTO[] }>('/listings/mine');
      return res.data.data;
    },
  });
}

export function useListingDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.listings.detail(id),
    queryFn: async () => {
      const res = await api.get<ListingDTO>(`/listings/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateListingRequest) => {
      const res = await api.post<ListingDTO>('/listings', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateListingRequest> }) => {
      const res = await api.put<ListingDTO>(`/listings/${id}`, data);
      return res.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.detail(id) });
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/listings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    },
  });
}
