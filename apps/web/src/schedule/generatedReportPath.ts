import type { ReportRange } from '@migenda/shared';

export function generatedReportPath(typeId: string, range: ReportRange): string {
  const params = new URLSearchParams({ type: typeId, from: range.from, to: range.to });
  return `/reports/generated?${params.toString()}`;
}
