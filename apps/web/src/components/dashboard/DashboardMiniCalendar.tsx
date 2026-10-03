import { useLayoutEffect, useRef } from 'react';
import type { Occurrence } from '@migenda/shared';
import { Text } from '@mantine/core';

import { dayKey, occurrencesOn } from '../../dashboardDays';
import { dashboardPanelClassName } from '../../classNames/shared';
import { DashboardMiniCalendarBlock } from './DashboardMiniCalendarBlock';
import {
  MINI_CALENDAR_HOUR_PX,
  MINI_CALENDAR_HOURS,
  MINI_CALENDAR_OPEN_HOUR,
} from './miniCalendarLayout';

type DashboardMiniCalendarProps = {
  occurrences: Occurrence[];
  now: Date;
};

export function DashboardMiniCalendar({ occurrences, now }: DashboardMiniCalendarProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const today = occurrencesOn(occurrences, dayKey(now));

  useLayoutEffect(() => {
    const node = scroller.current;
    if (!node) {
      return;
    }
    node.scrollTop = MINI_CALENDAR_OPEN_HOUR * MINI_CALENDAR_HOUR_PX;
  }, [today.length]);

  return (
    <div className={`${dashboardPanelClassName} h-full`}>
      <Text className="border-b-2 border-[color-mix(in_srgb,#201e1d_28%,transparent)] px-4 py-3.5 text-[17px] font-extrabold leading-tight">
        Today's calendar
      </Text>
      <div ref={scroller} className="h-80 overflow-y-auto bg-[#f7f6f6]">
        <div className="grid grid-cols-[48px_1fr]">
          <div>
            {MINI_CALENDAR_HOURS.map((hour) => (
              <div
                key={hour}
                className="h-10 border-t border-[color-mix(in_srgb,#201e1d_14%,transparent)] px-1.5 pt-0.5 text-[10px] tabular-nums text-[color-mix(in_srgb,#201e1d_55%,transparent)]"
              >
                {`${String(hour).padStart(2, '0')}:00`}
              </div>
            ))}
          </div>
          <div className="relative border-l border-[color-mix(in_srgb,#201e1d_20%,transparent)]">
            {MINI_CALENDAR_HOURS.map((hour) => (
              <div
                key={hour}
                className="h-10 border-t border-[color-mix(in_srgb,#201e1d_14%,transparent)]"
              />
            ))}
            {today.map((occurrence) => (
              <DashboardMiniCalendarBlock
                key={`${occurrence.eventId}-${occurrence.start}`}
                occurrence={occurrence}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
