import { randomBytes } from 'node:crypto';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import type { User as AuthUser } from '@migenda/shared';
import { REMEMBER_ME_MS, SESSION_MS } from './auth.constants';
import { LoginDto } from './login.dto';
import type { OAuthProfile } from './oauth.types';
import { Session, SessionDocument } from './session.schema';
import { User, UserDocument } from './user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly users: Model<UserDocument>,
    @InjectModel(Session.name) private readonly sessions: Model<SessionDocument>,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.users.findOne({ email: dto.email }).exec();
    const passwordOk =
      user?.passwordHash ? await bcrypt.compare(dto.password, user.passwordHash) : false;
    if (!user || !passwordOk) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.createSession(user, dto.rememberMe === true ? REMEMBER_ME_MS : undefined);
  }

  async loginWithOAuth(profile: OAuthProfile) {
    const providerIdField = profile.provider === 'google' ? 'googleId' : 'githubId';
    let user = await this.users
      .findOne({
        $or: [{ [providerIdField]: profile.providerId }, { email: profile.email.toLowerCase() }],
      })
      .exec();

    if (!user) {
      user = await this.users.create({
        email: profile.email.toLowerCase(),
        name: profile.name,
        [providerIdField]: profile.providerId,
      });
    } else if (!user.get(providerIdField)) {
      user.set(providerIdField, profile.providerId);
      await user.save();
    }

    return this.createSession(user, REMEMBER_ME_MS);
  }

  async me(sid: string | undefined): Promise<AuthUser> {
    if (!sid) {
      throw new UnauthorizedException();
    }

    const session = await this.sessions
      .findOne({ sid, expiresAt: { $gt: new Date() } })
      .exec();
    if (!session) {
      throw new UnauthorizedException();
    }

    const user = await this.users.findById(session.userId).exec();
    if (!user) {
      throw new UnauthorizedException();
    }

    return toAuthUser(user);
  }

  private async createSession(user: UserDocument, maxAge?: number) {
    const sid = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + (maxAge ?? SESSION_MS));
    await this.sessions.create({ sid, userId: user._id, expiresAt });
    return { user: toAuthUser(user), sid, maxAge };
  }
}

function toAuthUser(user: UserDocument): AuthUser {
  return {
    id: String(user._id),
    email: user.email,
    name: user.name,
  };
}
