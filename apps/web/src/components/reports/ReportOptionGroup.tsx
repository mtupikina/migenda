import { useId } from 'react';

import { dashboardFieldClassNames } from '../../classNames/shared';
import { reportOptionListClassName } from '../../classNames/reports';
import { ReportOption } from './ReportOption';

type ReportOptionItem<T extends string> = {
  id: T;
  label: string;
};

type ReportOptionGroupProps<T extends string> = {
  label: string;
  options: readonly ReportOptionItem<T>[];
  value: T;
  onChange: (id: T) => void;
};

export function ReportOptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: ReportOptionGroupProps<T>) {
  const labelId = useId();

  return (
    <div>
      <p id={labelId} className={`mt-0 ${dashboardFieldClassNames.label}`}>
        {label}
      </p>
      <div role="radiogroup" aria-labelledby={labelId} className={reportOptionListClassName}>
        {options.map((option) => (
          <ReportOption
            key={option.id}
            label={option.label}
            selected={option.id === value}
            onSelect={() => onChange(option.id)}
          />
        ))}
      </div>
    </div>
  );
}
