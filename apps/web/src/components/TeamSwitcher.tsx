import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Button, Menu } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { invalidateTeam } from '../api/invalidateTeam';
import { switchTeam } from '../api/team';
import { useSession } from '../hooks/useSession';
import { useTeamInvites } from '../hooks/useTeamInvites';
import { useTeams } from '../hooks/useTeams';
import { TeamSwitcherItem } from './TeamSwitcherItem';

type TeamSwitcherProps = {
  block?: boolean;
};

/** Lists the user's teams. Picking one makes it the team every screen shows. */
export function TeamSwitcher({ block = false }: TeamSwitcherProps) {
  const queryClient = useQueryClient();
  const { data: user } = useSession();
  const teams = useTeams(Boolean(user));
  const invites = useTeamInvites(Boolean(user));
  const mutation = useMutation({
    mutationFn: switchTeam,
    onSuccess: () => invalidateTeam(queryClient),
  });
  const active = teams.data?.find((team) => team.active);
  const inviteCount = invites.data?.length ?? 0;

  if (!teams.data || !active) {
    return null;
  }

  const menuWidth = block ? 'target' : 240;

  return (
    <Menu position={block ? 'bottom-start' : 'bottom-end'} width={menuWidth}>
      <Menu.Target>
        <Button
          variant="default"
          fz={14}
          loading={mutation.isPending}
          rightSection={<ChevronDown size={14} aria-hidden />}
          aria-label={`Team: ${active.name}. Switch team`}
          className={block ? 'w-full max-w-none' : 'max-w-56'}
        >
          {active.name}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Your teams</Menu.Label>
        {teams.data.map((team) => (
          <TeamSwitcherItem key={team.id} team={team} onSelect={(teamId) => mutation.mutate(teamId)} />
        ))}
        {inviteCount > 0 ? (
          <>
            <Menu.Divider />
            <Menu.Item component={Link} to="/team" fz={14}>
              {inviteCount === 1 ? '1 pending invite' : `${inviteCount} pending invites`}
            </Menu.Item>
          </>
        ) : null}
      </Menu.Dropdown>
    </Menu>
  );
}
