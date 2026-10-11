import { useQuery } from '@tanstack/react-query';

import { fetchDashboard } from '../api/events';
import type { DashboardRange } from '../schedule/dashboardRange';

export function useDashboard(range: DashboardRange | null, enabled: boolean) {
  return useQuery({
    queryKey: ['dashboard', range?.from, range?.to],
    queryFn: () => {
      if (!range) {
        throw new Error('Missing range');
      }
      return fetchDashboard(range);
    },
    enabled: enabled && range !== null,
  });
}
