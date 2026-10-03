import { DatePickerInput } from '@mantine/dates';

import { dashboardFieldClassNames } from '../../classNames/shared';
import { toFormDate } from '../../eventDateValue';

type EventDateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function EventDateField({ label, value, onChange, error }: EventDateFieldProps) {
  return (
    <DatePickerInput
      label={label}
      value={value || null}
      onChange={(next) => onChange(toFormDate(next))}
      error={error}
      valueFormat="DD.MM.YYYY"
      firstDayOfWeek={1}
      clearable
      popoverProps={{ radius: 0, shadow: 'md' }}
      classNames={dashboardFieldClassNames}
    />
  );
}
