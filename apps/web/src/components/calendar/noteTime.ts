import { format, isToday, isYesterday } from 'date-fns';

export function formatNoteTime(iso: string): string {
  const date = new Date(iso);
  const clock = format(date, 'HH:mm');
  if (isToday(date)) {
    return `Today, ${clock}`;
  }
  if (isYesterday(date)) {
    return `Yesterday, ${clock}`;
  }
  return `${format(date, 'MMMM d')}, ${clock}`;
}
