import { Box, Stack } from '@mantine/core';

import { Kicker } from '../Kicker';
import { FeatureRow } from './FeatureRow';

const FEATURES = [
  {
    index: '01',
    title: 'One calendar, every team',
    copy: "Shifts, meetings and deadlines live side by side. Nobody schedules an all-hands over the warehouse's night shift again.",
  },
  {
    index: '02',
    title: 'Conflicts, caught early',
    copy: "MiGenda flags overlaps and coverage gaps the moment they're proposed — before they're a headache for someone at 6am.",
  },
  {
    index: '03',
    title: 'Built for every device',
    copy: "Check the schedule from the floor, the desk, or the road. Changes sync everywhere the moment they're made.",
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
