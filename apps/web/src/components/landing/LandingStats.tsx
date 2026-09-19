import { SimpleGrid } from '@mantine/core';

import { Rule } from '../Rule';
import { StatItem } from './StatItem';

// TODO: Rework when Team/Event models and a public stats API exist. Values must
// come from the database (team count, monthly shifts, double-bookings). Uptime
// is not defined as a Mongo field. Do not restore prototype figures from
// Landing Page.dc.html.
const STATS: readonly { value: string; label: string }[] = [
  { value: '40,000+', label: 'Teams scheduling with MiGenda' },
  { value: '2.1M', label: 'Shifts scheduled monthly' },
  { value: '99.9%', label: 'Uptime, every quarter' },
  { value: '0', label: 'Double-bookings, if you let us' },
];

export function LandingStats() {
  if (STATS.length === 0) {
    return null;
  }

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing={42} py={70} aria-label="MiGenda, by the numbers">
        {STATS.map((stat) => (
          <StatItem key={stat.label} value={stat.value} label={stat.label} />
        ))}
      </SimpleGrid>
      <Rule />
    </>
  );
}
