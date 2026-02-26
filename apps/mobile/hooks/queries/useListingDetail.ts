import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { queryKeys } from '../queryKeys';
import type { ListingDTO } from '@lehrstellen/shared';

export function useListingDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.listings.detail(id!),
    queryFn: async (): Promise<ListingDTO> => {
      const res = await api.get(`/listings/${id}`);
      return res.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
