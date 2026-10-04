import { useNavigate } from 'react-router-dom';
import { SegmentedControl } from '@mantine/core';

import { calendarPath, isCalendarView, type CalendarView } from '../../calendarPeriod';

const VIEWS: { label: string; value: CalendarView }[] = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
];

type CalendarViewToggleProps = {
  view: CalendarView;
  date: Date;
};

export function CalendarViewToggle({ view, date }: CalendarViewToggleProps) {
  const navigate = useNavigate();

  return (
    <SegmentedControl
      value={view}
      data={VIEWS}
      radius={0}
      onChange={(next) => {
        if (!isCalendarView(next)) {
          return;
        }
        void navigate(calendarPath(next, date));
      }}
    />
  );
}
