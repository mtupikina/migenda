import { useQuery } from '@tanstack/react-query';
import { SCHEDULE_VIEW_ME } from '@migenda/shared';

import { fetchDashboard } from '../api/events';
import type { DashboardRange } from '../schedule/dashboardRange';

/** `viewing` is whose events to load: `me` (the default), `all`, or a teammate's id. */
export function useDashboard(range: DashboardRange | null, enabled: boolean, viewing: string = SCHEDULE_VIEW_ME) {
  return useQuery({
    queryKey: ['dashboard', range?.from, range?.to, viewing],
    queryFn: () => {
      if (!range) {
        throw new Error('Missing range');
      }
      return fetchDashboard(range, viewing);
    },
    enabled: enabled && range !== null,
    // Changing whose events to show keeps the calendar on screen while the new ones load.
    // Moving to another period still starts fresh.
    placeholderData: (previous, previousQuery) => {
      const sameRange = previousQuery?.queryKey[1] === range?.from && previousQuery?.queryKey[2] === range?.to;
      return sameRange ? previous : undefined;
    },
  });
}
