import { useMemo, useRef, useState, type ReactNode } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Dashboard, Occurrence } from '@migenda/shared';

import { moveEvent, ScheduleRequestError } from '../../api/events';
import { invalidateSchedule } from '../../api/invalidateSchedule';
import {
  dragOccurrence,
  dropPreview,
  movedRange,
  openMove,
  sameDropPreview,
  shiftCachedOccurrence,
  updateOccurrenceId,
  type DropPreview,
} from '../../schedule/calendarDrag';
import { CalendarDragOverlay } from './CalendarDragOverlay';
import { CalendarDragContext, CalendarDropPreviewContext } from './calendarDragContext';
import { useBookingSelection } from './useBookingActions';

type MoveInput = {
  occurrence: Occurrence;
  start: string;
  end: string;
};

type CalendarDragProviderProps = {
  occurrences: Occurrence[];
  children: ReactNode;
};

export function CalendarDragProvider({ occurrences, children }: CalendarDragProviderProps) {
  const queryClient = useQueryClient();
  const booking = useBookingSelection();
  const [active, setActive] = useState<Occurrence | null>(null);
  const [preview, setPreview] = useState<DropPreview | null>(null);
  const ignoreClick = useRef(false);
  const drag = useMemo(() => ({ ignoreClick: () => ignoreClick.current }), []);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const move = useMutation({
    mutationFn: (input: MoveInput) => moveEvent(input.occurrence.eventId, input.occurrence.seriesStart, input.start),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ['dashboard'] });
      queryClient.setQueriesData<Dashboard>({ queryKey: ['dashboard'] }, (current) => shiftCachedOccurrence(current, input));
    },
    onSuccess: (result, input) => {
      queryClient.setQueriesData<Dashboard>({ queryKey: ['dashboard'] }, (current) =>
        updateOccurrenceId(current, input.occurrence.eventId, result.start, result.id),
      );
    },
    onError: (error) => {
      const message = error instanceof ScheduleRequestError ? error.message : 'Could not move the task.';
      booking.notify(message);
    },
    onSettled: async (result, _error, input) => {
      await invalidateSchedule(queryClient);
      await queryClient.invalidateQueries({ queryKey: ['event', input.occurrence.eventId] });
      if (result?.id) {
        await queryClient.invalidateQueries({ queryKey: ['event', result.id] });
      }
    },
  });

  const releaseClick = () => {
    ignoreClick.current = true;
    window.setTimeout(() => {
      ignoreClick.current = false;
    }, 0);
  };
  const finishDrag = () => {
    setActive(null);
    setPreview(null);
    releaseClick();
  };
  const onDragStart = (event: DragStartEvent) => {
    setActive(dragOccurrence(event.active));
    setPreview(null);
    booking.clear();
  };
  const onDragOver = (event: DragOverEvent) => {
    const overId = event.over ? String(event.over.id) : '';
    const next = dropPreview(occurrences, dragOccurrence(event.active), overId);
    setPreview((current) => (sameDropPreview(current, next) ? current : next));
  };
  const onDragEnd = (event: DragEndEvent) => {
    const occurrence = dragOccurrence(event.active);
    finishDrag();
    if (!occurrence || !event.over) {
      return;
    }
    const overId = String(event.over.id);
    const landed = movedRange(occurrence, overId);
    if (!landed) {
      return;
    }
    const next = openMove(occurrences, occurrence, overId);
    if (!next) {
      booking.notify('That time is already booked');
      return;
    }
    move.mutate({ occurrence, start: next.start, end: next.end });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragCancel={finishDrag}
      onDragEnd={onDragEnd}
    >
      <CalendarDropPreviewContext.Provider value={preview}>
        <CalendarDragContext.Provider value={drag}>{children}</CalendarDragContext.Provider>
      </CalendarDropPreviewContext.Provider>
      <DragOverlay dropAnimation={null}>{active ? <CalendarDragOverlay occurrence={active} /> : null}</DragOverlay>
    </DndContext>
  );
}
