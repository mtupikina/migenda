import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class NotificationPreferences {
  @Prop({ default: true })
  emailShiftChanges!: boolean;

  @Prop({ default: true })
  emailSchedulingConflicts!: boolean;

  @Prop({ default: false })
  weeklySummaryDigest!: boolean;
}

export const NotificationPreferencesSchema =
  SchemaFactory.createForClass(NotificationPreferences);

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop()
  passwordHash?: string;

  @Prop({ required: true, trim: true })
  firstName!: string;

  @Prop({ required: true, trim: true })
  lastName!: string;

  @Prop({ default: '' })
  role!: string;

  @Prop()
  avatarUrl?: string;

  @Prop({ type: NotificationPreferencesSchema, default: () => ({}) })
  notifications!: NotificationPreferences;

  @Prop({ unique: true, sparse: true })
  googleId?: string;

  @Prop({ unique: true, sparse: true })
  githubId?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
