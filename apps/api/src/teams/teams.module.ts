import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from '../auth/user.schema';
import { EventException, EventExceptionSchema } from '../events/event-exception.schema';
import { EventNote, EventNoteSchema } from '../events/event-note.schema';
import { CalendarEvent, CalendarEventSchema } from '../events/event.schema';
import { EventType, EventTypeSchema } from '../events/event-type.schema';
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
      { name: EventType.name, schema: EventTypeSchema },
      { name: EventException.name, schema: EventExceptionSchema },
      { name: EventNote.name, schema: EventNoteSchema },
    ]),
  ],
  providers: [TeamsService, TeamMembershipService],
  exports: [TeamsService, TeamMembershipService],
})
export class TeamsModule {}
