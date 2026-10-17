import type { ReactNode } from 'react';
import { Button, Group } from '@mantine/core';

import type { CalendarView } from '../../schedule/calendarPeriod';
import { CalendarPeriodControls } from './CalendarPeriodControls';
import { CalendarViewToggle } from './CalendarViewToggle';

type CalendarToolbarProps = {
  view: CalendarView;
  date: Date;
  newEventDisabled: boolean;
  onNewEvent: () => void;
  onBlockTime?: () => void;
  /** Extra controls, shown before the view toggle. */
  children?: ReactNode;
};

export function CalendarToolbar({
  view,
  date,
  newEventDisabled,
  onNewEvent,
  onBlockTime,
  children,
}: CalendarToolbarProps) {
  return (
    <Group justify="space-between" align="center" wrap="wrap" gap={16}>
      <CalendarPeriodControls view={view} date={date} />
      <Group gap={16} wrap="wrap">
        {children}
        <CalendarViewToggle view={view} date={date} />
        {onBlockTime ? (
          <Button variant="default" onClick={onBlockTime} disabled={newEventDisabled}>
            Block time
          </Button>
        ) : null}
        <Button onClick={onNewEvent} disabled={newEventDisabled}>
          New event
        </Button>
      </Group>
    </Group>
  );
}
