import { SCHEDULE_VIEW_ALL, type Occurrence, type TeamMember } from '@migenda/shared';

export type AssigneeLabel = (item: Pick<Occurrence, 'assigneeId'>) => string;

const NONE: AssigneeLabel = () => '';

/**
 * Names the person an event belongs to. Only the "everyone" view needs it, because
 * in the other views every event is the same person's.
 */
export function assigneeLabeler(viewing: string, members: Pick<TeamMember, 'id' | 'firstName'>[]): AssigneeLabel {
  if (viewing !== SCHEDULE_VIEW_ALL) {
    return NONE;
  }
  const firstNames = new Map(members.map((member) => [member.id, member.firstName]));
  return (item) => firstNames.get(item.assigneeId) ?? '';
}

/** Puts the person's name in front of an event line, when there is one to show. */
export function withAssignee(name: string, line: string): string {
  return name ? `${name} · ${line}` : line;
}
