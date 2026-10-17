import type { ReportResponse } from '@migenda/shared';

import { reportWindow } from '../schedule/reportWindow';
import type { ReportParams } from '../schedule/reportParams';
import { apiPath } from './apiPath';
import { ScheduleRequestError, errorMessage } from './events';

type ReportRequest = ReportParams & {
  offset: number;
  limit: number;
};

export async function fetchReport(request: ReportRequest): Promise<ReportResponse> {
  const window = reportWindow(request.range);
  const params = new URLSearchParams({
    typeId: request.typeId,
    from: window.from,
    to: window.to,
    offset: String(request.offset),
    limit: String(request.limit),
  });
  const response = await fetch(apiPath(`/reports?${params.toString()}`), { credentials: 'include' });
  if (!response.ok) {
    throw new ScheduleRequestError(await errorMessage(response, 'Could not load this report.'));
  }
  return response.json() as Promise<ReportResponse>;
}
