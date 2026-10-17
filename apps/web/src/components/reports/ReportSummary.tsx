import type { ReportSummary as ReportSummaryData } from '@migenda/shared';

import { formatBookedTime } from '../../schedule/formatBookedTime';
import { formatRate } from '../../schedule/reportFormat';
import { ReportStat } from './ReportStat';

type ReportSummaryProps = {
  summary: ReportSummaryData;
};

export function ReportSummary({ summary }: ReportSummaryProps) {
  return (
    <section aria-label="Summary" className="mb-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ReportStat label="Scheduled" value={String(summary.scheduled)} />
        <ReportStat label="Completed" value={String(summary.completed)} />
        <ReportStat label="Not completed" value={String(summary.notCompleted)} />
        <ReportStat label="Upcoming" value={String(summary.upcoming)} />
        <ReportStat label="Completion rate" value={formatRate(summary.completionRate)} />
        <ReportStat label="Planned time" value={formatBookedTime(summary.plannedMinutes)} />
        <ReportStat label="Planned time completed" value={formatBookedTime(summary.completedMinutes)} />
        <ReportStat label="Notes" value={String(summary.notes)} />
      </div>
      <p className="mb-0 mt-3 text-[12px] opacity-60">
        Completion rate is the share of finished events that were marked as completed. Events that
        haven&apos;t happened yet are not counted. Planned time is how long events were scheduled
        for, not time that was tracked.
      </p>
    </section>
  );
}
