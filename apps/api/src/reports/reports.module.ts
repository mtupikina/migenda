import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../auth/user.schema';
import { EventException, EventExceptionSchema } from '../events/event-exception.schema';
import { EventNote, EventNoteSchema } from '../events/event-note.schema';
import { EventType, EventTypeSchema } from '../events/event-type.schema';
import { CalendarEvent, CalendarEventSchema } from '../events/event.schema';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: CalendarEvent.name, schema: CalendarEventSchema },
      { name: EventType.name, schema: EventTypeSchema },
      { name: EventException.name, schema: EventExceptionSchema },
      { name: EventNote.name, schema: EventNoteSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
