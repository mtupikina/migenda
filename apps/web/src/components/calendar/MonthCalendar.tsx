import type { Occurrence } from '@migenda/shared';

import { monthGridDays } from '../../calendarPeriod';
import { dashboardPanelClassName } from '../../classNames/shared';
import { dayKey } from '../../dashboardDays';
import { DayCalendarLegend } from './DayCalendarLegend';
import { MonthCalendarCell } from './MonthCalendarCell';
import { MonthCalendarWeekdays } from './MonthCalendarWeekdays';
import { useBookingSelection } from './useBookingActions';

type MonthCalendarProps = {
  occurrences: Occurrence[];
  date: Date;
  selectedDay: string | null;
  onSelectDay: (day: Date) => void;
  onClearSlot: () => void;
};

export function MonthCalendar({ occurrences, date, selectedDay, onSelectDay, onClearSlot }: MonthCalendarProps) {
  const days = monthGridDays(date);
  const booking = useBookingSelection();

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
              selected={selectedDay === dayKey(day)}
              onSelect={() => {
                booking.clear();
                onSelectDay(day);
              }}
              onClearSlot={onClearSlot}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
