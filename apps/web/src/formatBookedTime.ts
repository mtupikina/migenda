export function formatBookedTime(minutes: number): string {
  if (minutes <= 0) {
    return '0 hours';
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) {
    return `${rest} min`;
  }
  if (rest === 0) {
    return hours === 1 ? '1 hour' : `${hours} hours`;
  }
  return `${hours} h ${rest} min`;
}
