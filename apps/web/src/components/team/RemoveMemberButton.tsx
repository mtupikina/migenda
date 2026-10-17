import { useState } from 'react';
import { Button } from '@mantine/core';
import type { TeamMember } from '@migenda/shared';

import { RemoveMemberDialog } from './RemoveMemberDialog';

type RemoveMemberButtonProps = {
  member: TeamMember;
};

export function RemoveMemberButton({ member }: RemoveMemberButtonProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <Button type="button" size="xs" variant="default" onClick={() => setConfirming(true)}>
        Remove
      </Button>
      <RemoveMemberDialog member={member} opened={confirming} onClose={() => setConfirming(false)} />
    </>
  );
}
