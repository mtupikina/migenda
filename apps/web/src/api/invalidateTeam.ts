import type { QueryClient } from '@tanstack/react-query';

import { invalidateSchedule } from './invalidateSchedule';

/** Refresh everything that depends on which team the user is working in. */
export async function invalidateTeam(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['team'] }),
    queryClient.invalidateQueries({ queryKey: ['teams'] }),
    queryClient.invalidateQueries({ queryKey: ['team-invites'] }),
    queryClient.invalidateQueries({ queryKey: ['event'] }),
    queryClient.invalidateQueries({ queryKey: ['notes'] }),
    invalidateSchedule(queryClient),
  ]);
}
