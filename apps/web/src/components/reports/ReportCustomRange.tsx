import { SimpleGrid } from '@mantine/core';
import type { ReportRange } from '@migenda/shared';

import { EventDateField } from '../dashboard/EventDateField';

type ReportCustomRangeProps = {
  value: ReportRange;
  onChange: (range: ReportRange) => void;
  error?: string;
};

export function ReportCustomRange({ value, onChange, error }: ReportCustomRangeProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={16}>
      <EventDateField
        label="Start date"
        value={value.from}
        onChange={(from) => onChange({ ...value, from })}
      />
      <EventDateField
        label="End date"
        value={value.to}
        onChange={(to) => onChange({ ...value, to })}
        error={error}
      />
    </SimpleGrid>
  );
}
