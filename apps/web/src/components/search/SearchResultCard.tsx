import type { ReactNode } from 'react';
import { Anchor } from '@mantine/core';

type SearchResultCardProps = {
  kind: 'event' | 'note';
  time: string;
  action: string;
  onView: () => void;
  children: ReactNode;
};

export function SearchResultCard({ kind, time, action, onView, children }: SearchResultCardProps) {
  return (
    <div className="border border-[color-mix(in_srgb,#201e1d_40%,transparent)] p-4">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="inline-flex items-center bg-[#f8f4f4] px-2.5 py-[3px] text-[11px] tracking-[0.02em] text-[#444141]">
          {kind === 'event' ? 'Event' : 'Note'}
        </span>
        <span className="text-xs opacity-[0.55]">{time}</span>
      </div>
      {children}
      <div className="mt-2 flex justify-end">
        <Anchor component="button" type="button" onClick={onView} fz={13} fw={600} c="accent.7" className="hover:text-accent">
          {action}
        </Anchor>
      </div>
    </div>
  );
}
