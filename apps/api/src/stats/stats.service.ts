import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { PublicStats } from '@migenda/shared';
import { Model } from 'mongoose';

import { User, UserDocument } from '../auth/user.schema';
import { EventNote, EventNoteDocument } from '../events/event-note.schema';
import { CalendarEvent, CalendarEventDocument } from '../events/event.schema';
import { Team, TeamDocument } from '../teams/team.schema';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Team.name) private readonly teams: Model<TeamDocument>,
    @InjectModel(User.name) private readonly users: Model<UserDocument>,
    @InjectModel(CalendarEvent.name) private readonly events: Model<CalendarEventDocument>,
    @InjectModel(EventNote.name) private readonly notes: Model<EventNoteDocument>,
  ) {}

  async publicCounts(): Promise<PublicStats> {
    const [teams, people, events, notes] = await Promise.all([
      this.teams.countDocuments().exec(),
      this.users.countDocuments().exec(),
      this.events.countDocuments().exec(),
      this.notes.countDocuments().exec(),
    ]);
    return { teams, people, events, notes };
  }
}
