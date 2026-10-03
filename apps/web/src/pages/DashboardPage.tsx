import { useState } from 'react';
import { Box, Button, Group, Loader, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';

import { fetchDashboard } from '../api/events';
import { countOn, dayKey } from '../dashboardDays';
import { AppNav } from '../components/AppNav';
import { DashboardChecklist } from '../components/dashboard/DashboardChecklist';
import { DashboardDayStats } from '../components/dashboard/DashboardDayStats';
import { DashboardEmptyChecklist } from '../components/dashboard/DashboardEmptyChecklist';
import { DashboardGreeting } from '../components/dashboard/DashboardGreeting';
import { DashboardMiniCalendar } from '../components/dashboard/DashboardMiniCalendar';
import { NewEventDialog } from '../components/dashboard/NewEventDialog';
import { useRequireAuth } from '../hooks/useRequireAuth';

export function DashboardPage() {
  const { data: user, isLoading } = useRequireAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const now = new Date();
  const dashboard = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetchDashboard(),
    enabled: Boolean(user),
  });

  const showLoader = isLoading || !user || dashboard.isLoading;
  const schedule = dashboard.data;

  return (
    <Box mih="100vh">
      <AppNav />
      <Box maw={1200} mx="auto" px={{ base: 20, sm: 72 }} py={70}>
        {showLoader ? <Loader color="accent" /> : null}
        {dashboard.isError ? <Text>Could not load your schedule.</Text> : null}
        {user && schedule ? (
          <>
            <Group justify="space-between" align="flex-start" wrap="wrap" mb={32} gap={16}>
              <DashboardGreeting firstName={user.firstName} />
              <Button onClick={() => setDialogOpen(true)}>New event</Button>
            </Group>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <DashboardDayStats occurrences={schedule.occurrences} now={now} />
              {countOn(schedule.occurrences, dayKey(now)) === 0 ? (
                <DashboardEmptyChecklist now={now} />
              ) : (
                <DashboardChecklist occurrences={schedule.occurrences} now={now} />
              )}
              <DashboardMiniCalendar occurrences={schedule.occurrences} now={now} />
            </div>
            <NewEventDialog
              opened={dialogOpen}
              types={schedule.types}
              assignees={schedule.assignees}
              onClose={() => setDialogOpen(false)}
            />
          </>
        ) : null}
      </Box>
    </Box>
  );
}
