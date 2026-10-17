import { useQuery } from '@tanstack/react-query';

import { fetchTeam } from '../api/team';

export function useTeam(enabled: boolean) {
  return useQuery({
    queryKey: ['team'],
    queryFn: fetchTeam,
    enabled,
    retry: false,
  });
}
