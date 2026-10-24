import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from '../auth/user.schema';
import { EventNote, EventNoteSchema } from '../events/event-note.schema';
import { CalendarEvent, CalendarEventSchema } from '../events/event.schema';
import { Team, TeamSchema } from '../teams/team.schema';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Team.name, schema: TeamSchema },
      { name: User.name, schema: UserSchema },
      { name: CalendarEvent.name, schema: CalendarEventSchema },
      { name: EventNote.name, schema: EventNoteSchema },
    ]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
