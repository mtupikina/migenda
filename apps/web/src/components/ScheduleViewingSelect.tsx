import { Users } from 'lucide-react';
import { Select } from '@mantine/core';

import { useScheduleViewing } from '../hooks/useScheduleViewing';
import { useSession } from '../hooks/useSession';
import { useTeam } from '../hooks/useTeam';
import { viewingOptions } from '../schedule/viewingOptions';

/** Chooses whose events the schedule shows. Hidden while the team is just you. */
export function ScheduleViewingSelect() {
  const { data: user } = useSession();
  const team = useTeam(Boolean(user));
  const { viewing, setViewing } = useScheduleViewing();

  if (!user || !team.data || team.data.members.length < 2) {
    return null;
  }

  return (
    <Select
      aria-label="Whose events to show"
      w={190}
      allowDeselect={false}
      leftSection={<Users size={14} aria-hidden />}
      data={viewingOptions(team.data.members, user.id)}
      value={viewing}
      onChange={(value) => value && setViewing(value)}
    />
  );
}
