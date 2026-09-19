import { Link } from 'react-router-dom';
import { Button, Grid, Group, Image, Text, Title } from '@mantine/core';

import { rule } from '../../theme';

export function LandingHero() {
  return (
    <Grid gutter={{ base: 28, md: 72 }} py={{ base: 56, md: 112 }} align="start">
      <Grid.Col span={{ base: 12, md: 7 }}>
        <Title
          order={1}
          fz={{ base: 42, md: 84 }}
          lh={{ base: '44px', md: '89px' }}
          lts="-0.02em"
          ml="-0.058em"
        >
          Every team, on
          <br />
          the same clock.
        </Title>
        <Text fz={17} lh="28px" maw="58ch" mt={40} opacity={0.78}>
          MiGenda is the schedule of record for your whole organization — shifts, meetings and
          deadlines in one calendar, with conflicts caught before they happen.
        </Text>
        <Group gap={12} mt={28}>
          <Button component={Link} to="/login" className="hover:text-ink">
            Get started
          </Button>
          <Button component={Link} to="/login" variant="subtle">
            Log in
          </Button>
        </Group>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 5 }}>
        <Image
          src="/hero-calendar.png"
          alt="A calendar with push-pins marking the 9th, 10th, 16th and 17th"
          bd={rule}
        />
      </Grid.Col>
    </Grid>
  );
}
