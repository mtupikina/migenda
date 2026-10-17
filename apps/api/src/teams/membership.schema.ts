import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TEAM_ROLES, type TeamRole } from '@migenda/shared';
import { HydratedDocument, Types } from 'mongoose';

export type MembershipDocument = HydratedDocument<Membership>;

@Schema({ timestamps: true })
export class Membership {
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, enum: TEAM_ROLES, required: true })
  role!: TeamRole;
}

export const MembershipSchema = SchemaFactory.createForClass(Membership);
MembershipSchema.index({ teamId: 1, userId: 1 }, { unique: true });
MembershipSchema.index({ userId: 1 });
