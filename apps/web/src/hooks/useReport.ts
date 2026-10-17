import { useInfiniteQuery } from '@tanstack/react-query';
import { REPORT_FIRST_PAGE_SIZE, REPORT_NEXT_PAGE_SIZE } from '@migenda/shared';

import { fetchReport } from '../api/reports';
import type { ReportParams } from '../schedule/reportParams';
import { loadedRowCount } from '../schedule/reportPages';

export function useReport(params: ReportParams | null, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ['report', params?.typeId, params?.range.from, params?.range.to],
    queryFn: ({ pageParam }) => {
      if (!params) {
        throw new Error('Missing report parameters');
      }
      const limit = pageParam === 0 ? REPORT_FIRST_PAGE_SIZE : REPORT_NEXT_PAGE_SIZE;
      return fetchReport({ ...params, offset: pageParam, limit });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      const loaded = loadedRowCount(pages);
      return loaded < lastPage.total ? loaded : undefined;
    },
    enabled: enabled && params !== null,
    retry: false,
  });
}
