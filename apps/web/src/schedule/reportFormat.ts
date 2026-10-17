import { format, isSameDay, isSameMonth, isSameYear, parseISO } from 'date-fns';
import type { ReportRange, ReportStatus } from '@migenda/shared';

const STATUS_LABELS: Record<ReportStatus, string> = {
  completed: 'Completed',
  'not-completed': 'Not completed',
  upcoming: 'Upcoming',
};

export function reportStatusLabel(status: ReportStatus): string {
  return STATUS_LABELS[status];
}

export function formatRate(rate: number | null): string {
  if (rate === null) {
    return '—';
  }
  return `${rate}%`;
}

export function formatCompletedAt(iso: string): string {
  return format(new Date(iso), 'MMM d, HH:mm');
}

export function formatReportRange(range: ReportRange): string {
  const from = parseISO(range.from);
  const to = parseISO(range.to);
  if (isSameDay(from, to)) {
    return format(from, 'MMMM d, yyyy');
  }
  if (isSameMonth(from, to)) {
    return `${format(from, 'MMMM d')} – ${format(to, 'd, yyyy')}`;
  }
  if (isSameYear(from, to)) {
    return `${format(from, 'MMM d')} – ${format(to, 'MMM d, yyyy')}`;
  }
  return `${format(from, 'MMM d, yyyy')} – ${format(to, 'MMM d, yyyy')}`;
}
