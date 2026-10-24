import { SimpleGrid } from '@mantine/core';

import { usePublicStats } from '../../hooks/usePublicStats';
import { Rule } from '../Rule';
import { formatRoundedCount } from './formatRoundedCount';
import { StatItem } from './StatItem';

export function LandingStats() {
  const stats = usePublicStats();
  if (!stats.data) {
    return null;
  }

  const items = [
    { value: formatRoundedCount(stats.data.teams), label: 'Teams on MiGenda' },
    { value: formatRoundedCount(stats.data.people), label: 'People using MiGenda' },
    { value: formatRoundedCount(stats.data.events), label: 'Events on the calendar' },
    { value: formatRoundedCount(stats.data.notes), label: 'Notes on events' },
  ];

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing={42} py={70} aria-label="MiGenda, by the numbers">
        {items.map((stat) => (
          <StatItem key={stat.label} value={stat.value} label={stat.label} />
        ))}
      </SimpleGrid>
      <Rule />
    </>
  );
}
