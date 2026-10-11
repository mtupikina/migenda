import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  rangeIsOpen,
  userFullName,
  type AssigneeOption,
  type Dashboard,
  type EventDetail,
  type EventNote as EventNoteDto,
  type EventType as EventTypeDto,
  type Occurrence,
} from '@migenda/shared';
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
import { containsInstant, expandEvent, ruleFrom, ruleOf, type EventRule } from './expand-event';
import { MoveEventDto } from './move-event.dto';
import { collectOccurrences } from './place-occurrence';
import { UpdateEventDto } from './update-event.dto';
import { editScope, ruleBounds, seriesClock, type EventScope } from './update-event-scope';
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
    const occurrences = collectOccurrences(rules, exceptionDocs, typeById, from, to);

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
    const instant = event.weekdays.length > 0 ? this.occurrenceInstant(occurrenceStart) : null;
    if (!instant) {
      return detail;
    }
    const oneDay = await this.resolveOccurrenceKey(event, instant);
    const exception = await this.exceptions.findOne({ eventId: event._id, occurrenceStart: oneDay }).exec();
    const clock = occurrenceClock(event, oneDay);
    return {
      ...detail,
      title: exception?.title || detail.title,
      description: exception?.description ?? detail.description,
      start: clock.start.toISOString(),
      end: clock.end.toISOString(),
    };
  }

  async updateEvent(sid: string, eventId: string, dto: UpdateEventDto): Promise<{ id: string; warning?: string }> {
    const user = await this.auth.resolveUserFromSession(sid);
    const event = await this.ownedEvent(user, eventId);
    assertTimeZone(dto.timeZone);
    const start = new Date(dto.start);
    const end = new Date(dto.end);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Enter a valid date');
    }
    const weekdays = uniqueWeekdays(dto.weekdays);
    this.assertAssignee(user, dto.assigneeId);
    await this.assertOwnedType(user, dto.typeId);
    const repeating = event.weekdays.length > 0;
    const scope = editScope(repeating, dto.scope);
    if (!scope) {
      throw new BadRequestException('Choose which events to update');
    }
    if (!repeating) {
      return this.rewriteSeries(user, event, dto, start, end, weekdays);
    }
    const instant = this.occurrenceInstant(dto.occurrenceStart);
    if (!instant) {
      throw new BadRequestException('Enter a valid date');
    }
    const key = await this.resolveOccurrenceKey(event, instant);
    return this.updateRepeating(user, event, key, dto, start, end, weekdays, scope);
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
    const instant = this.occurrenceInstant(dto.occurrenceStart);
    if (!instant) {
      throw new BadRequestException('Enter a valid date');
    }
    const start = await this.resolveOccurrenceKey(event, instant);
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
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Enter a valid date');
    }
    const key = await this.resolveOccurrenceKey(event, start);
    const exception = await this.exceptions.findOne({ eventId: event._id, occurrenceStart: key }).exec();
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
    const instant = this.occurrenceInstant(dto.occurrenceStart);
    if (!instant) {
      throw new BadRequestException('Enter a valid date');
    }
    const start = await this.resolveOccurrenceKey(event, instant);
    await this.exceptions.updateOne(
      { eventId: event._id, occurrenceStart: start },
      { $set: { completed: true } },
      { upsert: true },
    );
    return { completed: true };
  }

  async moveEvent(sid: string, eventId: string, dto: MoveEventDto): Promise<{ id: string; start: string; end: string }> {
    const user = await this.auth.resolveUserFromSession(sid);
    const event = await this.ownedEvent(user, eventId);
    const instant = this.occurrenceInstant(dto.occurrenceStart);
    if (!instant) {
      throw new BadRequestException('Enter a valid date');
    }
    const key = await this.resolveOccurrenceKey(event, instant);
    const newStart = new Date(dto.start);
    if (Number.isNaN(newStart.getTime())) {
      throw new BadRequestException('Enter a valid date');
    }
    const duration = event.end.getTime() - event.start.getTime();
    const newEnd = new Date(newStart.getTime() + duration);
    if (key.getTime() === newStart.getTime()) {
      return { id: String(event._id), start: key.toISOString(), end: new Date(key.getTime() + duration).toISOString() };
    }
    await this.assertRangeOpen(user, event, key, newStart, newEnd);
    const repeating = event.weekdays.length > 0;
    let targetId = String(event._id);
    if (!repeating) {
      await this.moveOneTime(event, key, newStart, newEnd);
    } else {
      targetId = await this.detachMoved(user, event, key, newStart, newEnd);
    }
    return { id: targetId, start: newStart.toISOString(), end: newEnd.toISOString() };
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
    const instant = this.occurrenceInstant(occurrenceStart);
    if (!instant) {
      throw new BadRequestException('Enter a valid date');
    }
    const start = await this.resolveOccurrenceKey(event, instant);
    return { event, start };
  }

  private async resolveOccurrenceKey(event: CalendarEventDocument, instant: Date): Promise<Date> {
    if (this.occurrenceAt(event, instant)) {
      return this.liveKey(event, instant);
    }
    throw new NotFoundException('Choose a task');
  }

  private async liveKey(event: CalendarEventDocument, instant: Date): Promise<Date> {
    const exception = await this.exceptions.findOne({ eventId: event._id, occurrenceStart: instant }).exec();
    if (exception?.deleted) {
      throw new NotFoundException('Choose a task');
    }
    return instant;
  }

  private async assertRangeOpen(
    user: UserDocument,
    event: CalendarEventDocument,
    key: Date,
    start: Date,
    end: Date,
  ): Promise<void> {
    const occurrences = await this.occurrencesTouching(user, start, end);
    const open = rangeIsOpen(
      occurrences,
      { eventId: String(event._id), seriesStart: key.toISOString() },
      start.toISOString(),
      end.toISOString(),
    );
    if (!open) {
      throw new BadRequestException('That time is already booked');
    }
  }

  private async occurrencesTouching(user: UserDocument, start: Date, end: Date): Promise<Occurrence[]> {
    const candidates = await this.events
      .find({
        assigneeId: user._id,
        $or: [
          { weekdays: { $size: 0 }, start: { $lt: end }, end: { $gt: start } },
          { 'weekdays.0': { $exists: true }, start: { $lt: end } },
        ],
      })
      .exec();
    const pad = candidates.reduce((max, rule) => Math.max(max, rule.end.getTime() - rule.start.getTime()), 0);
    const from = new Date(start.getTime() - pad);
    const exceptionDocs = await this.exceptions
      .find({
        eventId: { $in: candidates.map((rule) => rule._id) },
        occurrenceStart: { $gte: from, $lt: end },
      })
      .exec();
    return collectOccurrences(candidates, exceptionDocs, new Map(), from, end);
  }

  private async moveOneTime(
    event: CalendarEventDocument,
    key: Date,
    newStart: Date,
    newEnd: Date,
  ): Promise<void> {
    event.start = newStart;
    event.end = newEnd;
    await event.save();
    await this.eventNotes.updateMany({ eventId: event._id, occurrenceStart: key }, { $set: { occurrenceStart: newStart } });
    await this.exceptions.updateOne({ eventId: event._id, occurrenceStart: key }, { $set: { occurrenceStart: newStart } });
  }

  private async detachMoved(
    user: UserDocument,
    event: CalendarEventDocument,
    key: Date,
    start: Date,
    end: Date,
  ): Promise<string> {
    const exception = await this.exceptions.findOne({ eventId: event._id, occurrenceStart: key }).exec();
    return this.detachStandalone(user, event, key, {
      title: exception?.title || event.title,
      description: exception?.description ?? event.description,
      typeId: String(event.typeId),
      assigneeId: String(event.assigneeId),
      timeZone: event.timeZone,
      start,
      end,
      keepTime: true,
    });
  }

  private async updateRepeating(
    user: UserDocument,
    event: CalendarEventDocument,
    key: Date,
    dto: UpdateEventDto,
    start: Date,
    end: Date,
    weekdays: number[],
    scope: EventScope,
  ): Promise<{ id: string; warning?: string }> {
    if (scope === 'one') {
      const id = await this.updateOneOccurrence(user, event, key, dto, start, end);
      return { id };
    }
    if (scope === 'following') {
      return this.updateFollowing(user, event, key, dto, start, end, weekdays);
    }
    const clock = seriesClock(event.start, start, end, dto.timeZone);
    return this.rewriteSeries(user, event, dto, clock.start, clock.end, weekdays);
  }

  private async updateOneOccurrence(
    user: UserDocument,
    event: CalendarEventDocument,
    key: Date,
    dto: UpdateEventDto,
    start: Date,
    end: Date,
  ): Promise<string> {
    return this.detachStandalone(user, event, key, {
      title: dto.title,
      description: dto.description,
      typeId: dto.typeId,
      assigneeId: dto.assigneeId,
      timeZone: dto.timeZone,
      start,
      end,
    });
  }

  private async updateFollowing(
    user: UserDocument,
    event: CalendarEventDocument,
    key: Date,
    dto: UpdateEventDto,
    start: Date,
    end: Date,
    weekdays: number[],
  ): Promise<{ id: string; warning?: string }> {
    assertSchedule(start, end, weekdays, dto.until, dto.timeZone);
    const dayBefore = shiftYmd(zonedYmd(key, event.timeZone), -1);
    const opensSeries = dayBefore < zonedYmd(event.start, event.timeZone);
    if (opensSeries) {
      return this.rewriteSeries(user, event, dto, start, end, weekdays);
    }
    const carriedExceptions = await this.exceptions.find({ eventId: event._id, occurrenceStart: { $gte: key } }).exec();
    const carriedNotes = await this.eventNotes.find({ eventId: event._id, occurrenceStart: { $gte: key } }).exec();
    event.until = earlierUntil(event.until, dayBefore);
    await event.save();
    const created = await this.insertSeries(event, dto, start, end, weekdays);
    await this.carryOnto(created, carriedExceptions, carriedNotes);
    await this.exceptions.deleteMany({ eventId: event._id, occurrenceStart: { $gte: key } }).exec();
    await this.eventNotes.deleteMany({ eventId: event._id, occurrenceStart: { $gte: key } }).exec();

    const rule = ruleFrom(String(created._id), start, end, dto.timeZone, weekdays, dto.until);
    const warning = await this.omitConflictingOccurrences(
      user,
      created._id,
      rule,
      (item) => item.eventId === String(event._id) && item.seriesStart >= key.toISOString(),
    );
    return { id: String(created._id), warning };
  }

  private async detachStandalone(
    user: UserDocument,
    event: CalendarEventDocument,
    key: Date,
    fields: StandaloneFields,
  ): Promise<string> {
    if (!(fields.end > fields.start)) {
      throw new BadRequestException('End must be after the start');
    }
    const rule = ruleFrom('detached', fields.start, fields.end, fields.timeZone, [], null);
    if (!fields.keepTime) {
      await this.assertRuleOpen(
        user,
        rule,
        (item) => item.eventId === String(event._id) && item.seriesStart === key.toISOString(),
      );
    }
    const exception = await this.exceptions.findOne({ eventId: event._id, occurrenceStart: key }).exec();
    const created = await this.events.create({
      userId: event.userId,
      assigneeId: new Types.ObjectId(fields.assigneeId),
      typeId: new Types.ObjectId(fields.typeId),
      title: fields.title,
      description: fields.description,
      start: fields.start,
      end: fields.end,
      timeZone: fields.timeZone,
      weekdays: [],
      until: null,
    });
    await this.eventNotes.updateMany(
      { eventId: event._id, occurrenceStart: key },
      { $set: { eventId: created._id, occurrenceStart: fields.start } },
    );
    if (exception?.completed) {
      await this.exceptions.updateOne(
        { eventId: created._id, occurrenceStart: fields.start },
        { $set: { completed: true } },
        { upsert: true },
      );
    }
    await this.exceptions.updateOne(
      { eventId: event._id, occurrenceStart: key },
      {
        $set: { deleted: true },
        $unset: { title: 1, description: 1 },
        $setOnInsert: { completed: false },
      },
      { upsert: true },
    );
    return String(created._id);
  }

  private async rewriteSeries(
    user: UserDocument,
    event: CalendarEventDocument,
    dto: UpdateEventDto,
    start: Date,
    end: Date,
    weekdays: number[],
  ): Promise<{ id: string; warning?: string }> {
    assertSchedule(start, end, weekdays, dto.until, dto.timeZone);
    const rule = ruleFrom(String(event._id), start, end, dto.timeZone, weekdays, dto.until);
    let warning: string | undefined;
    if (weekdays.length === 0) {
      await this.assertRuleOpen(user, rule, (item) => item.eventId === String(event._id));
    } else {
      warning = await this.omitConflictingOccurrences(
        user,
        event._id,
        rule,
        (item) => item.eventId === String(event._id),
      );
    }
    this.assignSeries(event, dto, start, end, weekdays);
    await event.save();
    await this.clearFieldOverrides(event);
    return { id: String(event._id), warning };
  }

  private async omitConflictingOccurrences(
    user: UserDocument,
    targetEventId: Types.ObjectId,
    rule: EventRule,
    skip: (item: Occurrence) => boolean,
  ): Promise<string | undefined> {
    const bounds = ruleBounds(rule.start, rule.end, rule.weekdays, rule.until, rule.timeZone);
    const expanded = expandEvent(rule, bounds.from, bounds.to);
    const existing = await this.occurrencesTouching(user, bounds.from, bounds.to);
    const others = existing.filter((item) => !skip(item));
    const priorExceptions = await this.exceptions.find({ eventId: targetEventId }).exec();
    const deletedStarts = new Set(
      priorExceptions.filter((entry) => entry.deleted).map((entry) => entry.occurrenceStart.toISOString()),
    );
    let conflictCount = 0;
    for (const item of expanded) {
      const alreadyDeleted = deletedStarts.has(item.start.toISOString());
      if (alreadyDeleted) {
        continue;
      }
      const open = rangeIsOpen(others, { eventId: '', seriesStart: '' }, item.start.toISOString(), item.end.toISOString());
      if (!open) {
        conflictCount += 1;
        await this.exceptions.updateOne(
          { eventId: targetEventId, occurrenceStart: item.start },
          { $set: { deleted: true }, $setOnInsert: { completed: false } },
          { upsert: true },
        );
      }
    }
    if (expanded.length > 0 && conflictCount === expanded.length) {
      throw new BadRequestException('That time is already booked');
    }
    if (conflictCount > 0) {
      return 'Some occurrences were not updated because of a conflict';
    }
    return undefined;
  }

  private assignSeries(
    event: CalendarEventDocument,
    dto: UpdateEventDto,
    start: Date,
    end: Date,
    weekdays: number[],
  ): void {
    event.title = dto.title;
    event.description = dto.description;
    event.typeId = new Types.ObjectId(dto.typeId);
    event.assigneeId = new Types.ObjectId(dto.assigneeId);
    event.start = start;
    event.end = end;
    event.timeZone = dto.timeZone;
    event.weekdays = weekdays;
    event.until = dto.until;
  }

  private async insertSeries(
    event: CalendarEventDocument,
    dto: UpdateEventDto,
    start: Date,
    end: Date,
    weekdays: number[],
  ): Promise<CalendarEventDocument> {
    return this.events.create({
      userId: event.userId,
      assigneeId: new Types.ObjectId(dto.assigneeId),
      typeId: new Types.ObjectId(dto.typeId),
      title: dto.title,
      description: dto.description,
      start,
      end,
      timeZone: dto.timeZone,
      weekdays,
      until: dto.until,
    });
  }

  private async carryOnto(
    created: CalendarEventDocument,
    exceptions: EventExceptionDocument[],
    notes: EventNoteDocument[],
  ): Promise<void> {
    const byDay = this.daysOf(created);
    for (const note of notes) {
      const next = byDay.get(zonedYmd(note.occurrenceStart, created.timeZone));
      if (!next) {
        continue;
      }
      note.eventId = created._id;
      note.occurrenceStart = next;
      await note.save();
    }
    for (const entry of exceptions) {
      const kept = entry.completed && !entry.deleted;
      const next = kept ? byDay.get(zonedYmd(entry.occurrenceStart, created.timeZone)) : undefined;
      if (!next) {
        continue;
      }
      await this.exceptions.updateOne(
        { eventId: created._id, occurrenceStart: next },
        { $set: { completed: true } },
        { upsert: true },
      );
    }
  }

  private daysOf(event: CalendarEventDocument): Map<string, Date> {
    const bounds = ruleBounds(event.start, event.end, event.weekdays, event.until, event.timeZone);
    const expanded = expandEvent(ruleOf(event), bounds.from, bounds.to);
    return new Map(expanded.map((item) => [zonedYmd(item.start, event.timeZone), item.start]));
  }

  private async assertRuleOpen(user: UserDocument, rule: EventRule, skip: (item: Occurrence) => boolean): Promise<void> {
    const bounds = ruleBounds(rule.start, rule.end, rule.weekdays, rule.until, rule.timeZone);
    const expanded = expandEvent(rule, bounds.from, bounds.to);
    const existing = await this.occurrencesTouching(user, bounds.from, bounds.to);
    const others = existing.filter((item) => !skip(item));
    const blocked = expanded.some(
      (item) => !rangeIsOpen(others, { eventId: '', seriesStart: '' }, item.start.toISOString(), item.end.toISOString()),
    );
    if (blocked) {
      throw new BadRequestException('That time is already booked');
    }
  }

  private async clearFieldOverrides(event: CalendarEventDocument): Promise<void> {
    await this.exceptions
      .updateMany(
        { eventId: event._id },
        { $unset: { title: 1, description: 1 } },
      )
      .exec();
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

  private occurrenceAt(event: CalendarEventDocument, start: Date): boolean {
    return containsInstant(ruleOf(event), start);
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

function occurrenceClock(event: CalendarEventDocument, key: Date): { start: Date; end: Date } {
  const duration = event.end.getTime() - event.start.getTime();
  return { start: key, end: new Date(key.getTime() + duration) };
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

type StandaloneFields = {
  title: string;
  description: string;
  typeId: string;
  assigneeId: string;
  timeZone: string;
  start: Date;
  end: Date;
  keepTime?: boolean;
};
