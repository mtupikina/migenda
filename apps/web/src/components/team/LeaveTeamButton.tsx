import { useState } from 'react';
import { Button } from '@mantine/core';
import type { Team } from '@migenda/shared';

import { LeaveTeamDialog } from './LeaveTeamDialog';

type LeaveTeamButtonProps = {
  team: Team;
};

export function LeaveTeamButton({ team }: LeaveTeamButtonProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <Button type="button" variant="default" w="fit-content" onClick={() => setConfirming(true)}>
        Leave team
      </Button>
      <LeaveTeamDialog team={team} opened={confirming} onClose={() => setConfirming(false)} />
    </>
  );
}
