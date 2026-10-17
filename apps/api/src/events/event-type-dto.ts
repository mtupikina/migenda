import type { EventType as EventTypeDto } from '@migenda/shared';

import { EventTypeDocument } from './event-type.schema';

export function toEventType(type: EventTypeDocument): EventTypeDto {
  return {
    id: String(type._id),
    name: type.name,
    color: type.color,
  };
}
