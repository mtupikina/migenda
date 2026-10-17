import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { TeamInvite } from '@migenda/shared';
import { Model, Types } from 'mongoose';

import { AuthService } from '../auth/auth.service';
import { displayName } from '../auth/display-name';
import { User, UserDocument } from '../auth/user.schema';
import { isDuplicateKeyError } from '../mongo-errors';
import { Invite, InviteDocument } from './invite.schema';
import { Team, TeamDocument } from './team.schema';
import { TeamsService } from './teams.service';

const UNAVAILABLE = 'This invite is no longer available';

@Injectable()
export class InvitesService {
  constructor(
    private readonly auth: AuthService,
    private readonly teams: TeamsService,
    @InjectModel(Invite.name) private readonly invites: Model<InviteDocument>,
    @InjectModel(Team.name) private readonly teamDocs: Model<TeamDocument>,
    @InjectModel(User.name) private readonly users: Model<UserDocument>,
  ) {}

  /** Invites an existing account to the team. Nothing is emailed; the person sees it in the app. */
  async invite(teamId: Types.ObjectId, inviter: UserDocument, email: string): Promise<{ id: string }> {
    await this.teams.assertOwner(teamId, inviter._id);
    const invitee = await this.auth.findUserByEmail(email);
    if (!invitee) {
      throw new NotFoundException('No account with this email. Ask them to sign up first.');
    }
    if (await this.teams.isMember(teamId, invitee._id)) {
      throw new ConflictException('This person is already on your team');
    }
    try {
      const created = await this.invites.create({
        teamId,
        invitedUserId: invitee._id,
        invitedById: inviter._id,
      });
      return { id: String(created._id) };
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException('This person has already been invited');
      }
      throw error;
    }
  }

  async pendingFor(user: UserDocument): Promise<TeamInvite[]> {
    const pending = await this.invites.find({ invitedUserId: user._id }).sort({ createdAt: -1 }).exec();
    const [teams, inviters] = await Promise.all([
      this.teamDocs.find({ _id: { $in: pending.map((invite) => invite.teamId) } }).exec(),
      this.users.find({ _id: { $in: pending.map((invite) => invite.invitedById) } }).exec(),
    ]);
    const teamById = new Map(teams.map((team) => [String(team._id), team]));
    const inviterById = new Map(inviters.map((person) => [String(person._id), person]));

    return pending.flatMap((invite) => {
      const team = teamById.get(String(invite.teamId));
      const inviter = inviterById.get(String(invite.invitedById));
      if (!team) {
        return [];
      }
      return [
        {
          id: String(invite._id),
          teamName: team.name,
          invitedBy: inviter ? displayName(inviter) : 'Someone',
        },
      ];
    });
  }

  /** Joins the team and makes it the one the user is working in. */
  async accept(inviteId: string, user: UserDocument): Promise<{ teamId: string }> {
    const invite = await this.pendingInvite(inviteId, user);
    const teamExists = await this.teamDocs.exists({ _id: invite.teamId });
    if (!teamExists) {
      await this.invites.deleteOne({ _id: invite._id }).exec();
      throw new NotFoundException(UNAVAILABLE);
    }
    await this.teams.addMember(invite.teamId, user._id);
    await this.invites.deleteOne({ _id: invite._id }).exec();
    await this.teams.activate(user, invite.teamId);
    return { teamId: String(invite.teamId) };
  }

  async decline(inviteId: string, user: UserDocument): Promise<void> {
    const invite = await this.pendingInvite(inviteId, user);
    await this.invites.deleteOne({ _id: invite._id }).exec();
  }

  private async pendingInvite(inviteId: string, user: UserDocument): Promise<InviteDocument> {
    if (!Types.ObjectId.isValid(inviteId)) {
      throw new NotFoundException(UNAVAILABLE);
    }
    const invite = await this.invites.findOne({ _id: inviteId, invitedUserId: user._id }).exec();
    if (!invite) {
      throw new NotFoundException(UNAVAILABLE);
    }
    return invite;
  }
}
