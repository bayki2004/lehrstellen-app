import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from './query-keys';
import type { ListingDTO, MatchDTO, ApplicationDTO } from '@lehrstellen/shared';

export interface DashboardStats {
  totalListings: number;
  activeListings: number;
  totalMatches: number;
  pendingApplications: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: async (): Promise<DashboardStats> => {
      const [listingsRes, matchesRes, applicationsRes] = await Promise.all([
        api.get<{ data: ListingDTO[] }>('/listings/mine'),
        api.get<{ data: MatchDTO[] }>('/matches'),
        api.get<{ data: ApplicationDTO[] }>('/applications'),
      ]);

      const listings = listingsRes.data.data;
      const matches = matchesRes.data.data;
      const applications = applicationsRes.data.data;

      return {
        totalListings: listings.length,
        activeListings: listings.filter((l: any) => l.isActive !== false).length,
        totalMatches: matches.length,
        pendingApplications: applications.filter((a) => a.status === 'PENDING').length,
      };
    },
    staleTime: 60_000,
  });
}
