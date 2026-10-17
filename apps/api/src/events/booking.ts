import { Types } from 'mongoose';

/** One person's calendar inside one team. Overlap checks run against it. */
export type Booking = {
  teamId: Types.ObjectId;
  assigneeId: Types.ObjectId;
};

export function bookingOf(event: { teamId: Types.ObjectId }, assigneeId: string): Booking {
  return { teamId: event.teamId, assigneeId: new Types.ObjectId(assigneeId) };
}
