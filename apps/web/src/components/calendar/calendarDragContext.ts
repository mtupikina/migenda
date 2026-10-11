import { createContext, useContext } from 'react';

import type { DropPreview } from '../../schedule/calendarDrag';

type CalendarDrag = {
  ignoreClick: () => boolean;
};

export const CalendarDragContext = createContext<CalendarDrag | null>(null);
export const CalendarDropPreviewContext = createContext<DropPreview | null>(null);

export function useCalendarDrag(): CalendarDrag {
  const drag = useContext(CalendarDragContext);
  if (!drag) {
    throw new Error('Calendar drag is missing');
  }
  return drag;
}

export function useCalendarDropPreview(): DropPreview | null {
  return useContext(CalendarDropPreviewContext);
}
