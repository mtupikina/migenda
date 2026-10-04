export const MONTH_CALENDAR_CHIP_LIMIT = 3;

export function monthCellFrameClass(index: number): string {
  const edge = 'border-[color-mix(in_srgb,#201e1d_14%,transparent)]';
  const left = index % 7 === 0 ? '' : `border-l ${edge}`;
  const top = index < 7 ? '' : `border-t ${edge}`;
  return `${top} ${left}`.trim();
}
