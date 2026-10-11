import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Occurrence } from '@migenda/shared';

import { findOccurrence } from '../../schedule/findOccurrence';

export function useCalendarSearchFocus(
  occurrences: Occurrence[] | undefined,
  onFocus: (occurrence: Occurrence) => void,
) {
  const [params] = useSearchParams();
  const onFocusRef = useRef(onFocus);
  const openedFor = useRef<string | null>(null);
  onFocusRef.current = onFocus;

  const eventId = params.get('event');
  const start = params.get('occurrence');

  useEffect(() => {
    if (!eventId || !start) {
      openedFor.current = null;
      return;
    }
    if (!occurrences?.length) {
      return;
    }
    const token = `${eventId}:${start}`;
    if (openedFor.current === token) {
      return;
    }
    const found = findOccurrence(occurrences, eventId, start);
    if (!found) {
      return;
    }
    openedFor.current = token;
    onFocusRef.current(found);
  }, [eventId, occurrences, start]);
}
