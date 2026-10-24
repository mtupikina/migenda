import { Box, Stack } from '@mantine/core';

import { Kicker } from '../Kicker';
import { FeatureRow } from './FeatureRow';

const FEATURES = [
  {
    index: '01',
    title: 'One calendar for the team',
    copy: "Invite people to a team and look at your own events or everyone's. Types you create — with a name and a color — sit on the same day, week, and month grid.",
  },
  {
    index: '02',
    title: 'Overlaps, blocked early',
    copy: "When you add, move, or block time, MiGenda checks that person's calendar. A clash is refused before it is saved — or a repeating series skips the days that are already taken.",
  },
  {
    index: '03',
    title: 'Notes, search, and reports',
    copy: 'Leave a note on an event, find it later with search, and run a report on a type you created — scheduled, completed, and upcoming work for the period you pick.',
  },
] as const;

export function LandingFeatures() {
  return (
    <Box id="features" py={84}>
      <Kicker>What MiGenda does</Kicker>
      <Stack gap={0}>
        {FEATURES.map((feature, i) => (
          <FeatureRow
            key={feature.index}
            index={feature.index}
            title={feature.title}
            copy={feature.copy}
            showTopBorder={i > 0}
          />
        ))}
      </Stack>
    </Box>
  );
}
