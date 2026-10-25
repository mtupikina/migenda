import { createContext, useContext } from 'react';
import { SCHEDULE_VIEW_ALL } from '@migenda/shared';

import { assigneeLabeler, type AssigneeLabel } from '../schedule/assigneeLabeler';

export type ScheduleViewing = {
  /** Whose events the schedule shows: `me`, `all`, or a teammate's id. */
  viewing: string;
  setViewing: (viewing: string) => void;
  /** The name to put on an event. Empty unless the schedule shows everyone. */
  assigneeLabel: AssigneeLabel;
};

export const ScheduleViewingContext = createContext<ScheduleViewing>({
  viewing: SCHEDULE_VIEW_ALL,
  setViewing: () => undefined,
  assigneeLabel: assigneeLabeler(SCHEDULE_VIEW_ALL, []),
});

export function useScheduleViewing(): ScheduleViewing {
  return useContext(ScheduleViewingContext);
}
