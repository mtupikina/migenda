import { Link } from 'react-router-dom';
import type { Occurrence } from '@migenda/shared';
import { Button, Group, SimpleGrid, Text } from '@mantine/core';

import { dayKey, occurrencesOn } from '../../dashboardDays';
import { dashboardPanelClassName } from '../../classNames/shared';
import { DashboardAllCoveredNote } from './DashboardAllCoveredNote';
import { DashboardChecklistColumn } from './DashboardChecklistColumn';
import { DashboardProgressBar } from './DashboardProgressBar';

type DashboardChecklistProps = {
  occurrences: Occurrence[];
  now: Date;
  firstName: string;
};

export function DashboardChecklist({ occurrences, now, firstName }: DashboardChecklistProps) {
  const today = occurrencesOn(occurrences, dayKey(now));
  const done = today.filter((item) => item.completed);
  const stillToCome = today.filter((item) => !item.completed);
  const date = dayKey(now);

  return (
    <div className={`${dashboardPanelClassName} flex h-full flex-col p-6 md:col-span-2`}>
      <Group gap={16} mb={20} wrap="nowrap" align="center">
        <Text className="text-[17px] font-extrabold leading-tight">Today's checklist</Text>
        <Text className="text-[13px] tabular-nums opacity-55">
          {done.length} / {today.length}
        </Text>
        <DashboardProgressBar done={done.length} total={today.length} />
      </Group>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={24}>
        <DashboardChecklistColumn label="Done" occurrences={done} />
        <DashboardChecklistColumn
          label="Still to come"
          occurrences={stillToCome}
          empty={<DashboardAllCoveredNote firstName={firstName} />}
        />
      </SimpleGrid>
      <Group justify="center" mt="auto" pt={24}>
        <Button component={Link} to={`/calendar/day/${date}`} variant="default">
          View in Calendar
        </Button>
      </Group>
    </div>
  );
}
