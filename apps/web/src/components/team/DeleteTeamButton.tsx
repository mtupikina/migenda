import { useState } from 'react';
import { Button } from '@mantine/core';
import type { Team } from '@migenda/shared';

import { useTeams } from '../../hooks/useTeams';
import { DeleteTeamDialog } from './DeleteTeamDialog';

type DeleteTeamButtonProps = {
  team: Team;
};

export function DeleteTeamButton({ team }: DeleteTeamButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const teams = useTeams(true);
  const hasOtherTeam = (teams.data?.length ?? 0) > 1;

  if (!hasOtherTeam) {
    return null;
  }

  return (
    <>
      <Button type="button" variant="default" w="fit-content" onClick={() => setConfirming(true)}>
        Delete team
      </Button>
      <DeleteTeamDialog team={team} opened={confirming} onClose={() => setConfirming(false)} />
    </>
  );
}
