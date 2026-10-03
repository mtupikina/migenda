import { Body, Controller, Get, Post, Query, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

import { SESSION_COOKIE } from '../auth/auth.constants';
import { CreateEventDto } from './create-event.dto';
import { CreateEventTypeDto } from './create-event-type.dto';
import { DashboardQueryDto } from './dashboard-query.dto';
import { EventsService } from './events.service';

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

  @Post('event-types')
  createType(@Req() req: Request, @Body() dto: CreateEventTypeDto) {
    return this.events.createType(sessionId(req), dto);
  }
}

function sessionId(req: Request): string {
  const sid = req.cookies?.[SESSION_COOKIE] as string | undefined;
  if (!sid) {
    throw new UnauthorizedException();
  }
  return sid;
}
