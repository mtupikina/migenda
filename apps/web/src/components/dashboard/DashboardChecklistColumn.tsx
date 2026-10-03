import type { Occurrence } from '@migenda/shared';
import { Stack, Text } from '@mantine/core';

import { DashboardChecklistItem } from './DashboardChecklistItem';

type DashboardChecklistColumnProps = {
  label: string;
  occurrences: Occurrence[];
};

export function DashboardChecklistColumn({ label, occurrences }: DashboardChecklistColumnProps) {
  return (
    <Stack gap={12}>
      <Text className="text-[10px] uppercase tracking-[0.1em] opacity-55">{label}</Text>
      {occurrences.map((occurrence) => (
        <DashboardChecklistItem
          key={`${occurrence.eventId}-${occurrence.start}`}
          occurrence={occurrence}
        />
      ))}
    </Stack>
  );
}
