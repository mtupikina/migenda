import { Link } from 'react-router-dom';
import { Button, Group, Stack, Text } from '@mantine/core';
import { CalendarCheck } from 'lucide-react';

import { dayKey } from '../../dashboardDays';
import { dashboardPanelClassName } from '../../classNames/shared';

type DashboardEmptyChecklistProps = {
  now: Date;
};

export function DashboardEmptyChecklist({ now }: DashboardEmptyChecklistProps) {
  const date = dayKey(now);

  return (
    <div
      className={`${dashboardPanelClassName} flex h-full flex-col items-center justify-center gap-4 px-8 py-16 text-center md:col-span-2`}
    >
      <CalendarCheck aria-hidden size={72} strokeWidth={1.5} className="opacity-35" />
      <Stack gap={8} maw="42ch">
        <Text className="text-[20px] font-extrabold leading-tight">Nothing scheduled yet</Text>
        <Text className="text-[14px] opacity-65">
          Start adding tasks to see them appear here, or invite your team to start
          filling in the week.
        </Text>
      </Stack>
      <Group gap={12} justify="center">
        <Button component={Link} to={`/calendar/day/${date}`}>
          Open Calendar
        </Button>
        <Button component={Link} to="/team" variant="default">
          Invite your team
        </Button>
      </Group>
    </div>
  );
}
