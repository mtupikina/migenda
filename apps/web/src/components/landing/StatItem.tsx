import { Box, Text, Title } from '@mantine/core';

type StatItemProps = {
  value: string;
  label: string;
};

export function StatItem({ value, label }: StatItemProps) {
  return (
    <Box>
      <Title order={2} c="accent.5" fz={{ base: 34, md: 48 }} lh="56px" fw={800} ml="-0.045em">
        {value}
      </Title>
      <Text fz={13} lh="14px" lts="0.08em" tt="uppercase" opacity={0.7} mt={14}>
        {label}
      </Text>
    </Box>
  );
}
