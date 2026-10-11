import { Box, Loader, Text, Title } from '@mantine/core';

import { AppNav } from '../components/AppNav';
import { ReportsEmpty } from '../components/reports/ReportsEmpty';
import { ReportsForm } from '../components/reports/ReportsForm';
import { useEventTypes } from '../hooks/useEventTypes';
import { useRequireAuth } from '../hooks/useRequireAuth';

export function ReportsPage() {
  const { data: user, isLoading } = useRequireAuth();
  const eventTypes = useEventTypes(Boolean(user));
  const types = eventTypes.data ?? [];
  const waiting = isLoading || !user || eventTypes.isLoading;

  return (
    <Box mih="100vh">
      <AppNav />
      <Box maw={760} mx="auto" px={{ base: 20, sm: 72 }} py={70}>
        <Title order={1} fz={28} fw={800} lh={1.1} mb={4}>
          Reports
        </Title>
        <Text fz={14} mb={24} className="opacity-65">
          Choose a report type and time period to generate.
        </Text>
        {waiting ? <Loader color="accent" /> : null}
        {eventTypes.isError ? <Text>Could not load your event types.</Text> : null}
        {eventTypes.isSuccess && types.length === 0 ? <ReportsEmpty /> : null}
        {eventTypes.isSuccess && types.length > 0 ? <ReportsForm types={types} /> : null}
      </Box>
    </Box>
  );
}
