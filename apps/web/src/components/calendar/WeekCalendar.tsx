import { useLayoutEffect, useRef } from 'react';
import type { Occurrence } from '@migenda/shared';

import { weekDays } from '../../calendarPeriod';
import { dayKey } from '../../dashboardDays';
import { dashboardPanelClassName } from '../../classNames/shared';
import { DayCalendarLegend } from './DayCalendarLegend';
import { WeekCalendarColumn } from './WeekCalendarColumn';
import { WeekCalendarDayHeader } from './WeekCalendarDayHeader';
import { DAY_CALENDAR_HOURS } from './dayCalendarLayout';
import { WEEK_CALENDAR_HOUR_PX, WEEK_CALENDAR_OPEN_HOUR } from './weekCalendarLayout';
import { useBookingSelection } from './useBookingActions';

type WeekCalendarProps = {
  occurrences: Occurrence[];
  date: Date;
  selectedDay: string | null;
  selectedHour: number | null;
  onSelectSlot: (day: Date, hour: number) => void;
  onClearSlot: () => void;
};

export function WeekCalendar({
  occurrences,
  date,
  selectedDay,
  selectedHour,
  onSelectSlot,
  onClearSlot,
}: WeekCalendarProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const days = weekDays(date);
  const weekKey = dayKey(days[0]);
  const booking = useBookingSelection();

  useLayoutEffect(() => {
    const node = scroller.current;
    if (!node) {
      return;
    }
    node.scrollTop = WEEK_CALENDAR_OPEN_HOUR * WEEK_CALENDAR_HOUR_PX;
  }, [weekKey]);

  return (
    <div className="mt-6">
      <DayCalendarLegend occurrences={occurrences} />
      <div className={dashboardPanelClassName}>
        <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b-2 border-[color-mix(in_srgb,#201e1d_28%,transparent)]">
          <div aria-hidden="true"> </div>
          {days.map((day) => (
            <WeekCalendarDayHeader key={dayKey(day)} date={day} />
          ))}
        </div>
        <div ref={scroller} className="h-[400px] overflow-y-auto bg-[#f7f6f6]">
          <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))]">
            <div>
              {DAY_CALENDAR_HOURS.map((hour) => (
                <div
                  key={hour}
                  className="h-10 border-t border-[color-mix(in_srgb,#201e1d_14%,transparent)] px-2 pt-1 text-[11px] tabular-nums text-[color-mix(in_srgb,#201e1d_55%,transparent)]"
                >
                  {`${String(hour).padStart(2, '0')}:00`}
                </div>
              ))}
            </div>
            {days.map((day) => (
              <WeekCalendarColumn
                key={dayKey(day)}
                date={day}
                occurrences={occurrences}
                selectedHour={selectedDay === dayKey(day) ? selectedHour : null}
                onSelectHour={(hour) => {
                  booking.clear();
                  onSelectSlot(day, hour);
                }}
                onClearSlot={onClearSlot}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
