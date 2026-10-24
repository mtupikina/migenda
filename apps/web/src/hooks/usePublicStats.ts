import { useQuery } from '@tanstack/react-query';

import { fetchPublicStats } from '../api/stats';

export function usePublicStats() {
  return useQuery({
    queryKey: ['public-stats'],
    queryFn: fetchPublicStats,
    staleTime: 60_000,
  });
}
