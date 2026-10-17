import { Box, Loader, Stack, Text } from '@mantine/core';

import { AppNav } from '../components/AppNav';
import { CreateTeamForm } from '../components/team/CreateTeamForm';
import { InviteMemberForm } from '../components/team/InviteMemberForm';
import { PendingInvites } from '../components/team/PendingInvites';
import { TeamHeading } from '../components/team/TeamHeading';
import { TeamMemberList } from '../components/team/TeamMemberList';
import { TeamNameForm } from '../components/team/TeamNameForm';
import { TeamSoloHint } from '../components/team/TeamSoloHint';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useTeam } from '../hooks/useTeam';
import { useTeamInvites } from '../hooks/useTeamInvites';

export function TeamPage() {
  const { data: user, isLoading } = useRequireAuth();
  const team = useTeam(Boolean(user));
  const invites = useTeamInvites(Boolean(user));
  const waiting = isLoading || !user || team.isLoading;
  const isOwner = team.data?.role === 'owner';
  const hasInvites = (invites.data?.length ?? 0) > 0;
  const alone = team.data?.members.length === 1 && team.data.pending.length === 0;

  return (
    <Box mih="100vh">
      <AppNav />
      <Box maw={900} mx="auto" px={{ base: 20, sm: 72 }} py={70}>
        <TeamHeading teamName={team.data?.name} />
        <Stack gap={32}>
          {waiting ? <Loader color="accent" /> : null}
          {team.isError ? <Text>Could not load your team.</Text> : null}
          {hasInvites && invites.data ? <PendingInvites invites={invites.data} /> : null}
          {team.isSuccess && isOwner ? <TeamNameForm key={team.data.id} team={team.data} /> : null}
          {team.isSuccess && user ? (
            <Box>
              <TeamMemberList members={team.data.members} pending={team.data.pending} viewerId={user.id} />
              {alone ? <TeamSoloHint /> : null}
            </Box>
          ) : null}
          {team.isSuccess && isOwner ? <InviteMemberForm /> : null}
          {team.isSuccess ? <CreateTeamForm /> : null}
        </Stack>
      </Box>
    </Box>
  );
}
