export const reportOptionListClassName =
  'border border-[color-mix(in_srgb,#201e1d_40%,transparent)] bg-surface';

const reportOptionBaseClassName =
  'block w-full border-t border-[color-mix(in_srgb,#201e1d_40%,transparent)] px-2.5 py-[9px] text-[14px] first:border-t-0';

export function reportOptionClassName(selected: boolean): string {
  if (selected) {
    return `${reportOptionBaseClassName} bg-[color-mix(in_srgb,#ec3013_12%,transparent)] font-semibold text-accent-700`;
  }
  return `${reportOptionBaseClassName} hover:bg-[color-mix(in_srgb,#201e1d_7%,transparent)]`;
}
