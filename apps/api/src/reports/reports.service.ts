import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { REPORT_RANGE_MAX_DAYS, type AssigneeOption, type ReportResponse } from '@migenda/shared';

import { AuthService } from '../auth/auth.service';
import { displayName } from '../auth/display-name';
import { User, UserDocument } from '../auth/user.schema';
import { EventException, EventExceptionDocument } from '../events/event-exception.schema';
import { EventNote, EventNoteDocument } from '../events/event-note.schema';
import { toEventType } from '../events/event-type-dto';
import { EventType, EventTypeDocument } from '../events/event-type.schema';
import { CalendarEvent, CalendarEventDocument } from '../events/event.schema';
import { startsInWindow } from '../events/occurrence-window';
import { collectOccurrences, exceptionKey } from '../events/place-occurrence';
import {
  buildReportRows,
  type ReportEventRecord,
  type ReportExceptionRecord,
} from './build-report-rows';
import { ReportQueryDto } from './report-query.dto';
import { summarizeActivities, summarizeReport } from './summarize-report';

const DAY_MS = 86_400_000;

@Injectable()
export class ReportsService {
  constructor(
    private readonly auth: AuthService,
    @InjectModel(CalendarEvent.name) private readonly events: Model<CalendarEventDocument>,
    @InjectModel(EventType.name) private readonly types: Model<EventTypeDocument>,
    @InjectModel(EventException.name) private readonly exceptions: Model<EventExceptionDocument>,
    @InjectModel(EventNote.name) private readonly eventNotes: Model<EventNoteDocument>,
    @InjectModel(User.name) private readonly users: Model<UserDocument>,
  ) {}

  async report(sid: string, query: ReportQueryDto): Promise<ReportResponse> {
    const user = await this.auth.resolveUserFromSession(sid);
    const from = new Date(query.from);
    const to = new Date(query.to);
    assertRange(from, to);
    const type = await this.ownedType(user, query.typeId);

    const eventDocs = await this.events
      .find({ ...this.reportScope(user), typeId: type._id, ...startsInWindow(from, to) })
      .exec();
    const eventIds = eventDocs.map((doc) => doc._id);
    const [exceptionDocs, notes, assignees] = await Promise.all([
      this.exceptions.find({ eventId: { $in: eventIds }, occurrenceStart: { $gte: from, $lt: to } }).exec(),
      this.noteCounts(eventIds, from, to),
      this.assigneesOf(eventDocs),
    ]);

    const placed = collectOccurrences(eventDocs, exceptionDocs, new Map([[String(type._id), type]]), from, to);
    const rows = buildReportRows({
      placed,
      events: new Map(eventDocs.map((doc) => [String(doc._id), toEventRecord(doc)])),
      exceptions: new Map(
        exceptionDocs.map((doc) => [exceptionKey(String(doc.eventId), doc.occurrenceStart), toExceptionRecord(doc)]),
      ),
      notes,
      assignees,
      now: new Date(),
    });

    return {
      type: toEventType(type),
      summary: summarizeReport(rows),
      activities: summarizeActivities(rows),
      assignees: [...assignees.values()].filter((assignee) => rows.some((row) => row.assignee.id === assignee.id)),
      rows: rows.slice(query.offset, query.offset + query.limit),
      total: rows.length,
    };
  }

  /** Whose events a report may include. Widens to the user's team when teams exist. */
  private reportScope(user: UserDocument) {
    return { assigneeId: user._id };
  }

  private async ownedType(user: UserDocument, typeId: string): Promise<EventTypeDocument> {
    const type = await this.types.findOne({ _id: typeId, userId: user._id }).exec();
    if (!type) {
      throw new NotFoundException('This event type could not be found. Pick one on the Reports page.');
    }
    return type;
  }

  private async noteCounts(eventIds: Types.ObjectId[], from: Date, to: Date): Promise<Map<string, number>> {
    const groups = await this.eventNotes
      .aggregate<{ _id: { eventId: Types.ObjectId; occurrenceStart: Date }; count: number }>([
        { $match: { eventId: { $in: eventIds }, occurrenceStart: { $gte: from, $lt: to } } },
        { $group: { _id: { eventId: '$eventId', occurrenceStart: '$occurrenceStart' }, count: { $sum: 1 } } },
      ])
      .exec();
    return new Map(groups.map((group) => [exceptionKey(String(group._id.eventId), group._id.occurrenceStart), group.count]));
  }

  private async assigneesOf(eventDocs: CalendarEventDocument[]): Promise<Map<string, AssigneeOption>> {
    const ids = [...new Set(eventDocs.map((doc) => String(doc.assigneeId)))];
    const people = await this.users.find({ _id: { $in: ids } }).exec();
    return new Map(people.map((person) => [String(person._id), { id: String(person._id), name: displayName(person) }]));
  }
}

function assertRange(from: Date, to: Date): void {
  if (!(from < to)) {
    throw new BadRequestException('The end of the range must be after the start');
  }
  const days = Math.round((to.getTime() - from.getTime()) / DAY_MS);
  if (days > REPORT_RANGE_MAX_DAYS) {
    throw new BadRequestException('Choose a range of one year or less');
  }
}

function toEventRecord(doc: CalendarEventDocument): ReportEventRecord {
  return { description: doc.description, assigneeId: String(doc.assigneeId) };
}

function toExceptionRecord(doc: EventExceptionDocument): ReportExceptionRecord {
  return { description: doc.description, completedAt: doc.completedAt ?? null };
}
