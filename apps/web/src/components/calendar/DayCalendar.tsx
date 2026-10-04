import { useLayoutEffect, useRef } from 'react';
import type { Occurrence } from '@migenda/shared';

import { dayKey, occurrencesOn } from '../../dashboardDays';
import { dashboardPanelClassName } from '../../classNames/shared';
import { DayCalendarBlock } from './DayCalendarBlock';
import { DayCalendarLegend } from './DayCalendarLegend';
import { DayCalendarNow } from './DayCalendarNow';
import { DayCalendarSlot } from './DayCalendarSlot';
import {
  DAY_CALENDAR_HOUR_PX,
  DAY_CALENDAR_HOURS,
  DAY_CALENDAR_OPEN_HOUR,
} from './dayCalendarLayout';
import { occurrenceKey, useBookingSelection } from './useBookingActions';

type DayCalendarProps = {
  occurrences: Occurrence[];
  date: Date;
  selectedHour: number | null;
  onSelectHour: (hour: number) => void;
  onClearHour: () => void;
};

export function DayCalendar({ occurrences, date, selectedHour, onSelectHour, onClearHour }: DayCalendarProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const viewedDay = dayKey(date);
  const day = occurrencesOn(occurrences, viewedDay);
  const isToday = viewedDay === dayKey(new Date());
  const booking = useBookingSelection();

  useLayoutEffect(() => {
    const node = scroller.current;
    if (!node) {
      return;
    }
    node.scrollTop = DAY_CALENDAR_OPEN_HOUR * DAY_CALENDAR_HOUR_PX;
  }, [viewedDay]);

  return (
    <div className="mx-auto mt-6 max-w-[520px]">
      <DayCalendarLegend occurrences={day} />
      <div className={dashboardPanelClassName}>
        <div ref={scroller} className="h-[720px] overflow-y-auto bg-[#f7f6f6]">
          <div className="grid grid-cols-[64px_1fr]">
            <div>
              {DAY_CALENDAR_HOURS.map((hour) => (
                <div
                  key={hour}
                  className="h-16 border-t border-[color-mix(in_srgb,#201e1d_14%,transparent)] px-2 pt-1 text-[11px] tabular-nums text-[color-mix(in_srgb,#201e1d_55%,transparent)]"
                >
                  {`${String(hour).padStart(2, '0')}:00`}
                </div>
              ))}
            </div>
            <div className="relative border-l-2 border-[color-mix(in_srgb,#201e1d_28%,transparent)]">
              {DAY_CALENDAR_HOURS.map((hour) => (
                <DayCalendarSlot
                  key={hour}
                  hour={hour}
                  selected={hour === selectedHour}
                  onSelect={(hour) => {
                    booking.clear();
                    onSelectHour(hour);
                  }}
                />
              ))}
              {day.map((occurrence) => {
                const key = occurrenceKey(occurrence);
                return (
                  <DayCalendarBlock
                    key={key}
                    occurrence={occurrence}
                    selected={key === booking.selectedKey}
                    onSelect={(anchor) => {
                      onClearHour();
                      booking.select(key, anchor);
                    }}
                  />
                );
              })}
              {isToday ? <DayCalendarNow /> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
