import { Grid, Text, Title } from '@mantine/core';

import { Kicker } from '../Kicker';
import { ScheduleBoard } from './ScheduleBoard';

export function LandingBoardSection() {
  return (
    <Grid gutter={{ base: 28, md: 96 }} align="center" pt={56} pb={84}>
      <Grid.Col span={{ base: 12, md: 5 }}>
        <Kicker>The week view</Kicker>
        <Title order={2} fz={32} lh="42px" lts="-0.015em">
          See the whole week at a glance
        </Title>
        <Text fz={15.5} lh="28px" opacity={0.78} mt={24} maw="48ch">
          The week calendar is a ruled grid of events, each in the type color you chose. Open a
          day to edit, complete, or leave a note.
        </Text>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 7 }}>
        <ScheduleBoard />
      </Grid.Col>
    </Grid>
  );
}
