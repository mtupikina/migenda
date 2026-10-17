import type { ReportStatus } from '@migenda/shared';

export const reportOptionListClassName =
  'border border-[color-mix(in_srgb,#201e1d_40%,transparent)] bg-surface';

const reportOptionBaseClassName =
  'block w-full border-t border-[color-mix(in_srgb,#201e1d_40%,transparent)] px-2.5 py-[9px] text-[14px] first:border-t-0';

export const reportTableClassNames = {
  th: 'border-b-2 border-[color-mix(in_srgb,#201e1d_40%,transparent)] px-2 py-2 text-left text-[11px] font-normal uppercase tracking-[0.08em] text-[color-mix(in_srgb,#201e1d_60%,transparent)]',
  td: 'border-b border-[color-mix(in_srgb,#201e1d_40%,transparent)] px-2 py-2 align-top text-[14px]',
};

export const reportStatClassName =
  'border-2 border-[color-mix(in_srgb,#201e1d_28%,transparent)] bg-white px-4 py-3';

export function reportStatusClassName(status: ReportStatus): string {
  const base = 'inline-flex items-center gap-1.5 whitespace-nowrap text-[13px]';
  if (status === 'completed') {
    return `${base} font-semibold`;
  }
  if (status === 'not-completed') {
    return `${base} font-semibold text-accent-700`;
  }
  return `${base} opacity-60`;
}

export function reportOptionClassName(selected: boolean): string {
  if (selected) {
    return `${reportOptionBaseClassName} bg-[color-mix(in_srgb,#ec3013_12%,transparent)] font-semibold text-accent-700`;
  }
  return `${reportOptionBaseClassName} hover:bg-[color-mix(in_srgb,#201e1d_7%,transparent)]`;
}
