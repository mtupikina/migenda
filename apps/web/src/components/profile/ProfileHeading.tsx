import { Stack, Text, Title } from '@mantine/core';

export function ProfileHeading() {
  return (
    <Stack gap={4} mb={32}>
      <Title order={1} fz={32} fw={800} lh={1.1}>
        Profile
      </Title>
      <Text fz={14} c="dimmed">
        Manage your account details and preferences.
      </Text>
    </Stack>
  );
}
