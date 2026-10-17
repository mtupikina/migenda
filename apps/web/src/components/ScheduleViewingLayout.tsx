import { useCallback, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SCHEDULE_VIEW_ME } from '@migenda/shared';

import { ScheduleViewingContext } from '../hooks/useScheduleViewing';
import { useSession } from '../hooks/useSession';
import { useTeam } from '../hooks/useTeam';
import { assigneeLabeler } from '../schedule/assigneeLabeler';

/**
 * Remembers whose events the schedule shows, so the Schedule page and the calendar agree.
 * The choice belongs to one team: switching teams puts it back to "me".
 */
export function ScheduleViewingLayout() {
  const { data: user } = useSession();
  const team = useTeam(Boolean(user));
  const [choice, setChoice] = useState({ teamId: '', viewing: SCHEDULE_VIEW_ME });
  const teamId = team.data?.id ?? '';
  const viewing = choice.teamId === teamId ? choice.viewing : SCHEDULE_VIEW_ME;
  const setViewing = useCallback((next: string) => setChoice({ teamId, viewing: next }), [teamId]);
  const members = team.data?.members;
  const value = useMemo(
    () => ({ viewing, setViewing, assigneeLabel: assigneeLabeler(viewing, members ?? []) }),
    [viewing, setViewing, members],
  );

  return (
    <ScheduleViewingContext.Provider value={value}>
      <Outlet />
    </ScheduleViewingContext.Provider>
  );
}
