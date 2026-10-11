import { Link } from 'react-router-dom';
import { Button, Group, Loader, Stack, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import type { AssigneeOption, EventType, Occurrence } from '@migenda/shared';

import { fetchEvent, fetchNotes } from '../../api/events';
import { calendarPath } from '../../schedule/calendarPeriod';
import { EVENT_DETAILS_LOAD_ERROR } from '../../schedule/eventDetailsText';
import { EventDetailsFields } from './EventDetailsFields';
import { EventDetailsNotes } from './EventDetailsNotes';

type EventDetailsContentProps = {
  occurrence: Occurrence;
  types: EventType[];
  assignees: AssigneeOption[];
  scrollToNotes: boolean;
};

export function EventDetailsContent({
  occurrence,
  types,
  assignees,
  scrollToNotes,
}: EventDetailsContentProps) {
  const event = useQuery({
    queryKey: ['event', occurrence.eventId, occurrence.seriesStart],
    queryFn: () => fetchEvent(occurrence.eventId, occurrence.seriesStart),
  });
  const notes = useQuery({
    queryKey: ['notes', occurrence.eventId, occurrence.seriesStart],
    queryFn: () => fetchNotes(occurrence.eventId, occurrence.seriesStart),
  });

  const focusParams = new URLSearchParams({
    event: occurrence.eventId,
    occurrence: occurrence.seriesStart,
  });

  if (event.isLoading) {
    return <Loader color="accent" />;
  }
  if (event.isError || !event.data) {
    return <Text c="accent.7">{EVENT_DETAILS_LOAD_ERROR}</Text>;
  }

  return (
    <Stack gap={24}>
      <EventDetailsFields event={event.data} occurrence={occurrence} types={types} assignees={assignees} />
      <EventDetailsNotes
        notes={notes.data ?? []}
        loading={notes.isLoading}
        failed={notes.isError}
        scrollToNotes={scrollToNotes}
      />
      <Group justify="flex-end">
        <Button component={Link} to={`${calendarPath('day', new Date(occurrence.start))}?${focusParams}`} variant="default">
          Show on calendar
        </Button>
      </Group>
    </Stack>
  );
}
