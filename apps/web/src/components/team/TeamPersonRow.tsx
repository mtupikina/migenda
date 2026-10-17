import type { ReactNode } from 'react';
import { Avatar, Box, Group, Paper, Text } from '@mantine/core';
import { userFullName, type TeamMember } from '@migenda/shared';

import { profileCardClassName } from '../../classNames/shared';
import { avatarInitials } from '../../user/avatarInitials';

type TeamPersonRowProps = {
  person: Pick<TeamMember, 'firstName' | 'lastName' | 'email' | 'avatarUrl'>;
  /** Shown on the right, for example the person's role or "Pending". */
  label: string;
  isYou?: boolean;
  /** Dims the row for someone who has not joined yet. */
  muted?: boolean;
  /** Extra control on the right, for example Remove. */
  action?: ReactNode;
};

export function TeamPersonRow({ person, label, isYou = false, muted = false, action }: TeamPersonRowProps) {
  const name = userFullName(person) || person.email;

  return (
    <Paper p={16} className={`${profileCardClassName}${muted ? ' opacity-70' : ''}`}>
      <Group justify="space-between" wrap="nowrap" gap={16}>
        <Group gap={12} wrap="nowrap">
          <Avatar src={person.avatarUrl} alt="" radius="50%" size={36} color="accent">
            {avatarInitials(person)}
          </Avatar>
          <Box>
            <Text fz={14} fw={600} lh={1.3}>
              {name}
              {isYou ? <span className="font-normal opacity-60"> (you)</span> : null}
            </Text>
            <Text fz={12} className="opacity-60">
              {person.email}
            </Text>
          </Box>
        </Group>
        <Group gap={12} wrap="nowrap">
          <Text fz={12} className="whitespace-nowrap opacity-60">
            {label}
          </Text>
          {action}
        </Group>
      </Group>
    </Paper>
  );
}
