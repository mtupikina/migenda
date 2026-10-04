import { Button, Group } from '@mantine/core';

import type { CalendarView } from '../../calendarPeriod';
import { CalendarPeriodControls } from './CalendarPeriodControls';
import { CalendarViewToggle } from './CalendarViewToggle';

type CalendarToolbarProps = {
  view: CalendarView;
  date: Date;
  newEventDisabled: boolean;
  onNewEvent: () => void;
};

export function CalendarToolbar({ view, date, newEventDisabled, onNewEvent }: CalendarToolbarProps) {
  return (
    <Group justify="space-between" align="center" wrap="wrap" gap={16}>
      <CalendarPeriodControls view={view} date={date} />
      <Group gap={16} wrap="wrap">
        <CalendarViewToggle view={view} date={date} />
        <Button onClick={onNewEvent} disabled={newEventDisabled}>
          New event
        </Button>
      </Group>
    </Group>
  );
}
