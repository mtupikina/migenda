import type { ReactNode } from 'react';
import { Group } from '@mantine/core';

import { rule } from '../theme';
import { BrandMark } from './BrandMark';

type NavProps = {
  children?: ReactNode;
  'aria-label': string;
};

export function Nav({ children, 'aria-label': ariaLabel }: NavProps) {
  return (
    <Group
      component="nav"
      gap={24}
      px={{ base: 20, sm: 72 }}
      py="md"
      wrap="nowrap"
      style={{ borderBottom: rule }}
      aria-label={ariaLabel}
    >
      <BrandMark />
      {children}
    </Group>
  );
}
