export function toFormDateTime(value: string | null): string {
  if (!value) {
    return '';
  }
  return value.replace(' ', 'T').slice(0, 16);
}

export function toFormDate(value: string | null): string {
  if (!value) {
    return '';
  }
  return value.slice(0, 10);
}
