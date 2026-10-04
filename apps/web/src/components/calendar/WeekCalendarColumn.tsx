import type { Occurrence } from '@migenda/shared';

import { dayKey, occurrencesOn } from '../../dashboardDays';
import { WeekCalendarBlock } from './WeekCalendarBlock';
import { DAY_CALENDAR_HOURS } from './dayCalendarLayout';

type WeekCalendarColumnProps = {
  date: Date;
  occurrences: Occurrence[];
};

export function WeekCalendarColumn({ date, occurrences }: WeekCalendarColumnProps) {
  const events = occurrencesOn(occurrences, dayKey(date));
  const weekend = date.getDay() === 0 || date.getDay() === 6;
  const columnClass = weekend
    ? 'relative border-l border-[color-mix(in_srgb,#201e1d_14%,transparent)] bg-[color-mix(in_srgb,#201e1d_4%,transparent)]'
    : 'relative border-l border-[color-mix(in_srgb,#201e1d_14%,transparent)]';

  return (
    <div className={columnClass}>
      {DAY_CALENDAR_HOURS.map((hour) => (
        <div key={hour} className="h-10 border-t border-[color-mix(in_srgb,#201e1d_14%,transparent)]" />
      ))}
      {events.map((occurrence) => (
        <WeekCalendarBlock key={`${occurrence.eventId}-${occurrence.start}`} occurrence={occurrence} />
      ))}
    </div>
  );
}
