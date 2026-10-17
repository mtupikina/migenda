import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EventTypeDocument = HydratedDocument<EventType>;

@Schema()
export class EventType {
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true })
  color!: string;
}

export const EventTypeSchema = SchemaFactory.createForClass(EventType);
EventTypeSchema.index(
  { teamId: 1, name: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } },
);
