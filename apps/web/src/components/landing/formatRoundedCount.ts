/** Display a live count without inventing scale. Small numbers stay exact. */
export function formatRoundedCount(count: number): string {
  if (count < 10) {
    return String(count);
  }
  if (count < 100) {
    return `${Math.floor(count / 10) * 10}+`;
  }
  if (count < 1000) {
    return `${Math.floor(count / 100) * 100}+`;
  }
  if (count < 1_000_000) {
    const step = count < 10_000 ? 1_000 : count < 100_000 ? 10_000 : 100_000;
    return `${(Math.floor(count / step) * step).toLocaleString('en-US')}+`;
  }
  const tenths = Math.floor(count / 100_000) / 10;
  const label = Number.isInteger(tenths) ? String(tenths) : tenths.toFixed(1);
  return `${label}M+`;
}
