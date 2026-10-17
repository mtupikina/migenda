import { Navigate, useSearchParams } from 'react-router-dom';
import { Box, Loader } from '@mantine/core';

import { AppNav } from '../components/AppNav';
import { GeneratedReport } from '../components/reports/GeneratedReport';
import { ReportError } from '../components/reports/ReportError';
import { useReport } from '../hooks/useReport';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { parseReportParams } from '../schedule/reportParams';

export function GeneratedReportPage() {
  const { data: user, isLoading } = useRequireAuth();
  const [searchParams] = useSearchParams();
  const params = parseReportParams(searchParams);
  const report = useReport(params, Boolean(user));

  if (!params) {
    return <Navigate to="/reports" replace />;
  }

  const waiting = isLoading || !user || report.isLoading;

  return (
    <Box mih="100vh">
      <AppNav />
      <Box maw={900} mx="auto" px={{ base: 20, sm: 72 }} py={70}>
        {waiting ? <Loader color="accent" /> : null}
        {report.isError ? <ReportError message={report.error.message} /> : null}
        {report.data && user ? (
          <GeneratedReport
            pages={report.data.pages}
            range={params.range}
            userId={user.id}
            hasMore={report.hasNextPage}
            loadingMore={report.isFetchingNextPage}
            onLoadMore={() => void report.fetchNextPage()}
          />
        ) : null}
      </Box>
    </Box>
  );
}
