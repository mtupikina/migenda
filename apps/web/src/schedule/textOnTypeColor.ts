export function textOnTypeColor(typeColor: string): string {
  const lightness = Number(typeColor.match(/oklch\(\s*([\d.]+)/)?.[1] ?? 0);
  if (lightness > 0.72) {
    return 'text-[#201e1d]';
  }
  return 'text-white';
}
