import { useEffect, type ReactNode } from 'react';
import type { Occurrence } from '@migenda/shared';

import { BookingNotice } from './BookingNotice';
import { BookingActionsPopover } from './BookingActionsPopover';
import { BookingActionsContext, occurrenceKey, useBookingActions } from './useBookingActions';

type BookingActionsProviderProps = {
  resetKey: string;
  occurrences: Occurrence[];
  dismissed: boolean;
  onEdit: (eventId: string, occurrenceStart: string) => void;
  onRemove: (occurrence: Occurrence) => void;
  onNote: (occurrence: Occurrence) => void;
  children: ReactNode;
};

export function BookingActionsProvider({
  resetKey,
  occurrences,
  dismissed,
  onEdit,
  onRemove,
  onNote,
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
      {selected ? null : <BookingNotice message={booking.toast} />}
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
        onEdit={() => {
          if (!selected) {
            return;
          }
          onEdit(selected.eventId, selected.seriesStart);
        }}
        onRemove={() => {
          if (!selected) {
            return;
          }
          onRemove(selected);
        }}
        onNote={() => {
          if (!selected) {
            return;
          }
          onNote(selected);
        }}
      />
    </BookingActionsContext.Provider>
  );
}
