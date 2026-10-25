import type { EventType as EventTypeDto, ManagedEventType } from '@migenda/shared';

import { EventTypeDocument } from './event-type.schema';

export function toEventType(type: EventTypeDocument): EventTypeDto {
  return {
    id: String(type._id),
    name: type.name,
    color: type.color,
  };
}

export function toManagedEventType(type: EventTypeDocument, inUse: boolean): ManagedEventType {
  return {
    ...toEventType(type),
    inUse,
  };
}
