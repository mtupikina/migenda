import { Stack, Text, Title } from '@mantine/core';

type TeamHeadingProps = {
  teamName?: string;
};

export function TeamHeading({ teamName }: TeamHeadingProps) {
  return (
    <Stack gap={4} mb={32}>
      <Title order={1} fz={28} fw={800} lh={1.1}>
        Team
      </Title>
      <Text fz={14} className="opacity-65">
        {teamName ? `Members of ${teamName}.` : 'The people you work with.'}
      </Text>
    </Stack>
  );
}
