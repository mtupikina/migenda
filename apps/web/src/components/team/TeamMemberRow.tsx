import { Avatar, Box, Group, Paper, Text } from '@mantine/core';
import { userFullName, type TeamMember } from '@migenda/shared';

import { profileCardClassName } from '../../classNames/shared';
import { teamRoleLabel } from '../../team/teamRoleLabel';
import { avatarInitials } from '../../user/avatarInitials';

type TeamMemberRowProps = {
  member: TeamMember;
  isYou: boolean;
};

export function TeamMemberRow({ member, isYou }: TeamMemberRowProps) {
  const name = userFullName(member) || member.email;

  return (
    <Paper p={16} className={profileCardClassName}>
      <Group justify="space-between" wrap="nowrap" gap={16}>
        <Group gap={12} wrap="nowrap">
          <Avatar src={member.avatarUrl} alt="" radius="50%" size={36} color="accent">
            {avatarInitials(member)}
          </Avatar>
          <Box>
            <Text fz={14} fw={600} lh={1.3}>
              {name}
              {isYou ? <span className="font-normal opacity-60"> (you)</span> : null}
            </Text>
            <Text fz={12} className="opacity-60">
              {member.email}
            </Text>
          </Box>
        </Group>
        <Text fz={12} className="whitespace-nowrap opacity-60">
          {teamRoleLabel(member.role)}
        </Text>
      </Group>
    </Paper>
  );
}
