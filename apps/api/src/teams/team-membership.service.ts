import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Team as TeamDto } from '@migenda/shared';
import { Model, Types } from 'mongoose';

import { User, UserDocument } from '../auth/user.schema';
import { CalendarEvent, CalendarEventDocument } from '../events/event.schema';
import { Membership, MembershipDocument } from './membership.schema';
import { CANNOT_REMOVE_OWNER, CANNOT_REMOVE_SELF, NOT_A_MEMBER, NOT_ON_TEAM, ONLY_TEAM, OWNER_STAYS } from './team-errors';
import { Team, TeamDocument } from './team.schema';
import { TeamsService } from './teams.service';

/** People leaving a team or being removed, and what happens to the work they leave behind. */
@Injectable()
export class TeamMembershipService {
  constructor(
    private readonly teams: TeamsService,
    @InjectModel(Team.name) private readonly teamDocs: Model<TeamDocument>,
    @InjectModel(Membership.name) private readonly memberships: Model<MembershipDocument>,
    @InjectModel(User.name) private readonly users: Model<UserDocument>,
    @InjectModel(CalendarEvent.name) private readonly events: Model<CalendarEventDocument>,
  ) {}

  /**
   * The user leaves the team and their events there go to the team's owner.
   * The owner cannot leave, and nobody can leave their only team.
   */
  async leave(user: UserDocument, teamId: string): Promise<void> {
    if (!Types.ObjectId.isValid(teamId)) {
      throw new ForbiddenException(NOT_A_MEMBER);
    }
    const id = new Types.ObjectId(teamId);
    const membership = await this.memberships.findOne({ teamId: id, userId: user._id }).exec();
    if (!membership) {
      throw new ForbiddenException(NOT_A_MEMBER);
    }
    if (membership.role === 'owner') {
      throw new ForbiddenException(OWNER_STAYS);
    }
    const team = await this.requireTeam(id);
    const next = await this.teams.fallbackTeam(user._id, id);
    if (!next) {
      throw new ForbiddenException(ONLY_TEAM);
    }
    await this.release(team, user, membership, next);
  }

  /**
   * The owner removes a member. That person's events in this team go to the owner.
   * The owner cannot remove themselves.
   */
  async remove(owner: UserDocument, teamId: Types.ObjectId, memberId: string): Promise<TeamDto> {
    await this.teams.assertOwner(teamId, owner._id);
    if (!Types.ObjectId.isValid(memberId)) {
      throw new NotFoundException(NOT_ON_TEAM);
    }
    const targetId = new Types.ObjectId(memberId);
    if (String(targetId) === String(owner._id)) {
      throw new ForbiddenException(CANNOT_REMOVE_SELF);
    }
    const membership = await this.memberships.findOne({ teamId, userId: targetId }).exec();
    if (!membership) {
      throw new NotFoundException(NOT_ON_TEAM);
    }
    if (membership.role === 'owner') {
      throw new ForbiddenException(CANNOT_REMOVE_OWNER);
    }
    const [team, member] = await Promise.all([this.requireTeam(teamId), this.users.findById(targetId).exec()]);
    if (!member) {
      throw new NotFoundException(NOT_ON_TEAM);
    }
    const next = await this.teams.fallbackTeam(member._id, teamId);
    await this.release(team, member, membership, next);
    return this.teams.teamFor(teamId, owner._id);
  }

  /** Hands every event one person has in the team to another person. */
  async reassignEvents(teamId: Types.ObjectId, fromUserId: Types.ObjectId, toUserId: Types.ObjectId): Promise<void> {
    await this.events.updateMany({ teamId, assigneeId: fromUserId }, { $set: { assigneeId: toUserId } }).exec();
  }

  private async requireTeam(teamId: Types.ObjectId): Promise<TeamDocument> {
    const team = await this.teamDocs.findById(teamId).exec();
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }

  /** Moves their events to the owner, drops the membership, and switches them off this team if it was active. */
  private async release(
    team: TeamDocument,
    member: UserDocument,
    membership: MembershipDocument,
    next: Types.ObjectId | null,
  ): Promise<void> {
    await this.reassignEvents(team._id, member._id, team.ownerId);
    await this.memberships.deleteOne({ _id: membership._id }).exec();
    const wasActive = String(member.activeTeamId) === String(team._id);
    if (!wasActive || !next) {
      return;
    }
    await this.teams.activate(member, next);
  }
}
