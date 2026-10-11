import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SEARCH_RESULT_MAX, escapeSearchRegex, type SearchResponse } from '@migenda/shared';

import { AuthService } from '../auth/auth.service';
import { EventException, EventExceptionDocument } from './event-exception.schema';
import { EventNote, EventNoteDocument } from './event-note.schema';
import { CalendarEvent, CalendarEventDocument } from './event.schema';
import {
  collectSearchResults,
  type SearchEventRecord,
  type SearchExceptionRecord,
  type SearchNoteRecord,
} from './search-events';

@Injectable()
export class SearchService {
  constructor(
    private readonly auth: AuthService,
    @InjectModel(CalendarEvent.name) private readonly events: Model<CalendarEventDocument>,
    @InjectModel(EventException.name) private readonly exceptions: Model<EventExceptionDocument>,
    @InjectModel(EventNote.name) private readonly eventNotes: Model<EventNoteDocument>,
  ) {}

  async search(sid: string, rawQuery: string | undefined, from: string): Promise<SearchResponse> {
    const user = await this.auth.resolveUserFromSession(sid);
    const query = (rawQuery ?? '').trim();
    if (!query) {
      return { query: '', results: [] };
    }

    const owned = await this.events.find({ assigneeId: user._id }).select({ _id: 1 }).exec();
    const ownedIds = owned.map((doc) => doc._id);
    if (ownedIds.length === 0) {
      return { query, results: [] };
    }

    const text = { $regex: escapeSearchRegex(query), $options: 'i' };
    const [seriesDocs, exceptionDocs, noteDocs] = await Promise.all([
      this.events
        .find({ _id: { $in: ownedIds }, $or: [{ title: text }, { description: text }] })
        .exec(),
      this.exceptions
        .find({
          eventId: { $in: ownedIds },
          deleted: { $ne: true },
          $or: [{ title: text }, { description: text }],
        })
        .exec(),
      this.eventNotes.find({ eventId: { $in: ownedIds }, text }).exec(),
    ]);

    const neededIds = uniqueObjectIds([
      ...seriesDocs.map((doc) => doc._id),
      ...exceptionDocs.map((doc) => doc.eventId),
      ...noteDocs.map((doc) => doc.eventId),
    ]);
    if (neededIds.length === 0) {
      return { query, results: [] };
    }

    const [eventDocs, allExceptions] = await Promise.all([
      this.events.find({ _id: { $in: neededIds }, assigneeId: user._id }).exec(),
      this.exceptions.find({ eventId: { $in: neededIds } }).exec(),
    ]);

    return {
      query,
      results: collectSearchResults({
        seriesIds: seriesDocs.map((doc) => String(doc._id)),
        exceptionMatches: exceptionDocs.map(toExceptionRecord),
        notes: noteDocs.map(toNoteRecord),
        events: eventDocs.map(toEventRecord),
        exceptions: allExceptions.map(toExceptionRecord),
        from: new Date(from),
        limit: SEARCH_RESULT_MAX,
      }),
    };
  }
}

function toEventRecord(doc: CalendarEventDocument): SearchEventRecord {
  return {
    id: String(doc._id),
    title: doc.title,
    description: doc.description,
    start: doc.start,
    end: doc.end,
    timeZone: doc.timeZone,
    weekdays: doc.weekdays,
    until: doc.until,
  };
}

function toExceptionRecord(doc: EventExceptionDocument): SearchExceptionRecord {
  return {
    eventId: String(doc.eventId),
    occurrenceStart: doc.occurrenceStart,
    deleted: doc.deleted,
    title: doc.title,
    description: doc.description,
  };
}

function toNoteRecord(doc: EventNoteDocument): SearchNoteRecord {
  return {
    id: String(doc._id),
    eventId: String(doc.eventId),
    occurrenceStart: doc.occurrenceStart,
    createdAt: doc.createdAt,
    authorName: doc.authorName,
    text: doc.text,
  };
}

function uniqueObjectIds(ids: Types.ObjectId[]): Types.ObjectId[] {
  const seen = new Set<string>();
  const unique: Types.ObjectId[] = [];
  for (const id of ids) {
    const key = String(id);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(id);
  }
  return unique;
}
