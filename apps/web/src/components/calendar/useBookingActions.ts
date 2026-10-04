import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Occurrence } from '@migenda/shared';

import { completeEvent, duplicateEvent, ScheduleRequestError } from '../../api/events';

export function occurrenceKey(occurrence: Occurrence): string {
  return `${occurrence.eventId}-${occurrence.start}`;
}

export function useBookingActions(resetKey: string) {
  const queryClient = useQueryClient();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const complete = useMutation({
    mutationFn: (occurrence: Occurrence) => completeEvent(occurrence.eventId, occurrence.start),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setToast('Marked complete');
    },
    onError: (error) => {
      const message = error instanceof ScheduleRequestError ? error.message : 'Could not complete the task.';
      setToast(message);
    },
  });
  const duplicate = useMutation({
    mutationFn: (occurrence: Occurrence) => duplicateEvent(occurrence.eventId, occurrence.start, occurrence.end),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setToast(`Duplicated to ${format(new Date(result.start), 'EEEE, MMMM d')}`);
    },
    onError: (error) => {
      const message = error instanceof ScheduleRequestError ? error.message : 'Could not duplicate the task.';
      setToast(message);
    },
  });

  useEffect(() => {
    setSelectedKey(null);
    setAnchor(null);
    setToast(null);
  }, [resetKey]);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const id = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(id);
  }, [toast]);

  const select = useCallback((key: string, element: HTMLElement) => {
    setSelectedKey(key);
    setAnchor(element);
    setToast(null);
  }, []);

  const clear = useCallback(() => {
    setSelectedKey(null);
    setAnchor(null);
    setToast(null);
  }, []);

  return {
    selectedKey,
    anchor,
    toast,
    completing: complete.isPending,
    duplicating: duplicate.isPending,
    select,
    clear,
    complete: (occurrence: Occurrence) => complete.mutate(occurrence),
    duplicate: (occurrence: Occurrence) => duplicate.mutate(occurrence),
  };
}

export type BookingActions = ReturnType<typeof useBookingActions>;

export const BookingActionsContext = createContext<BookingActions | null>(null);

export function useBookingSelection(): BookingActions {
  const booking = useContext(BookingActionsContext);
  if (!booking) {
    throw new Error('Booking actions are missing');
  }
  return booking;
}
