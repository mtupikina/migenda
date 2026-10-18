import { Link } from 'react-router-dom';
import { Box, Button, Group, Loader, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, CalendarDays, FileText, Users } from 'lucide-react';

import { SCHEDULE_VIEW_ME } from '@migenda/shared';

import { fetchDashboard } from '../api/events';
import { GetStartedBanner } from '../components/get-started/GetStartedBanner';
import { GetStartedHero } from '../components/get-started/GetStartedHero';
import { Nav } from '../components/Nav';
import { getStartedCards, getStartedKicker, getStartedLead } from '../get-started/getStartedContent';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useTeam } from '../hooks/useTeam';
import { countOn, dayKey } from '../schedule/dashboardDays';

const ICONS = {
  schedule: CalendarDays,
  notes: FileText,
  team: Users,
  reports: BarChart3,
} as const;

export function GetStartedPage() {
  const { data: user, isLoading } = useRequireAuth();
  const team = useTeam(Boolean(user));
  const dashboard = useQuery({
    queryKey: ['dashboard', 'today', SCHEDULE_VIEW_ME],
    queryFn: () => fetchDashboard(),
    enabled: Boolean(user),
  });
  const waiting = isLoading || !user || team.isLoading || dashboard.isLoading;
  const today = dayKey(new Date());

  return (
    <Box mih="100vh">
      <Nav aria-label="Get started">
        <Button component={Link} to="/dashboard" className="hover:text-body">
          Go to schedule
        </Button>
      </Nav>
      <Box maw={1000} mx="auto" px={{ base: 20, sm: 72 }} py={70}>
        {waiting ? <Loader color="accent" /> : null}
        {!waiting && (!user || !team.data || !dashboard.data) ? (
          <Text>Could not load your workspace.</Text>
        ) : null}
        {user && team.data && dashboard.data ? (
          <>
            <GetStartedHero kicker={getStartedKicker(user.firstName)} lead={getStartedLead(team.data.name)} />
            <GetStartedBanner />
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
              {getStartedCards({
                today,
                todayCount: countOn(dashboard.data.occurrences, today),
                bookedCount: dashboard.data.occurrences.filter((item) => !item.blocked).length,
                types: dashboard.data.types,
                teamName: team.data.name,
                memberCount: team.data.members.length,
                pendingCount: team.data.pending.length,
              }).map((card) => {
                const Icon = ICONS[card.kind];
                return (
                  <Link
                    key={card.kind}
                    to={card.href}
                    className="block border-t-2 border-accent pt-4 text-inherit no-underline"
                  >
                    <Icon size={28} strokeWidth={1.6} className="mb-3" aria-hidden />
                    <p className="mb-2 mt-0 text-[16px] font-extrabold">{card.title}</p>
                    <p className="mb-2 mt-0 text-[13.5px] leading-[22px] opacity-70">{card.description}</p>
                    <p className="m-0 text-[13.5px] leading-[22px] opacity-70">{card.status}</p>
                  </Link>
                );
              })}
            </div>
            <Group justify="center" mt={70}>
              <Button component={Link} to="/dashboard">
                Go to your schedule
              </Button>
            </Group>
          </>
        ) : null}
      </Box>
    </Box>
  );
}
