import { Box, Loader, Text } from '@mantine/core';

import { AppNav } from '../components/AppNav';
import { TeamHeading } from '../components/team/TeamHeading';
import { TeamMemberList } from '../components/team/TeamMemberList';
import { TeamSoloHint } from '../components/team/TeamSoloHint';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useTeam } from '../hooks/useTeam';

export function TeamPage() {
  const { data: user, isLoading } = useRequireAuth();
  const team = useTeam(Boolean(user));
  const waiting = isLoading || !user || team.isLoading;

  return (
    <Box mih="100vh">
      <AppNav />
      <Box maw={900} mx="auto" px={{ base: 20, sm: 72 }} py={70}>
        <TeamHeading teamName={team.data?.name} />
        {waiting ? <Loader color="accent" /> : null}
        {team.isError ? <Text>Could not load your team.</Text> : null}
        {team.isSuccess && user ? <TeamMemberList members={team.data.members} viewerId={user.id} /> : null}
        {team.isSuccess && team.data.members.length === 1 ? <TeamSoloHint /> : null}
      </Box>
    </Box>
  );
}
