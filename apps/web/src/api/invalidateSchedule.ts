import type { QueryClient } from '@tanstack/react-query';

export async function invalidateSchedule(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    queryClient.invalidateQueries({ queryKey: ['search'] }),
    queryClient.invalidateQueries({ queryKey: ['report'] }),
    queryClient.invalidateQueries({ queryKey: ['event-types'] }),
  ]);
}
