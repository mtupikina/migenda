import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EventNoteDocument = HydratedDocument<EventNote>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class EventNote {
  @Prop({ type: Types.ObjectId, ref: 'CalendarEvent', required: true })
  eventId!: Types.ObjectId;

  @Prop({ required: true })
  occurrenceStart!: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  authorName!: string;

  @Prop({ required: true, trim: true, maxlength: 1000 })
  text!: string;

  createdAt!: Date;
}

export const EventNoteSchema = SchemaFactory.createForClass(EventNote);
EventNoteSchema.index({ eventId: 1, occurrenceStart: 1, createdAt: -1 });
