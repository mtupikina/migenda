import { Loader, Text } from '@mantine/core';

import { useDashboard } from '../../hooks/useDashboard';
import { calendarRange } from '../../schedule/calendarPeriod';
import { EVENT_DETAILS_LOAD_ERROR } from '../../schedule/eventDetailsText';
import { findOccurrence } from '../../schedule/findOccurrence';
import type { SearchDetailsTarget } from '../../schedule/searchDetails';
import { EventDetailsDialog } from '../calendar/EventDetailsDialog';

type SearchEventDetailsProps = {
  target: SearchDetailsTarget | null;
  onClose: () => void;
};

export function SearchEventDetails({ target, onClose }: SearchEventDetailsProps) {
  const range = target ? calendarRange('day', new Date(target.at)) : null;
  const dashboard = useDashboard(range, range !== null);
  const occurrence =
    target && dashboard.data
      ? findOccurrence(dashboard.data.occurrences, target.eventId, target.occurrenceStart) ?? null
      : null;
  const missing = Boolean(target && dashboard.isSuccess && !occurrence);

  return (
    <EventDetailsDialog
      opened={target !== null}
      occurrence={occurrence}
      types={dashboard.data?.types ?? []}
      assignees={dashboard.data?.assignees ?? []}
      scrollToNotes={target?.scrollToNotes}
      onClose={onClose}
    >
      {dashboard.isLoading ? <Loader color="accent" /> : null}
      {dashboard.isError || missing ? <Text c="accent.7">{EVENT_DETAILS_LOAD_ERROR}</Text> : null}
    </EventDetailsDialog>
  );
}
