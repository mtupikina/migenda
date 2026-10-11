import type { Occurrence } from '@migenda/shared';

import { dayKey, occurrencesOn } from '../../schedule/dashboardDays';
import { CalendarHourDropMarker } from './CalendarHourDropMarker';
import { WeekCalendarBlock } from './WeekCalendarBlock';
import { WeekCalendarSlot } from './WeekCalendarSlot';
import { DAY_CALENDAR_HOURS } from './dayCalendarLayout';
import { WEEK_CALENDAR_HOUR_PX } from './weekCalendarLayout';
import { occurrenceKey, useBookingSelection } from './useBookingActions';

type WeekCalendarColumnProps = {
  date: Date;
  occurrences: Occurrence[];
  selectedHour: number | null;
  onSelectHour: (hour: number) => void;
  onClearSlot: () => void;
};

export function WeekCalendarColumn({
  date,
  occurrences,
  selectedHour,
  onSelectHour,
  onClearSlot,
}: WeekCalendarColumnProps) {
  const booking = useBookingSelection();
  const viewedDay = dayKey(date);
  const events = occurrencesOn(occurrences, viewedDay);
  const weekend = date.getDay() === 0 || date.getDay() === 6;
  const columnClass = weekend
    ? 'relative border-l border-[color-mix(in_srgb,#201e1d_14%,transparent)] bg-[color-mix(in_srgb,#201e1d_4%,transparent)]'
    : 'relative border-l border-[color-mix(in_srgb,#201e1d_14%,transparent)]';

  return (
    <div className={columnClass}>
      {DAY_CALENDAR_HOURS.map((hour) => (
        <WeekCalendarSlot
          key={hour}
          date={date}
          hour={hour}
          selected={hour === selectedHour}
          onSelect={(nextHour) => booking.pickSlot(() => onSelectHour(nextHour))}
        />
      ))}
      <CalendarHourDropMarker day={viewedDay} hourPx={WEEK_CALENDAR_HOUR_PX} insetClass="right-1 left-1" />
      {events.map((occurrence) => {
        const key = occurrenceKey(occurrence);
        const selected = key === booking.selectedKey;
        return (
          <WeekCalendarBlock
            key={key}
            occurrence={occurrence}
            selected={selected}
            onSelect={(anchor) => {
              onClearSlot();
              booking.toggle(key, anchor);
            }}
          />
        );
      })}
    </div>
  );
}
