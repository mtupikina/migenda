import { useNavigate } from 'react-router-dom';
import { Button, Group, Title } from '@mantine/core';
import { startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { calendarHeading, calendarPath, shiftCalendarDate, type CalendarView } from '../../calendarPeriod';

type CalendarPeriodControlsProps = {
  view: CalendarView;
  date: Date;
};

export function CalendarPeriodControls({ view, date }: CalendarPeriodControlsProps) {
  const navigate = useNavigate();
  const open = (next: Date) => {
    void navigate(calendarPath(view, next));
  };

  return (
    <Group gap={16} wrap="wrap" align="center">
      <Title order={1} fz={28} fw={800}>
        {calendarHeading(view, date)}
      </Title>
      <Group gap={2} wrap="nowrap">
        <Button
          variant="default"
          aria-label={`Previous ${view}`}
          px={10}
          onClick={() => open(shiftCalendarDate(view, date, -1))}
        >
          <ChevronLeft size={16} />
        </Button>
        <Button
          variant="default"
          aria-label={`Next ${view}`}
          px={10}
          onClick={() => open(shiftCalendarDate(view, date, 1))}
        >
          <ChevronRight size={16} />
        </Button>
      </Group>
      <Button variant="subtle" color="accent" onClick={() => open(startOfDay(new Date()))}>
        Today
      </Button>
    </Group>
  );
}
