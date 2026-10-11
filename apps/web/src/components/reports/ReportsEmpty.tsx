import { Link } from 'react-router-dom';
import { Button, Stack, Text } from '@mantine/core';
import { FileText } from 'lucide-react';

import { dashboardPanelClassName } from '../../classNames/shared';
import { dayKey } from '../../schedule/dashboardDays';

export function ReportsEmpty() {
  return (
    <div
      className={`${dashboardPanelClassName} flex flex-col items-center justify-center gap-4 px-8 py-16 text-center`}
    >
      <FileText aria-hidden size={72} strokeWidth={1.5} className="opacity-35" />
      <Stack gap={8} maw="42ch">
        <Text className="text-[20px] font-extrabold leading-tight">No reports to run yet</Text>
        <Text className="text-[14px] opacity-65">
          Reports are built from your events. Create an event, then come back to pick a type and
          time period.
        </Text>
      </Stack>
      <Button component={Link} to={`/calendar/day/${dayKey(new Date())}`}>
        Open Calendar
      </Button>
    </div>
  );
}
