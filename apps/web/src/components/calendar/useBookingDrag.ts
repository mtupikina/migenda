import { useDraggable } from '@dnd-kit/core';
import type { Occurrence } from '@migenda/shared';

import { bookingDragId } from '../../schedule/calendarDrag';

export function useBookingDrag(occurrence: Occurrence) {
  return useDraggable({
    id: bookingDragId(occurrence),
    data: { occurrence },
    disabled: occurrence.blocked,
  });
}
