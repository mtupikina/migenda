import type { ReportStatus } from '@migenda/shared';
import { Check, Clock, X } from 'lucide-react';

import { reportStatusClassName } from '../../classNames/reports';
import { reportStatusLabel } from '../../schedule/reportFormat';

const STATUS_ICONS = {
  completed: Check,
  'not-completed': X,
  upcoming: Clock,
} as const;

type ReportStatusBadgeProps = {
  status: ReportStatus;
};

export function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  const Icon = STATUS_ICONS[status];

  return (
    <span className={reportStatusClassName(status)}>
      <Icon aria-hidden size={14} strokeWidth={2.5} />
      {reportStatusLabel(status)}
    </span>
  );
}
