import { Checkbox, Group, Paper, Stack, Text } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { NotificationPreferences, User } from '@migenda/shared';
import { patchProfile } from '../../api/profile';
import { profileCardClassName, profileCardTitleClassName } from '../../classNames/shared';

type ProfileNotificationsCardProps = {
  user: User;
};

const notificationRows: { key: keyof NotificationPreferences; label: string }[] = [
  { key: 'emailShiftChanges', label: 'Email me about shift changes' },
  { key: 'emailSchedulingConflicts', label: 'Email me about scheduling conflicts' },
  { key: 'weeklySummaryDigest', label: 'Weekly summary digest' },
];

export function ProfileNotificationsCard({ user }: ProfileNotificationsCardProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (next: NotificationPreferences) => patchProfile({ notifications: next }),
    onSuccess: (nextUser) => {
      queryClient.setQueryData(['auth', 'me'], nextUser);
    },
  });

  const toggle = (key: keyof NotificationPreferences) => {
    const next = {
      ...user.notifications,
      [key]: !user.notifications[key],
    };
    mutation.mutate(next);
  };

  return (
    <Paper p={24} className={profileCardClassName}>
      <Text component="p" className={profileCardTitleClassName}>
        Notifications
      </Text>
      <Stack gap={16}>
        {notificationRows.map((row) => (
          <Group key={row.key} justify="space-between" wrap="nowrap" gap={16}>
            <Text component="label" htmlFor={`pf-notify-${row.key}`} fz={14}>
              {row.label}
            </Text>
            <Checkbox
              id={`pf-notify-${row.key}`}
              checked={user.notifications[row.key]}
              disabled={mutation.isPending}
              onChange={() => toggle(row.key)}
            />
          </Group>
        ))}
      </Stack>
    </Paper>
  );
}
