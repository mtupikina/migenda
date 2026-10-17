import { SCHEDULE_VIEW_ALL, SCHEDULE_VIEW_ME, userFullName, type TeamMember } from '@migenda/shared';

type ViewingOption = {
  value: string;
  label: string;
};

/** The choices for whose events to show: me, everyone, then each teammate. */
export function viewingOptions(members: TeamMember[], currentUserId: string): ViewingOption[] {
  const teammates = members
    .filter((member) => member.id !== currentUserId)
    .map((member) => ({ value: member.id, label: userFullName(member) || member.email }));
  return [
    { value: SCHEDULE_VIEW_ME, label: 'Me' },
    { value: SCHEDULE_VIEW_ALL, label: 'Everyone' },
    ...teammates,
  ];
}
