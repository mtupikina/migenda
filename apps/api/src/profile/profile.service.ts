import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import type { User as AuthUser } from '@migenda/shared';
import { AuthService } from '../auth/auth.service';
import { Session, SessionDocument } from '../auth/session.schema';
import { PasswordReset, PasswordResetDocument } from '../auth/password-reset.schema';
import { User, UserDocument } from '../auth/user.schema';
import { PatchProfileDto } from './patch-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly auth: AuthService,
    @InjectModel(User.name) private readonly users: Model<UserDocument>,
    @InjectModel(Session.name) private readonly sessions: Model<SessionDocument>,
    @InjectModel(PasswordReset.name)
    private readonly passwordResets: Model<PasswordResetDocument>,
  ) {}

  async patchProfile(sid: string | undefined, dto: PatchProfileDto): Promise<AuthUser> {
    if (!hasPatchFields(dto)) {
      throw new BadRequestException('No profile fields to update');
    }

    const user = await this.auth.resolveUserFromSession(sid);

    if (dto.firstName !== undefined) {
      user.firstName = dto.firstName;
    }
    if (dto.lastName !== undefined) {
      user.lastName = dto.lastName;
    }
    if (dto.role !== undefined) {
      user.role = dto.role;
    }
    if (dto.email !== undefined) {
      await this.applyEmailUpdate(user, dto.email);
    }
    if (dto.notifications !== undefined) {
      user.notifications = {
        emailShiftChanges: dto.notifications.emailShiftChanges,
        emailSchedulingConflicts: dto.notifications.emailSchedulingConflicts,
        weeklySummaryDigest: dto.notifications.weeklySummaryDigest,
      };
    }
    if (dto.avatarUrl !== undefined) {
      this.applyAvatarUpdate(user, dto.avatarUrl);
    }
    if (dto.password !== undefined) {
      await this.applyPasswordUpdate(user, dto.password);
    }

    await user.save();
    return this.auth.me(sid);
  }

  private applyAvatarUpdate(user: UserDocument, avatarUrl: string): void {
    const invalidAvatar = Boolean(avatarUrl) && !avatarUrl.startsWith('data:image/');
    if (invalidAvatar) {
      throw new BadRequestException('Upload a valid image file');
    }

    user.avatarUrl = avatarUrl || undefined;
  }

  private async applyEmailUpdate(user: UserDocument, rawEmail: string): Promise<void> {
    const email = rawEmail.toLowerCase();
    if (email === user.email) {
      return;
    }

    const existing = await this.users.findOne({ email }).exec();
    const takenByOther = existing !== null && String(existing._id) !== String(user._id);
    if (takenByOther) {
      throw new ConflictException('An account with this email already exists');
    }

    user.email = email;
  }

  private async applyPasswordUpdate(
    user: UserDocument,
    password: NonNullable<PatchProfileDto['password']>,
  ): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = password;
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const mustVerifyCurrent = Boolean(user.passwordHash);
    if (!mustVerifyCurrent) {
      user.passwordHash = await bcrypt.hash(newPassword, 10);
      return;
    }

    const currentOk = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!currentOk) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  async deleteAccount(sid: string | undefined): Promise<void> {
    const user = await this.auth.resolveUserFromSession(sid);
    const userId = user._id;

    await this.passwordResets.deleteMany({ userId }).exec();
    await this.sessions.deleteMany({ userId }).exec();
    await this.users.deleteOne({ _id: userId }).exec();
  }
}

function hasPatchFields(dto: PatchProfileDto) {
  return (
    dto.firstName !== undefined ||
    dto.lastName !== undefined ||
    dto.email !== undefined ||
    dto.role !== undefined ||
    dto.notifications !== undefined ||
    dto.avatarUrl !== undefined ||
    dto.password !== undefined
  );
}
