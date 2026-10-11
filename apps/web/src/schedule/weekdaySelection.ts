export function toggleWeekday(days: number[], day: number, checked: boolean): number[] {
  if (!checked) {
    return days.filter((value) => value !== day);
  }
  return [...days, day];
}
