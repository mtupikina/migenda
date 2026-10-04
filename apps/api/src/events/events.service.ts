import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import type { AssigneeOption, Dashboard, EventType as EventTypeDto } from '@migenda/shared';
import { userFullName } from '@migenda/shared';
import { AuthService } from '../auth/auth.service';
import { UserDocument } from '../auth/user.schema';
import { CompleteEventDto } from './complete-event.dto';
import { CreateEventDto } from './create-event.dto';
import { DuplicateEventDto } from './duplicate-event.dto';
import { CreateEventTypeDto } from './create-event-type.dto';
import { EventException, EventExceptionDocument } from './event-exception.schema';
import { assertSchedule, assertTimeZone, uniqueWeekdays } from './event-rules';
import { CalendarEvent, CalendarEventDocument } from './event.schema';
import { EventType, EventTypeDocument } from './event-type.schema';
import { expandEvent } from './expand-event';
import { shiftYmd, zonedLocalToUtc, zonedParts, zonedYmd } from './zoned-time';

@Injectable()
export class EventsService {
  constructor(
    private readonly auth: AuthService,
    @InjectModel(CalendarEvent.name) private readonly events: Model<CalendarEventDocument>,
    @InjectModel(EventType.name) private readonly types: Model<EventTypeDocument>,
    @InjectModel(EventException.name) private readonly exceptions: Model<EventExceptionDocument>,
  ) {}

  async dashboard(sid: string, fromIso: string, toIso: string): Promise<Dashboard> {
    const user = await this.auth.resolveUserFromSession(sid);
    const from = new Date(fromIso);
    const to = new Date(toIso);
    if (!(from < to)) {
      throw new BadRequestException('The end of the range must be after the start');
    }

    const [rules, typeDocs] = await Promise.all([
      this.events
        .find({
          assigneeId: user._id,
          $or: [
            { weekdays: { $size: 0 }, start: { $gte: from, $lt: to } },
            { 'weekdays.0': { $exists: true }, start: { $lt: to } },
          ],
        })
        .exec(),
      this.types.find({ userId: user._id }).sort({ name: 1 }).exec(),
    ]);
    const exceptionDocs = await this.exceptions
      .find({
        eventId: { $in: rules.map((rule) => rule._id) },
        occurrenceStart: { $gte: from, $lt: to },
      })
      .exec();

    const typeById = new Map(typeDocs.map((type) => [String(type._id), type]));
    const completedKeys = new Set(
      exceptionDocs
        .filter((entry) => entry.completed)
        .map((entry) => exceptionKey(String(entry.eventId), entry.occurrenceStart)),
    );

    const occurrences = rules.flatMap((rule) => {
      const type = typeById.get(String(rule.typeId));
      const expanded = expandEvent(
        {
          id: String(rule._id),
          start: rule.start,
          end: rule.end,
          timeZone: rule.timeZone,
          weekdays: rule.weekdays,
          until: rule.until,
        },
        from,
        to,
      );
      return expanded
        .filter((item) => item.start >= from && item.start < to)
        .map((item) => ({
          eventId: item.eventId,
          start: item.start.toISOString(),
          end: item.end.toISOString(),
          title: rule.title,
          typeName: type?.name ?? '',
          typeColor: type?.color ?? '',
          completed: completedKeys.has(exceptionKey(item.eventId, item.start)),
        }));
    });

    occurrences.sort((left, right) => left.start.localeCompare(right.start));

    return {
      occurrences,
      types: typeDocs.map(toEventType),
      assignees: [toAssignee(user)],
    };
  }

  async createEvent(sid: string, dto: CreateEventDto): Promise<{ id: string }> {
    const user = await this.auth.resolveUserFromSession(sid);
    assertTimeZone(dto.timeZone);
    const start = new Date(dto.start);
    const end = new Date(dto.end);
    const weekdays = uniqueWeekdays(dto.weekdays);
    assertSchedule(start, end, weekdays, dto.until, dto.timeZone);
    this.assertAssignee(user, dto.assigneeId);
    await this.assertOwnedType(user, dto.typeId);

    const created = await this.events.create({
      userId: user._id,
      assigneeId: user._id,
      typeId: new Types.ObjectId(dto.typeId),
      title: dto.title,
      description: dto.description,
      start,
      end,
      timeZone: dto.timeZone,
      weekdays,
      until: dto.until,
    });

    return { id: String(created._id) };
  }

