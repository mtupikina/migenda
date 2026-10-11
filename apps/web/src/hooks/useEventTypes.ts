import { useQuery } from '@tanstack/react-query';

import { fetchEventTypes } from '../api/events';

export function useEventTypes(enabled: boolean) {
  return useQuery({
    queryKey: ['event-types'],
    queryFn: fetchEventTypes,
    enabled,
  });
}
