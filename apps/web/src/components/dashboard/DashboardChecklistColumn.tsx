import type { ReactNode } from 'react';
import type { Occurrence } from '@migenda/shared';
import { Stack, Text } from '@mantine/core';

import { DashboardChecklistItem } from './DashboardChecklistItem';

type DashboardChecklistColumnProps = {
  label: string;
  occurrences: Occurrence[];
  empty?: ReactNode;
};

export function DashboardChecklistColumn({ label, occurrences, empty }: DashboardChecklistColumnProps) {
  const showEmpty = occurrences.length === 0;

  return (
    <Stack gap={12}>
      <Text className="text-[10px] uppercase tracking-[0.1em] opacity-55">{label}</Text>
      {occurrences.map((occurrence) => (
        <DashboardChecklistItem
          key={`${occurrence.eventId}-${occurrence.start}`}
          occurrence={occurrence}
        />
      ))}
      {showEmpty ? empty : null}
    </Stack>
  );
}
