import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CalendarEventDocument = HydratedDocument<CalendarEvent>;

@Schema()
export class CalendarEvent {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  assigneeId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'EventType', required: true })
  typeId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 50 })
  title!: string;

  @Prop({ default: '', maxlength: 1000 })
  description!: string;

  @Prop({ required: true })
  start!: Date;

  @Prop({ required: true })
  end!: Date;

  @Prop({ required: true })
  timeZone!: string;

  @Prop({ type: [Number], default: [] })
  weekdays!: number[];

  @Prop({ type: String, default: null })
  until!: string | null;
}

export const CalendarEventSchema = SchemaFactory.createForClass(CalendarEvent);
CalendarEventSchema.index({ assigneeId: 1, start: 1 });
