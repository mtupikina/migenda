import { format } from 'date-fns';
import { Button, Group } from '@mantine/core';
import { REPORT_NEXT_PAGE_SIZE, type ReportRange, type ReportResponse } from '@migenda/shared';

import { useReportExport } from '../../hooks/useReportExport';
import { formatReportRange, reportDocumentTitle } from '../../schedule/reportFormat';
import { loadedRowCount } from '../../schedule/reportPages';
import { ReportActivities } from './ReportActivities';
import { ReportHeader } from './ReportHeader';
import { ReportNoRows } from './ReportNoRows';
import { ReportRows } from './ReportRows';
import { ReportSummary } from './ReportSummary';

type GeneratedReportProps = {
  pages: ReportResponse[];
  range: ReportRange;
  userId: string;
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => Promise<boolean>;
};

export function GeneratedReport({ pages, range, userId, hasMore, loadingMore, loadMore }: GeneratedReportProps) {
  const report = pages[0];
  const rows = pages.flatMap((page) => page.rows);
  const showAssignee = report.assignees.some((assignee) => assignee.id !== userId);
  const remaining = Math.min(REPORT_NEXT_PAGE_SIZE, report.total - loadedRowCount(pages));
  const subtitle = `Generated ${format(new Date(), 'MMMM d, yyyy')} · ${formatReportRange(range)}`;
  const exporter = useReportExport(loadMore, hasMore, reportDocumentTitle(report.type.name, range));

  return (
    <>
      <ReportHeader
        typeName={report.type.name}
        subtitle={subtitle}
        canExport={report.total > 0}
        exporting={exporter.exporting}
        exportFailed={exporter.failed}
        onExport={() => void exporter.start()}
      />
      {report.total === 0 ? <ReportNoRows /> : null}
      {report.total > 0 ? <ReportSummary summary={report.summary} /> : null}
      {report.activities.length > 1 ? <ReportActivities activities={report.activities} /> : null}
      {report.total > 0 ? <ReportRows rows={rows} showAssignee={showAssignee} /> : null}
      {hasMore ? (
        <Group justify="center" mt={24} className="print:hidden">
          <Button variant="default" loading={loadingMore} onClick={() => void loadMore().catch(() => undefined)} className="whitespace-nowrap">
            Show next {remaining} events
          </Button>
        </Group>
      ) : null}
    </>
  );
}
