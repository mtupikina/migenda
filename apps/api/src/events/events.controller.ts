import { Body, Controller, Get, Param, Patch, Post, Query, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

import { SESSION_COOKIE } from '../auth/auth.constants';
import { CompleteEventDto } from './complete-event.dto';
import { CreateEventNoteDto } from './create-event-note.dto';
import { CreateEventDto } from './create-event.dto';
import { CreateTimeBlockDto } from './create-time-block.dto';
import { DeleteEventDto } from './delete-event.dto';
import { DuplicateEventDto } from './duplicate-event.dto';
import { CreateEventTypeDto } from './create-event-type.dto';
import { DashboardQueryDto } from './dashboard-query.dto';
import { EventsService } from './events.service';
import { MoveEventDto } from './move-event.dto';
import { UpdateEventDto } from './update-event.dto';

@Controller()
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get('dashboard')
  dashboard(@Req() req: Request, @Query() query: DashboardQueryDto) {
    return this.events.dashboard(sessionId(req), query.from, query.to);
  }

  @Post('events')
  createEvent(@Req() req: Request, @Body() dto: CreateEventDto) {
    return this.events.createEvent(sessionId(req), dto);
  }

  @Get('events/:eventId')
  getEvent(
    @Req() req: Request,
    @Param('eventId') eventId: string,
    @Query('occurrenceStart') occurrenceStart?: string,
  ) {
    return this.events.getEvent(sessionId(req), eventId, occurrenceStart);
  }

  @Patch('events/:eventId')
  updateEvent(@Req() req: Request, @Param('eventId') eventId: string, @Body() dto: UpdateEventDto) {
    return this.events.updateEvent(sessionId(req), eventId, dto);
  }

  @Get('events/:eventId/notes')
  listNotes(
    @Req() req: Request,
    @Param('eventId') eventId: string,
    @Query('occurrenceStart') occurrenceStart?: string,
  ) {
    return this.events.listNotes(sessionId(req), eventId, occurrenceStart);
  }

  @Post('events/:eventId/notes')
  createNote(@Req() req: Request, @Param('eventId') eventId: string, @Body() dto: CreateEventNoteDto) {
    return this.events.createNote(sessionId(req), eventId, dto);
  }

  @Post('events/:eventId/delete')
  deleteEvent(@Req() req: Request, @Param('eventId') eventId: string, @Body() dto: DeleteEventDto) {
    return this.events.deleteEvent(sessionId(req), eventId, dto);
  }

  @Post('events/:eventId/duplicate')
  duplicateEvent(@Req() req: Request, @Param('eventId') eventId: string, @Body() dto: DuplicateEventDto) {
    return this.events.duplicateEvent(sessionId(req), eventId, dto);
  }

  @Post('events/:eventId/complete')
  completeEvent(@Req() req: Request, @Param('eventId') eventId: string, @Body() dto: CompleteEventDto) {
    return this.events.completeEvent(sessionId(req), eventId, dto);
  }

  @Post('events/:eventId/move')
  moveEvent(@Req() req: Request, @Param('eventId') eventId: string, @Body() dto: MoveEventDto) {
    return this.events.moveEvent(sessionId(req), eventId, dto);
  }

  @Post('event-types')
  createType(@Req() req: Request, @Body() dto: CreateEventTypeDto) {
    return this.events.createType(sessionId(req), dto);
  }

  @Post('time-blocks')
  createTimeBlock(@Req() req: Request, @Body() dto: CreateTimeBlockDto) {
    return this.events.createTimeBlock(sessionId(req), dto);
  }

  @Post('time-blocks/:blockId/delete')
  deleteTimeBlock(@Req() req: Request, @Param('blockId') blockId: string) {
    return this.events.deleteTimeBlock(sessionId(req), blockId);
  }
}

function sessionId(req: Request): string {
  const sid = req.cookies?.[SESSION_COOKIE] as string | undefined;
  if (!sid) {
    throw new UnauthorizedException();
  }
  return sid;
}

