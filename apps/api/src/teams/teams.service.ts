import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Team as TeamDto, TeamRole, TeamSummary } from '@migenda/shared';
import { Model, Types } from 'mongoose';

import { User, UserDocument } from '../auth/user.schema';
import { Invite, InviteDocument } from './invite.schema';
import { Membership, MembershipDocument } from './membership.schema';
import { personalTeamName } from './personal-team-name';
import { toTeam, toTeamSummary, type MemberRecord, type PendingRecord } from './team-dto';
import { NOT_A_MEMBER, OWNER_ONLY } from './team-errors';
import { Team, TeamDocument } from './team.schema';

@Injectable()
export class TeamsService {
  constructor(
    @InjectModel(Team.name) private readonly teams: Model<TeamDocument>,
    @InjectModel(Membership.name) private readonly memberships: Model<MembershipDocument>,
    @InjectModel(Invite.name) private readonly invites: Model<InviteDocument>,
    @InjectModel(User.name) private readonly users: Model<UserDocument>,
  ) {}

  /**
   * The team the user is currently working in. A new account gets its own team here,
   * so every caller can rely on one existing.
   */
  async ensureActiveTeam(user: UserDocument): Promise<Types.ObjectId> {
    if (user.activeTeamId && (await this.isMember(user.activeTeamId, user._id))) {
      return user.activeTeamId;
    }
    const fallback = await this.fallbackTeam(user._id);
    if (fallback) {
      await this.activate(user, fallback);
      return fallback;
    }
    return this.createPersonalTeam(user);
  }

  async isMember(teamId: Types.ObjectId, userId: Types.ObjectId): Promise<boolean> {
    const membership = await this.memberships.exists({ teamId, userId });
    return membership !== null;
  }

  async assertOwner(teamId: Types.ObjectId, userId: Types.ObjectId): Promise<void> {
    const membership = await this.memberships.findOne({ teamId, userId }).exec();
    if (membership?.role !== 'owner') {
      throw new ForbiddenException(OWNER_ONLY);
    }
  }

  async rename(teamId: Types.ObjectId, userId: Types.ObjectId, name: string): Promise<TeamDto> {
    await this.assertOwner(teamId, userId);
    await this.teams.updateOne({ _id: teamId }, { $set: { name } }, { runValidators: true }).exec();
    return this.teamFor(teamId, userId);
  }

  /** Adds the person to the team. Does nothing if they are already in it. */
  async addMember(teamId: Types.ObjectId, userId: Types.ObjectId, role: TeamRole = 'member'): Promise<void> {
    await this.memberships
      .updateOne({ teamId, userId }, { $setOnInsert: { role } }, { upsert: true })
      .exec();
  }

  /** Makes the team the one the user is working in. */
  async activate(user: UserDocument, teamId: Types.ObjectId): Promise<void> {
    user.activeTeamId = teamId;
    await user.save();
  }

  /** A new team the user owns. It becomes the one they are working in. */
  async create(user: UserDocument, name: string): Promise<TeamDto> {
    const teamId = await this.createOwnedTeam(user, name);
    return this.teamFor(teamId, user._id);
  }

  /** Every team the user belongs to, for the team switcher. */
  async listFor(userId: Types.ObjectId, activeTeamId: Types.ObjectId): Promise<TeamSummary[]> {
    const memberships = await this.memberships.find({ userId }).exec();
    const roleByTeam = new Map(memberships.map((membership) => [String(membership.teamId), membership.role]));
    const teams = await this.teams.find({ _id: { $in: memberships.map((membership) => membership.teamId) } }).exec();
    return teams
      .map((team) =>
        toTeamSummary(team, roleByTeam.get(String(team._id)) ?? 'member', String(team._id) === String(activeTeamId)),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /** Switches the team the user is working in. They must already belong to it. */
  async switchTo(user: UserDocument, teamId: string): Promise<TeamDto> {
    if (!Types.ObjectId.isValid(teamId)) {
      throw new ForbiddenException(NOT_A_MEMBER);
    }
    const target = new Types.ObjectId(teamId);
    if (!(await this.isMember(target, user._id))) {
      throw new ForbiddenException(NOT_A_MEMBER);
    }
    await this.activate(user, target);
    return this.teamFor(target, user._id);
  }

  async memberUsers(teamId: Types.ObjectId): Promise<UserDocument[]> {
    const members = await this.members(teamId);
    return members.map((member) => member.user);
  }

  /** The team as the given member sees it. */
  async teamFor(teamId: Types.ObjectId, viewerId: Types.ObjectId): Promise<TeamDto> {
    const [team, members, pending] = await Promise.all([
      this.teams.findById(teamId).exec(),
      this.members(teamId),
      this.pendingMembers(teamId),
    ]);
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    const viewer = members.find((member) => String(member.user._id) === String(viewerId));
    if (!viewer) {
      throw new ForbiddenException(NOT_A_MEMBER);
    }
    return toTeam(team, members, pending, viewer.role);
  }

  /** People who were invited and have not accepted or declined yet, oldest invite first. */
  private async pendingMembers(teamId: Types.ObjectId): Promise<PendingRecord[]> {
    const invites = await this.invites.find({ teamId }).sort({ createdAt: 1 }).exec();
    const users = await this.users
      .find({ _id: { $in: invites.map((invite) => invite.invitedUserId) } })
      .exec();
    const userById = new Map(users.map((user) => [String(user._id), user]));
    return invites.flatMap((invite) => {
      const user = userById.get(String(invite.invitedUserId));
      return user ? [{ user, inviteId: String(invite._id) }] : [];
    });
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

  /** Another team the user belongs to, preferring one they own. `except` is skipped when set. */
  async fallbackTeam(userId: Types.ObjectId, except?: Types.ObjectId): Promise<Types.ObjectId | null> {
    const notLeft = except ? { teamId: { $ne: except } } : {};
    const owned = await this.memberships.findOne({ userId, role: 'owner', ...notLeft }).exec();
    if (owned) {
      return owned.teamId;
    }
    const any = await this.memberships.findOne({ userId, ...notLeft }).exec();
    return any?.teamId ?? null;
  }

  private createPersonalTeam(user: UserDocument): Promise<Types.ObjectId> {
    return this.createOwnedTeam(user, personalTeamName(user.firstName));
  }

  private async createOwnedTeam(user: UserDocument, name: string): Promise<Types.ObjectId> {
    const team = await this.teams.create({ name, ownerId: user._id });
    await this.addMember(team._id, user._id, 'owner');
    await this.activate(user, team._id);
    return team._id;
  }
}
