import { format } from 'date-fns';

import { dayKey } from '../../dashboardDays';

type MonthCalendarWeekdaysProps = {
  days: Date[];
};

export function MonthCalendarWeekdays({ days }: MonthCalendarWeekdaysProps) {
  return (
    <div className="grid grid-cols-7 border-b-2 border-[color-mix(in_srgb,#201e1d_28%,transparent)]">
      {days.slice(0, 7).map((day) => (
        <div
          key={dayKey(day)}
          className="px-0.5 py-2 text-center text-[11px] tracking-wide text-[color-mix(in_srgb,#201e1d_55%,transparent)] uppercase"
        >
          {format(day, 'EEE')}
        </div>
      ))}
    </div>
  );
}
