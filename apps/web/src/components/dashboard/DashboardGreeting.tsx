import { Stack, Text, Title } from '@mantine/core';

type DashboardGreetingProps = {
  firstName: string;
};

export function DashboardGreeting({ firstName }: DashboardGreetingProps) {
  const name = firstName.trim();
  const heading = name ? `Hello, ${name}` : 'Hello';

  return (
    <Stack gap={4}>
      <Title order={1} fz={32} fw={800} lh={1.1}>
        {heading}
      </Title>
      <Text fz={14} className="opacity-65">
        Here's what's on the schedule.
      </Text>
    </Stack>
  );
}
