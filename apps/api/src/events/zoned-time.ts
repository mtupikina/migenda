export type ZonedParts = {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
};

export function zonedParts(date: Date, timeZone: string): ZonedParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const map: Record<string, string> = {};
  for (const part of formatter.formatToParts(date)) {
    map[part.type] = part.value;
  }
  const hour = map.hour === '24' ? '00' : map.hour;
  return {
    year: map.year ?? '1970',
    month: map.month ?? '01',
    day: map.day ?? '01',
    hour: hour ?? '00',
    minute: map.minute ?? '00',
    second: map.second ?? '00',
  };
}

export function zonedYmd(date: Date, timeZone: string): string {
  const parts = zonedParts(date, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function zonedLocalToUtc(ymd: string, hour: number, minute: number, timeZone: string): Date {
  const [year, month, day] = ymd.split('-').map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const first = new Date(utcGuess.getTime() - zoneOffsetMs(utcGuess, timeZone));
  return new Date(utcGuess.getTime() - zoneOffsetMs(first, timeZone));
}

function zoneOffsetMs(date: Date, timeZone: string): number {
  const parts = zonedParts(date, timeZone);
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return asUtc - date.getTime();
}
