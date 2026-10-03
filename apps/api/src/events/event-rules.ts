import { BadRequestException } from '@nestjs/common';

import { isValidTimeZone, zonedYmd } from './zoned-time';

export function assertTimeZone(timeZone: string): void {
  if (!isValidTimeZone(timeZone)) {
    throw new BadRequestException('Use a valid time zone');
  }
}

export function assertSchedule(
  start: Date,
  end: Date,
  weekdays: number[],
  until: string | null,
  timeZone: string,
): void {
  if (end <= start) {
    throw new BadRequestException('End must be after the start');
  }
  if (!until) {
    return;
  }
  if (weekdays.length === 0) {
    throw new BadRequestException('Select at least one day to repeat');
  }
  if (until < zonedYmd(start, timeZone)) {
    throw new BadRequestException('Until date must be on or after the start');
  }
}

export function uniqueWeekdays(weekdays: number[]): number[] {
  return [...new Set(weekdays)];
}
