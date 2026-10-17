import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from '../auth/user.schema';
import { CalendarEvent, CalendarEventSchema } from '../events/event.schema';
import { Invite, InviteSchema } from './invite.schema';
import { Membership, MembershipSchema } from './membership.schema';
import { TeamMembershipService } from './team-membership.service';
import { Team, TeamSchema } from './team.schema';
import { TeamsService } from './teams.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Team.name, schema: TeamSchema },
      { name: Membership.name, schema: MembershipSchema },
      { name: Invite.name, schema: InviteSchema },
      { name: User.name, schema: UserSchema },
      { name: CalendarEvent.name, schema: CalendarEventSchema },
    ]),
  ],
  providers: [TeamsService, TeamMembershipService],
  exports: [TeamsService, TeamMembershipService],
})
export class TeamsModule {}
