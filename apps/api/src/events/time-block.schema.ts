import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TimeBlockDocument = HydratedDocument<TimeBlock>;

@Schema({ timestamps: true })
export class TimeBlock {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  start!: Date;

  @Prop({ required: true })
  end!: Date;

  @Prop({ default: '', maxlength: 1000 })
  reason!: string;
}

export const TimeBlockSchema = SchemaFactory.createForClass(TimeBlock);
TimeBlockSchema.index({ userId: 1, start: 1 });
