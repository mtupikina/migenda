import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

import { dayKey } from './dashboardDays';

export type CalendarView = 'day' | 'week' | 'month';

const VIEWS: CalendarView[] = ['day', 'week', 'month'];

export function isCalendarView(value: string): value is CalendarView {
  return VIEWS.some((view) => view === value);
}

export function parseCalendarDate(value: string | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime()) || dayKey(date) !== value) {
    return null;
  }
  return date;
}

export function calendarRange(view: CalendarView, date: Date): { from: string; to: string } {
  if (view === 'week') {
    const start = startOfWeek(startOfDay(date), { weekStartsOn: 1 });
    return { from: start.toISOString(), to: addDays(start, 7).toISOString() };
  }
  if (view === 'month') {
    const start = monthGridStart(date);
    return { from: start.toISOString(), to: monthGridEnd(date).toISOString() };
  }
  const start = startOfDay(date);
  return { from: start.toISOString(), to: addDays(start, 1).toISOString() };
}

export function weekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function monthGridDays(date: Date): Date[] {
  const start = monthGridStart(date);
  const count = differenceInCalendarDays(monthGridEnd(date), start);
  return Array.from({ length: count }, (_, index) => addDays(start, index));
}

function monthGridStart(date: Date): Date {
  return startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
}

function monthGridEnd(date: Date): Date {
  return addDays(startOfWeek(endOfMonth(date), { weekStartsOn: 1 }), 7);
}

export function calendarPath(view: CalendarView, date: Date): string {
  return `/calendar/${view}/${dayKey(date)}`;
}

export function shiftCalendarDate(view: CalendarView, date: Date, direction: -1 | 1): Date {
  if (view === 'day') {
    return addDays(date, direction);
  }
  if (view === 'week') {
    return addDays(date, direction * 7);
  }
  return addMonths(date, direction);
}

export function calendarHeading(view: CalendarView, date: Date): string {
  if (view === 'day') {
    return format(date, 'EEEE, MMMM d');
  }
  if (view === 'week') {
    return weekHeading(date);
  }
  return format(date, 'MMMM yyyy');
}

function weekHeading(date: Date): string {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = addDays(start, 6);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${format(start, 'MMMM d')} – ${format(end, 'd, yyyy')}`;
  }
  const sameYear = start.getFullYear() === end.getFullYear();
  if (sameYear) {
    return `${format(start, 'MMMM d')} – ${format(end, 'MMMM d, yyyy')}`;
  }
  return `${format(start, 'MMMM d, yyyy')} – ${format(end, 'MMMM d, yyyy')}`;
}
