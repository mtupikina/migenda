import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  conflictingOccurrences,
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
import { displayName } from '../auth/display-name';
import { UserDocument } from '../auth/user.schema';
import { TeamsService } from '../teams/teams.service';
import { bookingOf, type Booking } from './booking';
import { CompleteEventDto } from './complete-event.dto';
import { CreateEventNoteDto } from './create-event-note.dto';
import { CreateTimeBlockDto } from './create-time-block.dto';
import { DeleteEventDto } from './delete-event.dto';
import { CreateEventDto } from './create-event.dto';
import { DuplicateEventDto } from './duplicate-event.dto';
import { CreateEventTypeDto } from './create-event-type.dto';
import { EventException, EventExceptionDocument } from './event-exception.schema';
import { EventNote, EventNoteDocument } from './event-note.schema';
import { assertSchedule, assertTimeZone, uniqueWeekdays } from './event-rules';
import { CalendarEvent, CalendarEventDocument } from './event.schema';
import { toEventType } from './event-type-dto';
import { EventType, EventTypeDocument } from './event-type.schema';
import { containsInstant, expandEvent, ruleFrom, ruleOf, type EventRule } from './expand-event';
import { MoveEventDto } from './move-event.dto';
import { startsInWindow } from './occurrence-window';
import { collectOccurrences } from './place-occurrence';
import { TimeBlock, TimeBlockDocument } from './time-block.schema';
import { UpdateEventDto } from './update-event.dto';
import { editScope, ruleBounds, seriesClock, type EventScope } from './update-event-scope';
import { shiftYmd, zonedLocalToUtc, zonedParts, zonedYmd } from './zoned-time';

@Injectable()
export class EventsService {
  constructor(
    private readonly auth: AuthService,
    private readonly teams: TeamsService,
    @InjectModel(CalendarEvent.name) private readonly events: Model<CalendarEventDocument>,
    @InjectModel(EventType.name) private readonly types: Model<EventTypeDocument>,
    @InjectModel(EventException.name) private readonly exceptions: Model<EventExceptionDocument>,
    @InjectModel(EventNote.name) private readonly eventNotes: Model<EventNoteDocument>,
    @InjectModel(TimeBlock.name) private readonly timeBlocks: Model<TimeBlockDocument>,
  ) {}

  async dashboard(sid: string, fromIso: string, toIso: string): Promise<Dashboard> {
    const { user, teamId } = await this.auth.resolveTeamScope(sid);
    const from = new Date(fromIso);
    const to = new Date(toIso);
    if (!(from < to)) {
      throw new BadRequestException('The end of the range must be after the start');
    }

    const [rules, typeDocs, blockDocs, assignees] = await Promise.all([
      this.events
        .find({ teamId, assigneeId: user._id, ...startsInWindow(from, to) })
        .exec(),
      this.typesOf(teamId),
      this.timeBlocks.find({ userId: user._id, start: { $lt: to }, end: { $gt: from } }).exec(),
      this.assigneeOptions(teamId),
    ]);
    const exceptionDocs = await this.exceptions
      .find({
        eventId: { $in: rules.map((rule) => rule._id) },
        occurrenceStart: { $gte: from, $lt: to },
      })
      .exec();

    const typeById = new Map(typeDocs.map((type) => [String(type._id), type]));
    const occurrences = collectOccurrences(rules, exceptionDocs, typeById, from, to, blockDocs);

    return {
      occurrences,
      types: typeDocs.map(toEventType),
      assignees,
    };
  }

