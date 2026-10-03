import { WEEKDAYS } from '@migenda/shared';
import { Checkbox, Group, Text } from '@mantine/core';

import { toggleWeekday } from '../../weekdaySelection';

type WeekdayFieldProps = {
  value: number[];
  onChange: (days: number[]) => void;
  error?: string;
};

export function WeekdayField({ value, onChange, error }: WeekdayFieldProps) {
  return (
    <div>
      <Text component="p" className="mb-[5px] text-[12px] text-[color-mix(in_srgb,#201e1d_70%,transparent)]">
        Repeat
      </Text>
      <Group gap={12}>
        {WEEKDAYS.map((day) => (
          <Checkbox
            key={day.value}
            label={day.label}
            checked={value.includes(day.value)}
            onChange={(event) => onChange(toggleWeekday(value, day.value, event.currentTarget.checked))}
          />
        ))}
      </Group>
      {error ? (
        <Text c="accent.7" fz={12} mt={6}>
          {error}
        </Text>
      ) : null}
    </div>
  );
}
