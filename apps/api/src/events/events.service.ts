import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import type { AssigneeOption, Dashboard, EventDetail, EventNote as EventNoteDto, EventType as EventTypeDto } from '@migenda/shared';
import { userFullName } from '@migenda/shared';
import { AuthService } from '../auth/auth.service';
import { UserDocument } from '../auth/user.schema';
import { CompleteEventDto } from './complete-event.dto';
import { CreateEventNoteDto } from './create-event-note.dto';
import { DeleteEventDto } from './delete-event.dto';
import { CreateEventDto } from './create-event.dto';
import { DuplicateEventDto } from './duplicate-event.dto';
import { CreateEventTypeDto } from './create-event-type.dto';
import { EventException, EventExceptionDocument } from './event-exception.schema';
import { EventNote, EventNoteDocument } from './event-note.schema';
import { assertSchedule, assertTimeZone, uniqueWeekdays } from './event-rules';
import { CalendarEvent, CalendarEventDocument } from './event.schema';
import { EventType, EventTypeDocument } from './event-type.schema';
import { expandEvent } from './expand-event';
import { UpdateEventDto } from './update-event.dto';
import { shiftYmd, zonedLocalToUtc, zonedParts, zonedYmd } from './zoned-time';

@Injectable()
export class EventsService {
  constructor(
    private readonly auth: AuthService,
    @InjectModel(CalendarEvent.name) private readonly events: Model<CalendarEventDocument>,
    @InjectModel(EventType.name) private readonly types: Model<EventTypeDocument>,
    @InjectModel(EventException.name) private readonly exceptions: Model<EventExceptionDocument>,
    @InjectModel(EventNote.name) private readonly eventNotes: Model<EventNoteDocument>,
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
    const exceptionByKey = new Map(
      exceptionDocs.map((entry) => [exceptionKey(String(entry.eventId), entry.occurrenceStart), entry]),
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
        .filter((item) => {
          const exception = exceptionByKey.get(exceptionKey(item.eventId, item.start));
          const inWindow = item.start >= from && item.start < to;
          return inWindow && !exception?.deleted;
        })
        .map((item) => {
          const exception = exceptionByKey.get(exceptionKey(item.eventId, item.start));
          return {
            eventId: item.eventId,
            start: item.start.toISOString(),
            end: item.end.toISOString(),
            title: exception?.title || rule.title,
            typeName: type?.name ?? '',
            typeColor: type?.color ?? '',
            completed: exception?.completed ?? false,
            repeating: rule.weekdays.length > 0,
          };
        });
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

  async getEvent(sid: string, eventId: string, occurrenceStart?: string): Promise<EventDetail> {
    const user = await this.auth.resolveUserFromSession(sid);
    const event = await this.ownedEvent(user, eventId);
    const detail = toEventDetail(event);
    const oneDay = event.weekdays.length > 0 ? this.occurrenceInstant(occurrenceStart) : null;
    if (!oneDay) {
      return detail;
    }
    this.assertOccurrence(event, oneDay);
    const exception = await this.exceptions.findOne({ eventId: event._id, occurrenceStart: oneDay }).exec();
    if (!exception) {
      return detail;
    }
    return {
      ...detail,
      title: exception.title || detail.title,
      description: exception.description ?? detail.description,
    };
  }

  async updateEvent(sid: string, eventId: string, dto: UpdateEventDto): Promise<{ id: string }> {
    const user = await this.auth.resolveUserFromSession(sid);
    const event = await this.ownedEvent(user, eventId);
    assertTimeZone(dto.timeZone);
    const start = new Date(dto.start);
    const end = new Date(dto.end);
    const weekdays = uniqueWeekdays(dto.weekdays);
    assertSchedule(start, end, weekdays, dto.until, dto.timeZone);
    this.assertAssignee(user, dto.assigneeId);
    await this.assertOwnedType(user, dto.typeId);
    const oneDay = weekdays.length > 0 ? this.occurrenceInstant(dto.occurrenceStart) : null;
    if (oneDay) {
      this.assertOccurrence(event, oneDay);
    }
    if (!oneDay) {
      event.title = dto.title;
      event.description = dto.description;
    }
    event.typeId = new Types.ObjectId(dto.typeId);
    event.assigneeId = user._id;
    event.start = start;
    event.end = end;
    event.timeZone = dto.timeZone;
    event.weekdays = weekdays;
    event.until = dto.until;
    await event.save();
    if (!oneDay) {
      return { id: String(event._id) };
    }
    await this.saveOccurrenceText(event, oneDay, dto.title, dto.description);
    return { id: String(event._id) };
  }

  async listNotes(sid: string, eventId: string, occurrenceStart: string | undefined): Promise<EventNoteDto[]> {
    const { event, start } = await this.ownedOccurrence(sid, eventId, occurrenceStart);
    const notes = await this.eventNotes
      .find({ eventId: event._id, occurrenceStart: start })
      .sort({ createdAt: -1 })
      .exec();
    return notes.map(toEventNote);
  }

  async createNote(sid: string, eventId: string, dto: CreateEventNoteDto): Promise<EventNoteDto> {
    const user = await this.auth.resolveUserFromSession(sid);
    const { event, start } = await this.ownedOccurrence(sid, eventId, dto.occurrenceStart);
    const note = await this.eventNotes.create({
      eventId: event._id,
      occurrenceStart: start,
      authorId: user._id,
      authorName: noteAuthorName(user),
      text: dto.text,
    });
    return toEventNote(note);
  }

  async deleteEvent(sid: string, eventId: string, dto: DeleteEventDto): Promise<void> {
    const user = await this.auth.resolveUserFromSession(sid);
    const event = await this.ownedEvent(user, eventId);
    const start = new Date(dto.occurrenceStart);
    if (Number.isNaN(start.getTime())) {
      throw new BadRequestException('Enter a valid date');
    }
    this.assertOccurrence(event, start);
    const repeating = event.weekdays.length > 0;
    const removeSeries = !repeating || dto.scope === 'series';
    if (removeSeries) {
      await this.deleteSeries(event);
      return;
    }
    if (dto.scope === 'one') {
      await this.deleteOneOccurrence(event, start);
      return;
    }
    await this.deleteFollowing(event, start);
  }

  async duplicateEvent(sid: string, eventId: string, dto: DuplicateEventDto): Promise<{ start: string }> {
    const user = await this.auth.resolveUserFromSession(sid);
    const event = await this.ownedEvent(user, eventId);
    const start = new Date(dto.occurrenceStart);
    const end = new Date(dto.occurrenceEnd);
    const exception = await this.exceptions.findOne({ eventId: event._id, occurrenceStart: start }).exec();
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
      title: exception?.title || event.title,
      description: exception?.description ?? event.description,
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

  private async deleteSeries(event: CalendarEventDocument): Promise<void> {
    await this.eventNotes.deleteMany({ eventId: event._id }).exec();
    await this.exceptions.deleteMany({ eventId: event._id }).exec();
    await this.events.deleteOne({ _id: event._id }).exec();
  }

  private async deleteOneOccurrence(event: CalendarEventDocument, start: Date): Promise<void> {
    await this.eventNotes.deleteMany({ eventId: event._id, occurrenceStart: start }).exec();
    await this.exceptions.updateOne(
      { eventId: event._id, occurrenceStart: start },
      { $set: { deleted: true }, $setOnInsert: { completed: false } },
      { upsert: true },
    );
  }

  private async deleteFollowing(event: CalendarEventDocument, start: Date): Promise<void> {
    const dayBefore = shiftYmd(zonedYmd(start, event.timeZone), -1);
    const seriesStart = zonedYmd(event.start, event.timeZone);
    if (dayBefore < seriesStart) {
      await this.deleteSeries(event);
      return;
    }
    event.until = earlierUntil(event.until, dayBefore);
    await event.save();
    await this.exceptions.deleteMany({ eventId: event._id, occurrenceStart: { $gte: start } }).exec();
    await this.eventNotes.deleteMany({ eventId: event._id, occurrenceStart: { $gte: start } }).exec();
  }

  private async ownedOccurrence(
    sid: string,
    eventId: string,
    occurrenceStart: string | undefined,
  ): Promise<{ event: CalendarEventDocument; start: Date }> {
    const user = await this.auth.resolveUserFromSession(sid);
    const event = await this.ownedEvent(user, eventId);
    const start = this.occurrenceInstant(occurrenceStart);
    if (!start) {
      throw new BadRequestException('Enter a valid date');
    }
    this.assertOccurrence(event, start);
    return { event, start };
  }

  private occurrenceInstant(value: string | undefined): Date | null {
    if (!value) {
      return null;
    }
    const start = new Date(value);
    if (Number.isNaN(start.getTime())) {
      throw new BadRequestException('Enter a valid date');
    }
    return start;
  }

  private assertOccurrence(event: CalendarEventDocument, start: Date): void {
    if (this.occurrenceAt(event, start)) {
      return;
    }
    throw new NotFoundException('Choose a task');
  }

  private async saveOccurrenceText(
    event: CalendarEventDocument,
    occurrenceStart: Date,
    title: string,
    description: string,
  ): Promise<void> {
    const titleChanged = title !== event.title;
    const descriptionChanged = description !== event.description;
    const set: { title?: string; description?: string } = {};
    const unset: { title?: 1; description?: 1 } = {};
    if (titleChanged) {
      set.title = title;
    }
    if (!titleChanged) {
      unset.title = 1;
    }
    if (descriptionChanged) {
      set.description = description;
    }
    if (!descriptionChanged) {
      unset.description = 1;
    }
    const changed = titleChanged || descriptionChanged;
    if (!changed) {
      await this.exceptions.updateOne({ eventId: event._id, occurrenceStart }, { $unset: { title: 1, description: 1 } });
      return;
    }
    const update: {
      $set?: { title?: string; description?: string };
      $unset?: { title?: 1; description?: 1 };
      $setOnInsert: { completed: false };
    } = { $setOnInsert: { completed: false } };
    if (titleChanged || descriptionChanged) {
      update.$set = set;
    }
    if (!titleChanged || !descriptionChanged) {
      update.$unset = unset;
    }
    await this.exceptions.updateOne({ eventId: event._id, occurrenceStart }, update, { upsert: true });
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

function noteAuthorName(user: UserDocument): string {
  const name = userFullName(user);
  if (name) {
    return name;
  }
  return user.email;
}

function toEventNote(note: EventNoteDocument): EventNoteDto {
  return {
    id: String(note._id),
    text: note.text,
    authorName: note.authorName,
    createdAt: note.createdAt.toISOString(),
  };
}

function earlierUntil(current: string | null, dayBefore: string): string {
  if (current !== null && current < dayBefore) {
    return current;
  }
  return dayBefore;
}

function toEventDetail(event: CalendarEventDocument): EventDetail {
  return {
    id: String(event._id),
    title: event.title,
    typeId: String(event.typeId),
    description: event.description,
    start: event.start.toISOString(),
    end: event.end.toISOString(),
    weekdays: event.weekdays,
    until: event.until,
    timeZone: event.timeZone,
    assigneeId: String(event.assigneeId),
  };
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
