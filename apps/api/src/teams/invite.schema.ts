import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InviteDocument = HydratedDocument<Invite>;

/** A pending invitation. It is deleted when the person accepts or declines. */
@Schema({ timestamps: true })
export class Invite {
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  invitedUserId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  invitedById!: Types.ObjectId;

  createdAt!: Date;
}

export const InviteSchema = SchemaFactory.createForClass(Invite);
InviteSchema.index({ teamId: 1, invitedUserId: 1 }, { unique: true });
InviteSchema.index({ invitedUserId: 1 });
