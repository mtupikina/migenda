import { addDays, differenceInMinutes, startOfDay } from 'date-fns';

const MIN_MINUTES = 15;

export function blockBox(startIso: string, endIso: string, hourPx: number): { top: number; height: number } {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const dayStart = startOfDay(start);
  const dayEnd = addDays(dayStart, 1);
  const visibleEnd = end < dayEnd ? end : dayEnd;
  const topMinutes = differenceInMinutes(start, dayStart);
  const heightMinutes = Math.max(differenceInMinutes(visibleEnd, start), MIN_MINUTES);

  return {
    top: (topMinutes / 60) * hourPx,
    height: (heightMinutes / 60) * hourPx,
  };
}

export const MINI_CALENDAR_HOUR_PX = 40;
export const MINI_CALENDAR_HOURS = Array.from({ length: 24 }, (_, hour) => hour);
export const MINI_CALENDAR_OPEN_HOUR = 8;
