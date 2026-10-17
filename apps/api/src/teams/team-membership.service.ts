import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { UserDocument } from '../auth/user.schema';
import { CalendarEvent, CalendarEventDocument } from '../events/event.schema';
import { Membership, MembershipDocument } from './membership.schema';
import { NOT_A_MEMBER } from './team-errors';
import { Team, TeamDocument } from './team.schema';
import { TeamsService } from './teams.service';

const OWNER_STAYS = 'The owner cannot leave the team';
const ONLY_TEAM = 'You cannot leave your only team';

/** People leaving a team, and what happens to the work they leave behind. */
@Injectable()
export class TeamMembershipService {
  constructor(
    private readonly teams: TeamsService,
    @InjectModel(Team.name) private readonly teamDocs: Model<TeamDocument>,
    @InjectModel(Membership.name) private readonly memberships: Model<MembershipDocument>,
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
    const team = await this.teamDocs.findById(id).exec();
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    const next = await this.teams.fallbackTeam(user._id, id);
    if (!next) {
      throw new ForbiddenException(ONLY_TEAM);
    }

    await this.reassignEvents(id, user._id, team.ownerId);
    await this.memberships.deleteOne({ _id: membership._id }).exec();
    if (String(user.activeTeamId) === String(id)) {
      await this.teams.activate(user, next);
    }
  }

  /** Hands every event one person has in the team to another person. Used again when an owner removes a member. */
  async reassignEvents(teamId: Types.ObjectId, fromUserId: Types.ObjectId, toUserId: Types.ObjectId): Promise<void> {
    await this.events.updateMany({ teamId, assigneeId: fromUserId }, { $set: { assigneeId: toUserId } }).exec();
  }
}
