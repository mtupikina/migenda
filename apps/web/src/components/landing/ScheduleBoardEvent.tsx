import type { CSSProperties } from 'react';
import { Text } from '@mantine/core';

import { divider } from '../../theme';
import type { BoardEvent } from './scheduleBoardData';

export function ScheduleBoardEvent({ col, row, rows, label, tone }: BoardEvent) {
  return (
    <Text
      fz={10}
      px={6}
      py={4}
      bg={tone === 'accent' ? 'accent.5' : tone === 'ink' ? '#201e1d' : undefined}
      c={tone === 'open' ? undefined : '#f3f2f2'}
      fw={tone === 'accent' ? 600 : undefined}
      opacity={tone === 'ink' ? 0.85 : tone === 'open' ? 0.6 : 1}
      bd={tone === 'open' ? `1.5px solid ${divider}` : undefined}
      className="absolute ml-1 flex items-center w-[calc((100%-56px)/7-8px)] left-[calc(56px+var(--event-col)*(100%-56px)/7)] top-[calc(var(--event-row)*20%+3px)] h-[calc(var(--event-span)*20%-6px)]"
      style={{ '--event-col': col, '--event-row': row, '--event-span': rows } as CSSProperties}
    >
      {label}
    </Text>
  );
}
