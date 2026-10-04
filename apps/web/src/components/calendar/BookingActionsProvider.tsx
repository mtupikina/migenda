import { useEffect, type ReactNode } from 'react';
import type { Occurrence } from '@migenda/shared';

import { BookingActionsPopover } from './BookingActionsPopover';
import { BookingActionsContext, occurrenceKey, useBookingActions } from './useBookingActions';

type BookingActionsProviderProps = {
  resetKey: string;
  occurrences: Occurrence[];
  dismissed: boolean;
  children: ReactNode;
};

export function BookingActionsProvider({
  resetKey,
  occurrences,
  dismissed,
  children,
}: BookingActionsProviderProps) {
  const booking = useBookingActions(resetKey);
  const selected = occurrences.find((item) => occurrenceKey(item) === booking.selectedKey) ?? null;

  useEffect(() => {
    if (!dismissed) {
      return;
    }
    booking.clear();
  }, [dismissed, booking.clear]);

  return (
    <BookingActionsContext.Provider value={booking}>
      {children}
      <BookingActionsPopover
        occurrence={selected}
        anchor={booking.anchor}
        completing={booking.completing}
        duplicating={booking.duplicating}
        toast={booking.toast}
        onClose={booking.clear}
        onComplete={() => {
          if (!selected) {
            return;
          }
          booking.complete(selected);
        }}
        onDuplicate={() => {
          if (!selected) {
            return;
          }
          booking.duplicate(selected);
        }}
      />
    </BookingActionsContext.Provider>
  );
}
