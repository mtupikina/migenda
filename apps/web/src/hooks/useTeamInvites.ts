import { useQuery } from '@tanstack/react-query';

import { fetchTeamInvites } from '../api/team';

export function useTeamInvites(enabled: boolean) {
  return useQuery({
    queryKey: ['team-invites'],
    queryFn: fetchTeamInvites,
    enabled,
    retry: false,
  });
}
