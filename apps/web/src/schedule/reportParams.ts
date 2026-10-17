import { reportRangeSchema, type ReportRange } from '@migenda/shared';

export type ReportParams = {
  typeId: string;
  range: ReportRange;
};

export function parseReportParams(params: URLSearchParams): ReportParams | null {
  const typeId = params.get('type');
  const range = reportRangeSchema.safeParse({
    from: params.get('from') ?? '',
    to: params.get('to') ?? '',
  });
  if (!typeId || !range.success) {
    return null;
  }
  return { typeId, range: range.data };
}
