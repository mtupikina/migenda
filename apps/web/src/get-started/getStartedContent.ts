import type { EventType } from '@migenda/shared';

export type GetStartedCardKind = 'schedule' | 'notes' | 'team' | 'reports';

export type GetStartedCard = {
  kind: GetStartedCardKind;
  title: string;
  description: string;
  status: string;
  href: string;
};

export type GetStartedContentInput = {
  today: string;
  todayCount: number;
  bookedCount: number;
  types: Pick<EventType, 'name'>[];
  teamName: string;
  memberCount: number;
  pendingCount: number;
};

export function getStartedKicker(firstName: string): string {
  const name = firstName.trim();
  if (!name) {
    return 'Welcome to MiGenda';
  }
  return `Welcome, ${name}`;
}

export function getStartedLead(teamName: string): string {
  const name = teamName.trim() || 'your team';
  return `On ${name} you can plan the week, leave notes on bookings, invite people, and run reports from the types you create.`;
}

export function getStartedCards(input: GetStartedContentInput): GetStartedCard[] {
  const typeNames = input.types.map((type) => type.name);
  return [
    {
      kind: 'schedule',
      title: 'Plan your schedule',
      description:
        'Create a type with a name and color, then add events on the day or week calendar. Repeat on the weekdays you choose. The checklist for today splits done from still to come.',
      status: scheduleStatus(input.todayCount, typeNames),
      href: '/dashboard',
    },
    {
      kind: 'notes',
      title: 'Leave notes on events',
      description:
        'Open a booking to write a note on that time slot. Each note keeps the author and time, and search can find it later.',
      status: notesStatus(input.bookedCount),
      href: `/calendar/day/${input.today}`,
    },
    {
      kind: 'team',
      title: 'Share with your team',
      description:
        'Invite someone by email. When they join, you can look at your own events or the whole team.',
      status: teamStatus(input.teamName, input.memberCount, input.pendingCount),
      href: '/team',
    },
    {
      kind: 'reports',
      title: 'Track with reports',
      description:
        'Pick a type you created and a time period. The report counts scheduled, completed, and upcoming work, plus planned time.',
      status: reportsStatus(typeNames),
      href: '/reports',
    },
  ];
}

function scheduleStatus(todayCount: number, typeNames: string[]): string {
  const noTypes = typeNames.length === 0;
  if (todayCount === 0 && noTypes) {
    return 'Nothing scheduled today. Start by creating a type when you add your first event.';
  }
  if (todayCount === 0) {
    return `Nothing scheduled today. Your types are ${namedList(typeNames)}.`;
  }
  if (todayCount === 1) {
    return '1 event is on today.';
  }
  return `${todayCount} events are on today.`;
}

function notesStatus(bookedCount: number): string {
  if (bookedCount === 0) {
    return 'Add an event first, then you can leave a note on it.';
  }
  return 'Notes live on each booked slot.';
}

function teamStatus(teamName: string, memberCount: number, pendingCount: number): string {
  const name = teamName.trim() || 'your team';
  const solo = memberCount === 1;
  if (solo && pendingCount === 0) {
    return `It's just you on ${name}.`;
  }
  if (solo && pendingCount === 1) {
    return `1 invite is waiting on ${name}.`;
  }
  if (solo) {
    return `${pendingCount} invites are waiting on ${name}.`;
  }
  if (memberCount === 2) {
    return `You and one teammate are on ${name}.`;
  }
  return `${memberCount} people are on ${name}.`;
}

function reportsStatus(typeNames: string[]): string {
  if (typeNames.length === 0) {
    return 'Create a type first. Reports are built from your events.';
  }
  if (typeNames.length === 1) {
    return `You can report on ${typeNames[0]}.`;
  }
  return `You can report on ${namedList(typeNames)}.`;
}

function namedList(names: string[]): string {
  if (names.length === 1) {
    return names[0];
  }
  if (names.length === 2) {
    return `${names[0]} and ${names[1]}`;
  }
  if (names.length === 3) {
    return `${names[0]}, ${names[1]}, and ${names[2]}`;
  }
  return `${names[0]}, ${names[1]}, and ${names.length - 2} more`;
}
