import { Grid, Text, Title } from '@mantine/core';

import { Kicker } from '../Kicker';
import { ScheduleBoard } from './ScheduleBoard';

export function LandingBoardSection() {
  return (
    <Grid gutter={{ base: 28, md: 96 }} align="center" pt={56} pb={84}>
      <Grid.Col span={{ base: 12, md: 5 }}>
        <Kicker>The schedule board</Kicker>
        <Title order={2} fz={32} lh="42px" lts="-0.015em">
          See the whole week at a glance
        </Title>
        <Text fz={15.5} lh="28px" opacity={0.78} mt={24} maw="48ch">
          The board prints like a timetable — every shift and meeting on one ruled grid, red
          reserved for the one thing that needs your attention right now.
        </Text>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 7 }}>
        <ScheduleBoard />
      </Grid.Col>
    </Grid>
  );
}
