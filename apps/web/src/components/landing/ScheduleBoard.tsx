import { Box, SimpleGrid, Stack } from '@mantine/core';

import { hairline, rule } from '../../theme';
import { BOARD_EVENTS, DAYS } from './scheduleBoardData';
import { ScheduleBoardEvent } from './ScheduleBoardEvent';
import { ScheduleBoardHeader } from './ScheduleBoardHeader';
import { ScheduleBoardTimes } from './ScheduleBoardTimes';

export function ScheduleBoard() {
  return (
    <Stack gap={0} m={0} bd={rule} style={{ aspectRatio: '16 / 10' }} aria-hidden>
      <ScheduleBoardHeader />
      <Box pos="relative" style={{ flex: 1, display: 'grid', gridTemplateColumns: '56px repeat(7, 1fr)' }}>
        <ScheduleBoardTimes />
        <SimpleGrid cols={7} spacing={0} style={{ gridColumn: '2 / 9' }}>
          {DAYS.map((day) => (
            <Box key={day} style={{ borderLeft: hairline, borderTop: hairline }} />
          ))}
        </SimpleGrid>
        {BOARD_EVENTS.map((event) => (
          <ScheduleBoardEvent key={event.label} {...event} />
        ))}
      </Box>
    </Stack>
  );
}
