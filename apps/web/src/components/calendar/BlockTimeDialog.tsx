import { useEffect, useState } from 'react';
import { Button, Group, Modal, SimpleGrid, Stack, Text, Textarea } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TIME_BLOCK_REASON_MAX, type Occurrence } from '@migenda/shared';

import { createTimeBlock, ScheduleRequestError } from '../../api/events';
import { invalidateSchedule } from '../../api/invalidateSchedule';
import { dashboardFieldClassNames } from '../../classNames/shared';
import {
  defaultBlockRange,
  findConflictingEvents,
  formatTimeRange,
} from '../../schedule/blockTime';
import type { CalendarView } from '../../schedule/calendarPeriod';
import { EventDateTimeField } from '../dashboard/EventDateTimeField';

type BlockTimeDialogProps = {
  opened: boolean;
  view: CalendarView;
  date: Date;
  occurrences: Occurrence[];
  onClose: () => void;
  onReschedule: (eventId: string, occurrenceStart: string) => void;
  onBlocked?: () => void;
};

export function BlockTimeDialog({
  opened,
  view,
  date,
  occurrences,
  onClose,
  onReschedule,
  onBlocked,
}: BlockTimeDialogProps) {
  const queryClient = useQueryClient();
  const [start, setStart] = useState(() => defaultBlockRange(view, date).start);
  const [end, setEnd] = useState(() => defaultBlockRange(view, date).end);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!opened) {
      return;
    }
    const initialRange = defaultBlockRange(view, date);
    setStart(initialRange.start);
    setEnd(initialRange.end);
    setReason('');
  }, [opened, view, date]);

  const startDate = new Date(start);
  const endDate = new Date(end);
  const startInvalid = Number.isNaN(startDate.getTime());
  const endInvalid = Number.isNaN(endDate.getTime());
  const validOrder = !startInvalid && !endInvalid && endDate > startDate;
  const startIso = !startInvalid ? startDate.toISOString() : '';
  const endIso = !endInvalid ? endDate.toISOString() : '';
  const conflicts = validOrder ? findConflictingEvents(occurrences, startIso, endIso) : [];
  const firstConflict = conflicts[0] ?? null;

  const mutation = useMutation({
    mutationFn: () => createTimeBlock({ start: startIso, end: endIso, reason: reason.trim() }),
    onSuccess: async () => {
      await invalidateSchedule(queryClient);
      setReason('');
      onBlocked?.();
      onClose();
    },
  });

  const errorMessage = mutation.error instanceof ScheduleRequestError ? mutation.error.message : null;
  const blockedDisabled = !validOrder || conflicts.length > 0 || mutation.isPending;
  const showOrderError = !validOrder && !startInvalid && !endInvalid;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Block time"
      centered
      size={520}
      radius={0}
      closeOnClickOutside={!mutation.isPending}
      closeOnEscape={!mutation.isPending}
      withCloseButton={!mutation.isPending}
    >
      <Stack gap={16}>
        <Text fz={13} c="dimmed">
          No events can be created or booked during this window.
        </Text>
        <SimpleGrid cols={2} spacing={16}>
          <EventDateTimeField
            label="Start"
            value={start}
            onChange={setStart}
          />
          <EventDateTimeField
            label="End"
            value={end}
            onChange={setEnd}
          />
        </SimpleGrid>
        {showOrderError ? (
          <Text fz={12} c="accent.7">
            End time must be after the start time
          </Text>
        ) : null}
        {firstConflict ? (
          <div className="border border-amber-300 bg-amber-50 p-3 text-[13px] text-amber-900">
            <p className="font-semibold">This time conflicts with an existing event:</p>
            <p className="mt-1">
              "{firstConflict.title}" ({formatTimeRange(firstConflict.start, firstConflict.end)})
            </p>
            <p className="mt-1 text-[12px] opacity-85">Please reschedule this event before blocking this window.</p>
            <Button
              type="button"
              size="xs"
              variant="default"
              className="mt-2.5"
              onClick={() => {
                onClose();
                onReschedule(firstConflict.eventId, firstConflict.seriesStart);
              }}
            >
              Reschedule "{firstConflict.title}"
            </Button>
          </div>
        ) : null}
        <div>
          <Textarea
            label="Reason"
            rows={4}
            maxLength={TIME_BLOCK_REASON_MAX}
            placeholder="Why is this time blocked?"
            value={reason}
            onChange={(event) => setReason(event.currentTarget.value)}
            classNames={dashboardFieldClassNames}
          />
          <p className="mt-1 text-right text-[12px] font-semibold text-accent">
            {reason.length} / {TIME_BLOCK_REASON_MAX}
          </p>
        </div>
        {errorMessage ? (
          <Text fz={13} c="accent.7">
            {errorMessage}
          </Text>
        ) : null}
        <Group justify="flex-end" gap={8}>
          <Button type="button" variant="default" disabled={mutation.isPending} onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            loading={mutation.isPending}
            disabled={blockedDisabled}
            onClick={() => mutation.mutate()}
          >
            Block time
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
