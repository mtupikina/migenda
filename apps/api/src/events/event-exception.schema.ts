import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EventExceptionDocument = HydratedDocument<EventException>;

@Schema()
export class EventException {
  @Prop({ type: Types.ObjectId, ref: 'CalendarEvent', required: true })
  eventId!: Types.ObjectId;

  @Prop({ required: true })
  occurrenceStart!: Date;

  @Prop({ required: true })
  completed!: boolean;

  @Prop({ default: false })
  deleted!: boolean;

  @Prop({ trim: true, maxlength: 50 })
  title?: string;

  @Prop({ maxlength: 1000 })
  description?: string;
}

export const EventExceptionSchema = SchemaFactory.createForClass(EventException);
EventExceptionSchema.index({ eventId: 1, occurrenceStart: 1 }, { unique: true });
