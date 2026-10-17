import type { ReportResponse } from '@migenda/shared';

export function loadedRowCount(pages: ReportResponse[]): number {
  return pages.reduce((count, page) => count + page.rows.length, 0);
}
