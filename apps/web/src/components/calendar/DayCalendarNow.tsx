import { useEffect, useState } from 'react';
import { format } from 'date-fns';

import { DAY_CALENDAR_HOUR_PX } from './dayCalendarLayout';

export function DayCalendarNow() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const minutes = now.getHours() * 60 + now.getMinutes();
  const top = (minutes / 60) * DAY_CALENDAR_HOUR_PX;

  return (
    <>
      <span
        className="absolute z-20 w-12 -translate-y-1/2 text-right text-[11px] font-semibold text-accent"
        style={{ top, left: -56 }}
      >
        {format(now, 'HH:mm')}
      </span>
      <span className="absolute right-2 left-2 z-20 h-0.5 bg-accent" style={{ top }} />
      <span
        className="absolute right-3 z-20 -translate-y-1/2 rounded-full border border-accent bg-white px-3 py-1 text-[12px] font-semibold text-accent"
        style={{ top }}
      >
        Current time
      </span>
    </>
  );
}
