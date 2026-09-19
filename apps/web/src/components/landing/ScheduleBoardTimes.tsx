import { Stack, Text } from '@mantine/core';

import { hairline } from '../../theme';
import { TIMES } from './scheduleBoardData';

export function ScheduleBoardTimes() {
  return (
    <Stack gap={0}>
      {TIMES.map((time) => (
        <Text key={time} fz={10} opacity={0.5} px={6} py={4} style={{ flex: 1, borderTop: hairline }}>
          {time}
        </Text>
      ))}
    </Stack>
  );
}
