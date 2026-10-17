import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TEAM_NAME_MAX } from '@migenda/shared';
import { HydratedDocument, Types } from 'mongoose';

export type TeamDocument = HydratedDocument<Team>;

@Schema({ timestamps: true })
export class Team {
  @Prop({ required: true, trim: true, maxlength: TEAM_NAME_MAX })
  name!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId!: Types.ObjectId;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
