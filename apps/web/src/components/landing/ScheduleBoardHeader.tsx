import { Box, SimpleGrid, Text } from '@mantine/core';

import { hairline, rule } from '../../theme';
import { DAYS } from './scheduleBoardData';

export function ScheduleBoardHeader() {
  return (
    <SimpleGrid cols={8} spacing={0} style={{ borderBottom: rule }}>
      <Box />
      {DAYS.map((day) => (
        <Text key={day} fz={11} fw={800} lts="0.06em" tt="uppercase" opacity={0.6} px={4} py={8} bd={hairline}>
          {day}
        </Text>
      ))}
    </SimpleGrid>
  );
}
