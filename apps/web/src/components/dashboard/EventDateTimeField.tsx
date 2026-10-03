import { DateTimePicker } from '@mantine/dates';

import { dashboardFieldClassNames } from '../../classNames/shared';
import { toFormDateTime } from '../../eventDateValue';

type EventDateTimeFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function EventDateTimeField({ label, value, onChange, error }: EventDateTimeFieldProps) {
  return (
    <DateTimePicker
      label={label}
      value={value || null}
      onChange={(next) => onChange(toFormDateTime(next))}
      error={error}
      valueFormat="DD.MM.YYYY, HH:mm"
      firstDayOfWeek={1}
      clearable={false}
      timePickerProps={{ format: '24h' }}
      submitButtonProps={{ color: 'accent', variant: 'filled', 'aria-label': 'Apply date and time' }}
      popoverProps={{ radius: 0, shadow: 'md' }}
      classNames={dashboardFieldClassNames}
    />
  );
}