  async createEvent(sid: string, dto: CreateEventDto): Promise<{ id: string }> {
    const { user, teamId } = await this.auth.resolveTeamScope(sid);
    assertTimeZone(dto.timeZone);
    const start = new Date(dto.start);
    const end = new Date(dto.end);
    const weekdays = uniqueWeekdays(dto.weekdays);
    assertSchedule(start, end, weekdays, dto.until, dto.timeZone);
    await this.assertAssignee(teamId, dto.assigneeId);
    await this.assertTeamType(teamId, dto.typeId);

    const created = await this.events.create({
      teamId,
      createdById: user._id,
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

    return { id: String(created._id) };
  }

  async getEvent(sid: string, eventId: string, occurrenceStart?: string): Promise<EventDetail> {
    const { teamId } = await this.auth.resolveTeamScope(sid);
    const event = await this.teamEvent(teamId, eventId);
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
    const { teamId } = await this.auth.resolveTeamScope(sid);
    const event = await this.teamEvent(teamId, eventId);
    assertTimeZone(dto.timeZone);
    const start = new Date(dto.start);
    const end = new Date(dto.end);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Enter a valid date');
    }
    const weekdays = uniqueWeekdays(dto.weekdays);
    await this.assertAssignee(teamId, dto.assigneeId);
    await this.assertTeamType(teamId, dto.typeId);
    const repeating = event.weekdays.length > 0;
    const scope = editScope(repeating, dto.scope);
    if (!scope) {
      throw new BadRequestException('Choose which events to update');
    }
    if (!repeating) {
      return this.rewriteSeries(event, dto, start, end, weekdays);
    }
    const instant = this.occurrenceInstant(dto.occurrenceStart);
    if (!instant) {
      throw new BadRequestException('Enter a valid date');
    }
    const key = await this.resolveOccurrenceKey(event, instant);
    return this.updateRepeating(event, key, dto, start, end, weekdays, scope);
  }

  async listNotes(sid: string, eventId: string, occurrenceStart: string | undefined): Promise<EventNoteDto[]> {
    const { teamId } = await this.auth.resolveTeamScope(sid);
    const { event, start } = await this.teamOccurrence(teamId, eventId, occurrenceStart);
    const notes = await this.eventNotes
      .find({ eventId: event._id, occurrenceStart: start })
      .sort({ createdAt: -1 })
      .exec();
    return notes.map(toEventNote);
  }

  async createNote(sid: string, eventId: string, dto: CreateEventNoteDto): Promise<EventNoteDto> {
    const { user, teamId } = await this.auth.resolveTeamScope(sid);
    const { event, start } = await this.teamOccurrence(teamId, eventId, dto.occurrenceStart);
    const note = await this.eventNotes.create({
      eventId: event._id,
      occurrenceStart: start,
      authorId: user._id,
      authorName: displayName(user),
      text: dto.text,
    });
    return toEventNote(note);
  }

  async deleteEvent(sid: string, eventId: string, dto: DeleteEventDto): Promise<void> {
    const { teamId } = await this.auth.resolveTeamScope(sid);
    const event = await this.teamEvent(teamId, eventId);
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
    const { user, teamId } = await this.auth.resolveTeamScope(sid);
    const event = await this.teamEvent(teamId, eventId);
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
      teamId: event.teamId,
      createdById: user._id,
      assigneeId: event.assigneeId,
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
    const { teamId } = await this.auth.resolveTeamScope(sid);
    const event = await this.teamEvent(teamId, eventId);
    const instant = this.occurrenceInstant(dto.occurrenceStart);
    if (!instant) {
      throw new BadRequestException('Enter a valid date');
    }
    const start = await this.resolveOccurrenceKey(event, instant);
    const existing = await this.exceptions.findOne({ eventId: event._id, occurrenceStart: start }).exec();
    if (existing?.completed) {
      return { completed: true };
    }
    await this.exceptions.updateOne(
      { eventId: event._id, occurrenceStart: start },
      { $set: { completed: true, completedAt: new Date() } },
      { upsert: true },
    );
    return { completed: true };
  }

  async moveEvent(sid: string, eventId: string, dto: MoveEventDto): Promise<{ id: string; start: string; end: string }> {
    const { teamId } = await this.auth.resolveTeamScope(sid);
    const event = await this.teamEvent(teamId, eventId);
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
    await this.assertRangeOpen(event, key, newStart, newEnd);
    const repeating = event.weekdays.length > 0;
    let targetId = String(event._id);
    if (!repeating) {
      await this.moveOneTime(event, key, newStart, newEnd);
    } else {
      targetId = await this.detachMoved(event, key, newStart, newEnd);
    }
    return { id: targetId, start: newStart.toISOString(), end: newEnd.toISOString() };
  }

  async listTypes(sid: string): Promise<EventTypeDto[]> {
    const { teamId } = await this.auth.resolveTeamScope(sid);
    const typeDocs = await this.typesOf(teamId);
    return typeDocs.map(toEventType);
  }

  async createType(sid: string, dto: CreateEventTypeDto): Promise<EventTypeDto> {
    const { teamId } = await this.auth.resolveTeamScope(sid);
    const existing = await this.types
      .findOne({ teamId, name: dto.name })
      .collation({ locale: 'en', strength: 2 })
      .exec();
    if (existing) {
      throw new ConflictException('A type with this name already exists');
    }

    const created = await this.types.create({
      teamId,
      name: dto.name,
      color: dto.color,
    });
    return toEventType(created);
  }

  async createTimeBlock(sid: string, dto: CreateTimeBlockDto): Promise<{ id: string }> {
    const { user, teamId } = await this.auth.resolveTeamScope(sid);
    const start = new Date(dto.start);
    const end = new Date(dto.end);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Enter a valid date');
    }
    if (!(end > start)) {
      throw new BadRequestException('End time must be after the start time');
    }
    const touching = await this.occurrencesTouching({ teamId, assigneeId: user._id }, start, end);
    const conflicting = conflictingOccurrences(
      touching.filter((item) => !item.blocked),
      { eventId: '', seriesStart: '' },
      start.toISOString(),
      end.toISOString(),
    );
    if (conflicting.length > 0) {
      const first = conflicting[0];
      throw new ConflictException(
        `This time conflicts with an existing event: ${first.title}. Please reschedule it first.`,
      );
    }
    const created = await this.timeBlocks.create({
      userId: user._id,
      start,
      end,
      reason: dto.reason ?? '',
    });
    return { id: String(created._id) };
  }

