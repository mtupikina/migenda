import type { Active } from '@dnd-kit/core';
import { format } from 'date-fns';

import { rangeIsOpen, type Dashboard, type Occurrence } from '@migenda/shared';

type MoveInput = {
  occurrence: Occurrence;
  start: string;
  end: string;
};

type Occupied = Pick<Occurrence, 'eventId' | 'seriesStart' | 'start' | 'end' | 'assigneeId'>;

export type DropPreview = {
  overId: string;
  start: string;
  end: string;
};

export function bookingDragId(occurrence: Occurrence): string {
  return `booking:${occurrence.eventId}:${occurrence.seriesStart}`;
}

export function hourDropId(day: string, hour: number): string {
  return `hour:${day}:${hour}`;
}

export function dayDropId(day: string): string {
  return `day:${day}`;
}

export function dragOccurrence(active: Active | null): Occurrence | null {
  const data = active?.data.current as { occurrence?: Occurrence } | undefined;
  return data?.occurrence ?? null;
}

export function movedRange(occurrence: Occurrence, overId: string): { start: string; end: string } | null {
  const start = new Date(occurrence.start);
  const end = new Date(occurrence.end);
  const duration = end.getTime() - start.getTime();
  if (duration <= 0) {
    return null;
  }
  const next = nextStart(overId, start);
  if (!next || next.getTime() === start.getTime()) {
    return null;
  }
  return { start: next.toISOString(), end: new Date(next.getTime() + duration).toISOString() };
}

export function openMove(occurrences: Occupied[], occurrence: Occurrence, overId: string): { start: string; end: string } | null {
  const next = movedRange(occurrence, overId);
  // Two people can be busy at the same time. Only the mover's own events can be in the way.
  const theirs = occurrences.filter((item) => item.assigneeId === occurrence.assigneeId);
  const open = next !== null && rangeIsOpen(theirs, occurrence, next.start, next.end);
  if (!next || !open) {
    return null;
  }
  return next;
}

export function dropPreview(occurrences: Occupied[], occurrence: Occurrence | null, overId: string): DropPreview | null {
  if (!occurrence || !overId) {
    return null;
  }
  const next = openMove(occurrences, occurrence, overId);
  if (!next) {
    return null;
  }
  return { overId, start: next.start, end: next.end };
}

export function sameDropPreview(current: DropPreview | null, next: DropPreview | null): boolean {
  if (!current || !next) {
    return current === next;
  }
  return current.overId === next.overId && current.start === next.start && current.end === next.end;
}

export function hourDropTarget(overId: string): { day: string; hour: number } | null {
  const match = /^hour:(\d{4}-\d{2}-\d{2}):(\d{1,2})$/.exec(overId);
  if (!match) {
    return null;
  }
  const hour = Number(match[2]);
  if (hour < 0 || hour > 23) {
    return null;
  }
  return { day: match[1], hour };
}

export function originalSlotLabel(occurrence: Occurrence, withTime: boolean): string {
  const pattern = withTime ? 'HH:mm' : 'MMM d';
  return `${occurrence.title} — ${format(new Date(occurrence.start), pattern)} (original slot)`;
}

export function shiftCachedOccurrence(current: Dashboard | undefined, input: MoveInput): Dashboard | undefined {
  if (!current) {
    return current;
  }
  return {
    ...current,
    occurrences: current.occurrences.map((item) => shiftOne(item, input)),
  };
}

export function updateOccurrenceId(
  current: Dashboard | undefined,
  previousEventId: string,
  start: string,
  nextEventId: string,
): Dashboard | undefined {
  if (!current) {
    return current;
  }
  return {
    ...current,
    occurrences: current.occurrences.map((item) => {
      const match = item.eventId === previousEventId && item.start === start;
      if (!match) {
        return item;
      }
      return { ...item, eventId: nextEventId, seriesStart: start };
    }),
  };
}

function shiftOne(item: Occurrence, input: MoveInput): Occurrence {
  const same = item.eventId === input.occurrence.eventId && item.seriesStart === input.occurrence.seriesStart;
  if (!same) {
    return item;
  }
  return { ...item, start: input.start, end: input.end, seriesStart: input.start, repeating: false };
}

function nextStart(overId: string, current: Date): Date | null {
  const hour = hourDropTarget(overId);
  if (hour) {
    return localDate(hour.day, hour.hour, 0, 0, 0);
  }
  const day = dayDropTarget(overId);
  if (!day) {
    return null;
  }
  return localDate(day, current.getHours(), current.getMinutes(), current.getSeconds(), current.getMilliseconds());
}

function dayDropTarget(overId: string): string | null {
  const match = /^day:(\d{4}-\d{2}-\d{2})$/.exec(overId);
  if (!match) {
    return null;
  }
  return match[1];
}

function localDate(day: string, hour: number, minute: number, second: number, ms: number): Date {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year, month - 1, date, hour, minute, second, ms);
}
