import type { Occurrence } from '@migenda/shared';
import { addDays, differenceInMinutes, format, startOfDay } from 'date-fns';

export function dayKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function shiftDay(now: Date, days: number): string {
  return dayKey(addDays(startOfDay(now), days));
}

export function occurrencesOn(occurrences: Occurrence[], day: string): Occurrence[] {
  return occurrences
    .filter((item) => dayKey(new Date(item.start)) === day)
    .sort((left, right) => left.start.localeCompare(right.start));
}

export function countOn(occurrences: Occurrence[], day: string): number {
  return occurrencesOn(occurrences, day).length;
}

export function completedOn(occurrences: Occurrence[], day: string): number {
  return occurrencesOn(occurrences, day).filter((item) => item.completed).length;
}

export function bookedMinutes(occurrences: Occurrence[], day: string): number {
  return occurrencesOn(occurrences, day).reduce((total, item) => {
    const minutes = differenceInMinutes(new Date(item.end), new Date(item.start));
    return total + Math.max(minutes, 0);
  }, 0);
}

export function firstStartOn(occurrences: Occurrence[], day: string): string | null {
  const first = occurrencesOn(occurrences, day)[0];
  if (!first) {
    return null;
  }
  return format(new Date(first.start), 'HH:mm');
}
