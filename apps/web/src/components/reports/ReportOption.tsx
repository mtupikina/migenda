import { UnstyledButton } from '@mantine/core';

import { reportOptionClassName } from '../../classNames/reports';

type ReportOptionProps = {
  label: string;
  selected: boolean;
  onSelect: () => void;
};

export function ReportOption({ label, selected, onSelect }: ReportOptionProps) {
  return (
    <UnstyledButton
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={reportOptionClassName(selected)}
    >
      {label}
    </UnstyledButton>
  );
}
