import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Team as TeamDto } from '@migenda/shared';
import { Model, Types } from 'mongoose';

import { User, UserDocument } from '../auth/user.schema';
import { Membership, MembershipDocument } from './membership.schema';
import { personalTeamName } from './personal-team-name';
import { toTeam, type MemberRecord } from './team-dto';
import { Team, TeamDocument } from './team.schema';

@Injectable()
export class TeamsService {
  constructor(
    @InjectModel(Team.name) private readonly teams: Model<TeamDocument>,
    @InjectModel(Membership.name) private readonly memberships: Model<MembershipDocument>,
    @InjectModel(User.name) private readonly users: Model<UserDocument>,
  ) {}

  /**
   * The team the user is currently working in. A new account gets its own team here,
   * so every caller can rely on one existing.
   */
  async ensureActiveTeam(user: UserDocument): Promise<Types.ObjectId> {
    if (user.activeTeamId) {
      return user.activeTeamId;
    }
    return this.createPersonalTeam(user);
  }

  async isMember(teamId: Types.ObjectId, userId: Types.ObjectId): Promise<boolean> {
    const membership = await this.memberships.exists({ teamId, userId });
    return membership !== null;
  }

  async memberUsers(teamId: Types.ObjectId): Promise<UserDocument[]> {
    const members = await this.members(teamId);
    return members.map((member) => member.user);
  }

  /** The team as the given member sees it. */
  async teamFor(teamId: Types.ObjectId, viewerId: Types.ObjectId): Promise<TeamDto> {
    const [team, members] = await Promise.all([this.teams.findById(teamId).exec(), this.members(teamId)]);
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    const viewer = members.find((member) => String(member.user._id) === String(viewerId));
    if (!viewer) {
      throw new ForbiddenException('You are not a member of this team');
    }
    return toTeam(team, members, viewer.role);
  }

  private async members(teamId: Types.ObjectId): Promise<MemberRecord[]> {
    const memberships = await this.memberships.find({ teamId }).exec();
    const roleByUser = new Map(memberships.map((membership) => [String(membership.userId), membership.role]));
    const users = await this.users
      .find({ _id: { $in: memberships.map((membership) => membership.userId) } })
      .sort({ firstName: 1, lastName: 1 })
      .exec();
    return users.map((user) => ({ user, role: roleByUser.get(String(user._id)) ?? 'member' }));
  }

  private async createPersonalTeam(user: UserDocument): Promise<Types.ObjectId> {
    const team = await this.teams.create({
      name: personalTeamName(user.firstName),
      ownerId: user._id,
    });
    await this.memberships.create({ teamId: team._id, userId: user._id, role: 'owner' });
    user.activeTeamId = team._id;
    await user.save();
    return team._id;
  }
}
