import { useQuery } from '@tanstack/react-query';

import { fetchTeams } from '../api/team';

/** Every team the user belongs to, with the active one flagged. */
export function useTeams(enabled: boolean) {
  return useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
    enabled,
    retry: false,
  });
}