  async duplicateEvent(sid: string, eventId: string, dto: DuplicateEventDto): Promise<{ start: string }> {
    const user = await this.auth.resolveUserFromSession(sid);
    const event = await this.ownedEvent(user, eventId);
    const start = new Date(dto.occurrenceStart);
    const end = new Date(dto.occurrenceEnd);
    if (!(end > start)) {
      throw new BadRequestException('End must be after the start');
    }
    assertTimeZone(event.timeZone);
    const clock = zonedParts(start, event.timeZone);
    const copyStart = zonedLocalToUtc(
      shiftYmd(zonedYmd(start, event.timeZone), 1),
      Number(clock.hour),
      Number(clock.minute),
      event.timeZone,
    );
    const copyEnd = new Date(copyStart.getTime() + (end.getTime() - start.getTime()));
    await this.events.create({
      userId: user._id,
      assigneeId: user._id,
      typeId: event.typeId,
      title: event.title,
      description: event.description,
      start: copyStart,
      end: copyEnd,
      timeZone: event.timeZone,
      weekdays: [],
      until: null,
    });
    return { start: copyStart.toISOString() };
  }

  async completeEvent(sid: string, eventId: string, dto: CompleteEventDto): Promise<{ completed: true }> {
    const user = await this.auth.resolveUserFromSession(sid);
    const event = await this.ownedEvent(user, eventId);
    const start = new Date(dto.occurrenceStart);
    const matches = this.occurrenceAt(event, start);
    if (!matches) {
      throw new NotFoundException('Choose a task');
    }
    await this.exceptions.updateOne(
      { eventId: event._id, occurrenceStart: start },
      { $set: { completed: true } },
      { upsert: true },
    );
    return { completed: true };
  }

  async createType(sid: string, dto: CreateEventTypeDto): Promise<EventTypeDto> {
    const user = await this.auth.resolveUserFromSession(sid);
    const existing = await this.types
      .findOne({ userId: user._id, name: dto.name })
      .collation({ locale: 'en', strength: 2 })
      .exec();
    if (existing) {
      throw new ConflictException('A type with this name already exists');
    }

    const created = await this.types.create({
      userId: user._id,
      name: dto.name,
      color: dto.color,
    });
    return toEventType(created);
  }

  private assertAssignee(user: UserDocument, assigneeId: string): void {
    if (assigneeId === String(user._id)) {
      return;
    }
    throw new BadRequestException('You can only assign a task to yourself until you have a team');
  }

  private async ownedEvent(user: UserDocument, eventId: string): Promise<CalendarEventDocument> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new NotFoundException('Choose a task');
    }
    const event = await this.events.findOne({ _id: eventId, assigneeId: user._id }).exec();
    if (!event) {
      throw new NotFoundException('Choose a task');
    }
    return event;
  }

  private occurrenceAt(event: CalendarEventDocument, start: Date): boolean {
    return expandEvent(
      {
        id: String(event._id),
        start: event.start,
        end: event.end,
        timeZone: event.timeZone,
        weekdays: event.weekdays,
        until: event.until,
      },
      new Date(start.getTime() - 1),
      new Date(start.getTime() + 1),
    ).some((item) => item.start.getTime() === start.getTime());
  }

  private async assertOwnedType(user: UserDocument, typeId: string): Promise<void> {
    if (!Types.ObjectId.isValid(typeId)) {
      throw new NotFoundException('Choose a type');
    }
    const type = await this.types.findOne({ _id: typeId, userId: user._id }).exec();
    if (!type) {
      throw new NotFoundException('Choose a type');
    }
  }
}

function toEventType(type: EventTypeDocument): EventTypeDto {
  return {
    id: String(type._id),
    name: type.name,
    color: type.color,
  };
}

function toAssignee(user: UserDocument): AssigneeOption {
  return {
    id: String(user._id),
    name: userFullName(user),
  };
}

function exceptionKey(eventId: string, start: Date): string {
  return `${eventId}:${start.toISOString()}`;
}
