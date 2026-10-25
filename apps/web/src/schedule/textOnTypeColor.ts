export function textOnTypeColor(typeColor: string): string {
  if (isLightTypeColor(typeColor)) {
    return 'text-[#201e1d]';
  }
  return 'text-white';
}

function isLightTypeColor(typeColor: string): boolean {
  const oklch = typeColor.match(/oklch\(\s*([\d.]+)/);
  if (oklch) {
    return Number(oklch[1]) > 0.72;
  }
  const hex = typeColor.match(/^#([0-9a-fA-F]{6})$/);
  if (!hex) {
    return false;
  }
  const value = hex[1];
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const lightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lightness > 0.72;
}
