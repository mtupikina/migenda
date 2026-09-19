import { Text } from '@mantine/core';

export function Kicker({ children }: { children: string }) {
  return (
    <Text fz={13} lh="14px" lts="0.08em" tt="uppercase" c="accent.7" mb={14}>
      {children}
    </Text>
  );
}
