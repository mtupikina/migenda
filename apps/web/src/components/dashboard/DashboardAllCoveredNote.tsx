import { Stack, Text } from '@mantine/core';

type DashboardAllCoveredNoteProps = {
  firstName: string;
};

export function DashboardAllCoveredNote({ firstName }: DashboardAllCoveredNoteProps) {
  const name = firstName.trim();
  const heading = name ? `You're on top of it, ${name}` : "You're on top of it";

  return (
    <Stack gap={8}>
      <Text className="text-[20px] font-extrabold leading-tight">{heading}</Text>
      <Text className="text-[14px] opacity-65">
        Every shift today is covered — nothing needs your attention. Take it easy for the rest of
        the day.
      </Text>
    </Stack>
  );
}