  async deleteTimeBlock(sid: string, blockId: string): Promise<void> {
    const user = await this.auth.resolveUserFromSession(sid);
    if (!Types.ObjectId.isValid(blockId)) {
      throw new NotFoundException('Block not found');
    }
    const deleted = await this.timeBlocks.findOneAndDelete({ _id: blockId, userId: user._id }).exec();
    if (!deleted) {
      throw new NotFoundException('Block not found');
    }
  }

  private typesOf(teamId: Types.ObjectId): Promise<EventTypeDocument[]> {
    return this.types.find({ teamId }).sort({ name: 1 }).exec();
  }

  private async assigneeOptions(teamId: Types.ObjectId): Promise<AssigneeOption[]> {
    const members = await this.teams.memberUsers(teamId);
    return members.map(toAssignee);
  }

  private async assertAssignee(teamId: Types.ObjectId, assigneeId: string): Promise<void> {
    const validId = Types.ObjectId.isValid(assigneeId);
    const member = validId && (await this.teams.isMember(teamId, new Types.ObjectId(assigneeId)));
    if (!member) {
      throw new BadRequestException('Choose a member of your team to assign this to');
    }
  }

  private async teamEvent(teamId: Types.ObjectId, eventId: string): Promise<CalendarEventDocument> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new NotFoundException('Choose a task');
    }
    const event = await this.events.findOne({ _id: eventId, teamId }).exec();
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

  private async teamOccurrence(
    teamId: Types.ObjectId,
    eventId: string,
    occurrenceStart: string | undefined,
  ): Promise<{ event: CalendarEventDocument; start: Date }> {
    const event = await this.teamEvent(teamId, eventId);
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
    event: CalendarEventDocument,
    key: Date,
    start: Date,
    end: Date,
  ): Promise<void> {
    const occurrences = await this.occurrencesTouching(bookingOf(event, String(event.assigneeId)), start, end);
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

  /** Occurrences on one person's calendar within a team that overlap the range. */
  private async occurrencesTouching(booking: Booking, start: Date, end: Date): Promise<Occurrence[]> {
    const [candidates, blockDocs] = await Promise.all([
      this.events
        .find({
          teamId: booking.teamId,
          assigneeId: booking.assigneeId,
          $or: [
            { weekdays: { $size: 0 }, start: { $lt: end }, end: { $gt: start } },
            { 'weekdays.0': { $exists: true }, start: { $lt: end } },
          ],
        })
        .exec(),
      this.timeBlocks.find({ userId: booking.assigneeId, start: { $lt: end }, end: { $gt: start } }).exec(),
    ]);
    const pad = candidates.reduce((max, rule) => Math.max(max, rule.end.getTime() - rule.start.getTime()), 0);
    const from = new Date(start.getTime() - pad);
    const exceptionDocs = await this.exceptions
      .find({
        eventId: { $in: candidates.map((rule) => rule._id) },
        occurrenceStart: { $gte: from, $lt: end },
      })
      .exec();
    return collectOccurrences(candidates, exceptionDocs, new Map(), from, end, blockDocs);
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
    event: CalendarEventDocument,
    key: Date,
    start: Date,
    end: Date,
  ): Promise<string> {
    const exception = await this.exceptions.findOne({ eventId: event._id, occurrenceStart: key }).exec();
    return this.detachStandalone(event, key, {
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
    event: CalendarEventDocument,
    key: Date,
    dto: UpdateEventDto,
    start: Date,
    end: Date,
    weekdays: number[],
    scope: EventScope,
  ): Promise<{ id: string; warning?: string }> {
    if (scope === 'one') {
      const id = await this.updateOneOccurrence(event, key, dto, start, end);
      return { id };
    }
    if (scope === 'following') {
      return this.updateFollowing(event, key, dto, start, end, weekdays);
    }
    const clock = seriesClock(event.start, start, end, dto.timeZone);
    return this.rewriteSeries(event, dto, clock.start, clock.end, weekdays);
  }

  private async updateOneOccurrence(
    event: CalendarEventDocument,
    key: Date,
    dto: UpdateEventDto,
    start: Date,
    end: Date,
  ): Promise<string> {
    return this.detachStandalone(event, key, {
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
      return this.rewriteSeries(event, dto, start, end, weekdays);
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
      bookingOf(event, dto.assigneeId),
      created._id,
      rule,
      (item) => item.eventId === String(event._id) && item.seriesStart >= key.toISOString(),
    );
    return { id: String(created._id), warning };
  }

  private async detachStandalone(
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
        bookingOf(event, fields.assigneeId),
        rule,
        (item) => item.eventId === String(event._id) && item.seriesStart === key.toISOString(),
      );
    }
    const exception = await this.exceptions.findOne({ eventId: event._id, occurrenceStart: key }).exec();
    const created = await this.events.create({
      teamId: event.teamId,
      createdById: event.createdById,
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
        { $set: { completed: true, completedAt: exception.completedAt ?? null } },
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
    event: CalendarEventDocument,
    dto: UpdateEventDto,
    start: Date,
    end: Date,
    weekdays: number[],
  ): Promise<{ id: string; warning?: string }> {
    assertSchedule(start, end, weekdays, dto.until, dto.timeZone);
    const rule = ruleFrom(String(event._id), start, end, dto.timeZone, weekdays, dto.until);
    const booking = bookingOf(event, dto.assigneeId);
    let warning: string | undefined;
    if (weekdays.length === 0) {
      await this.assertRuleOpen(booking, rule, (item) => item.eventId === String(event._id));
    } else {
      warning = await this.omitConflictingOccurrences(
        booking,
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
    booking: Booking,
    targetEventId: Types.ObjectId,
    rule: EventRule,
    skip: (item: Occurrence) => boolean,
  ): Promise<string | undefined> {
    const bounds = ruleBounds(rule.start, rule.end, rule.weekdays, rule.until, rule.timeZone);
    const expanded = expandEvent(rule, bounds.from, bounds.to);
    const existing = await this.occurrencesTouching(booking, bounds.from, bounds.to);
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
      teamId: event.teamId,
      createdById: event.createdById,
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
        { $set: { completed: true, completedAt: entry.completedAt ?? null } },
        { upsert: true },
      );
    }
  }

  private daysOf(event: CalendarEventDocument): Map<string, Date> {
    const bounds = ruleBounds(event.start, event.end, event.weekdays, event.until, event.timeZone);
    const expanded = expandEvent(ruleOf(event), bounds.from, bounds.to);
    return new Map(expanded.map((item) => [zonedYmd(item.start, event.timeZone), item.start]));
  }

  private async assertRuleOpen(booking: Booking, rule: EventRule, skip: (item: Occurrence) => boolean): Promise<void> {
    const bounds = ruleBounds(rule.start, rule.end, rule.weekdays, rule.until, rule.timeZone);
    const expanded = expandEvent(rule, bounds.from, bounds.to);
    const existing = await this.occurrencesTouching(booking, bounds.from, bounds.to);
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

  private async assertTeamType(teamId: Types.ObjectId, typeId: string): Promise<void> {
    if (!Types.ObjectId.isValid(typeId)) {
      throw new NotFoundException('Choose a type');
    }
    const type = await this.types.findOne({ _id: typeId, teamId }).exec();
    if (!type) {
      throw new NotFoundException('Choose a type');
    }
  }
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
