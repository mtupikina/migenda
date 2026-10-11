import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Occurrence } from '@migenda/shared';

import { completeEvent, deleteTimeBlock, duplicateEvent, ScheduleRequestError } from '../../api/events';
import { invalidateSchedule } from '../../api/invalidateSchedule';

export function occurrenceKey(occurrence: Occurrence): string {
  return `${occurrence.eventId}-${occurrence.seriesStart}`;
}

export function useBookingActions(resetKey: string) {
  const queryClient = useQueryClient();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const complete = useMutation({
    mutationFn: (occurrence: Occurrence) => completeEvent(occurrence.eventId, occurrence.seriesStart),
    onSuccess: async () => {
      await invalidateSchedule(queryClient);
      setToast('Marked complete');
    },
    onError: (error) => {
      const message = error instanceof ScheduleRequestError ? error.message : 'Could not complete the task.';
      setToast(message);
    },
  });
  const duplicate = useMutation({
    mutationFn: (occurrence: Occurrence) => duplicateEvent(occurrence.eventId, occurrence.seriesStart, occurrence.end),
    onSuccess: async (result) => {
      await invalidateSchedule(queryClient);
      setToast(`Duplicated to ${format(new Date(result.start), 'EEEE, MMMM d')}`);
    },
    onError: (error) => {
      const message = error instanceof ScheduleRequestError ? error.message : 'Could not duplicate the task.';
      setToast(message);
    },
  });
  const unblock = useMutation({
    mutationFn: (occurrence: Occurrence) => deleteTimeBlock(occurrence.eventId),
    onSuccess: async () => {
      await invalidateSchedule(queryClient);
      setToast('Time unblocked');
      clear();
    },
    onError: (error) => {
      const message = error instanceof ScheduleRequestError ? error.message : 'Could not unblock this time.';
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

  const toggle = useCallback(
    (key: string, element: HTMLElement) => {
      if (selectedKey === key) {
        clear();
        return;
      }
      select(key, element);
    },
    [clear, select, selectedKey],
  );

  const pickSlot = useCallback(
    (open: () => void) => {
      if (selectedKey) {
        clear();
        return;
      }
      open();
    },
    [clear, selectedKey],
  );

  return {
    selectedKey,
    anchor,
    toast,
    completing: complete.isPending,
    duplicating: duplicate.isPending,
    unblocking: unblock.isPending,
    select,
    toggle,
    pickSlot,
    clear,
    notify: (message: string) => setToast(message),
    complete: (occurrence: Occurrence) => complete.mutate(occurrence),
    duplicate: (occurrence: Occurrence) => duplicate.mutate(occurrence),
    unblock: (occurrence: Occurrence) => unblock.mutate(occurrence),
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
