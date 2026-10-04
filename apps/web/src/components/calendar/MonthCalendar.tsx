import type { Occurrence } from '@migenda/shared';

import { monthGridDays } from '../../calendarPeriod';
import { dashboardPanelClassName } from '../../classNames/shared';
import { dayKey } from '../../dashboardDays';
import { DayCalendarLegend } from './DayCalendarLegend';
import { MonthCalendarCell } from './MonthCalendarCell';
import { MonthCalendarWeekdays } from './MonthCalendarWeekdays';

type MonthCalendarProps = {
  occurrences: Occurrence[];
  date: Date;
};

export function MonthCalendar({ occurrences, date }: MonthCalendarProps) {
  const days = monthGridDays(date);

  return (
    <div className="mt-6">
      <DayCalendarLegend occurrences={occurrences} />
      <div className={dashboardPanelClassName}>
        <MonthCalendarWeekdays days={days} />
        <div className="grid grid-cols-7">
          {days.map((day, index) => (
            <MonthCalendarCell
              key={dayKey(day)}
              date={day}
              month={date}
              occurrences={occurrences}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
