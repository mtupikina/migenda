import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { EventException, EventExceptionSchema } from './event-exception.schema';
import { EventNote, EventNoteSchema } from './event-note.schema';
import { CalendarEvent, CalendarEventSchema } from './event.schema';
import { EventType, EventTypeSchema } from './event-type.schema';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { SearchService } from './search.service';
import { TimeBlock, TimeBlockSchema } from './time-block.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: CalendarEvent.name, schema: CalendarEventSchema },
      { name: EventType.name, schema: EventTypeSchema },
      { name: EventException.name, schema: EventExceptionSchema },
      { name: EventNote.name, schema: EventNoteSchema },
      { name: TimeBlock.name, schema: TimeBlockSchema },
    ]),
  ],
  controllers: [EventsController],
  providers: [EventsService, SearchService],
})
export class EventsModule {}
