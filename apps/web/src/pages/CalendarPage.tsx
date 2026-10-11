import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Loader, Text } from '@mantine/core';
import type { Occurrence } from '@migenda/shared';

import { calendarPath, calendarRange, parseCalendarDate, type CalendarView } from '../schedule/calendarPeriod';
import { AppNav } from '../components/AppNav';
import { CalendarToolbar } from '../components/calendar/CalendarToolbar';
import { BookingActionsProvider } from '../components/calendar/BookingActionsProvider';
import { BookingNotice } from '../components/calendar/BookingNotice';
import { BlockTimeDialog } from '../components/calendar/BlockTimeDialog';
import { DeleteEventDialog } from '../components/calendar/DeleteEventDialog';
import { NotesDialog } from '../components/calendar/NotesDialog';
import { CalendarDragProvider } from '../components/calendar/CalendarDragProvider';
import { DayCalendar } from '../components/calendar/DayCalendar';
import { MonthCalendar } from '../components/calendar/MonthCalendar';
import { useCalendarSearchFocus } from '../components/calendar/useCalendarSearchFocus';
import { occurrenceKey } from '../components/calendar/useBookingActions';
import { WeekCalendar } from '../components/calendar/WeekCalendar';
import { NewEventDialog } from '../components/dashboard/NewEventDialog';
import { useDashboard } from '../hooks/useDashboard';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { dayKey } from '../schedule/dashboardDays';
import { slotEventRange } from '../schedule/newEventForm';
import { DAY_CALENDAR_OPEN_HOUR } from '../components/calendar/dayCalendarLayout';

type CalendarPageProps = {
  view: CalendarView;
};

export function CalendarPage({ view }: CalendarPageProps) {
  const navigate = useNavigate();
  const { date: dateParam } = useParams();
  const date = parseCalendarDate(dateParam);
  const { data: user, isLoading } = useRequireAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingOccurrenceStart, setEditingOccurrenceStart] = useState<string | null>(null);
  const [slot, setSlot] = useState<{ day: string; hour: number } | null>(null);
  const [deleting, setDeleting] = useState<Occurrence | null>(null);
  const [noting, setNoting] = useState<Occurrence | null>(null);
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const [blockingTime, setBlockingTime] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const range = date ? calendarRange(view, date) : null;
  const dashboard = useDashboard(range, Boolean(user));

  useEffect(() => {
    if (date) {
      return;
    }
    void navigate(calendarPath(view, new Date()), { replace: true });
  }, [date, navigate, view]);

  const schedule = dashboard.data;
  useCalendarSearchFocus(schedule?.occurrences, (occurrence) => {
    setFocusKey(occurrenceKey(occurrence));
  });
  const showLoader = isLoading || !user || !date;
  const slotDate = slot ? parseCalendarDate(slot.day) : null;
  const slotRange = slotDate && slot ? slotEventRange(slotDate, slot.hour) : null;
  useEffect(() => {
    if (!notice) {
      return;
    }
    const id = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(id);
  }, [notice]);

  const closeDialog = () => {
    setDialogOpen(false);
    setSlot(null);
    setEditingEventId(null);
    setEditingOccurrenceStart(null);
  };
  const openCreate = () => {
    setSlot(null);
    setEditingEventId(null);
    setEditingOccurrenceStart(null);
    setDialogOpen(true);
  };
  const openSlot = (day: Date, hour: number) => {
    setEditingEventId(null);
    setEditingOccurrenceStart(null);
    setSlot({ day: dayKey(day), hour });
    setDialogOpen(true);
  };
  const openEdit = (eventId: string, occurrenceStart: string) => {
    setSlot(null);
    setEditingEventId(eventId);
    setEditingOccurrenceStart(occurrenceStart);
    setDialogOpen(true);
  };

  return (
    <Box mih="100vh">
      <AppNav />
      <Box maw={1200} mx="auto" px={{ base: 20, sm: 72 }} py={70}>
        {showLoader ? <Loader color="accent" /> : null}
        {date && user ? (
          <CalendarToolbar
            view={view}
            date={date}
            newEventDisabled={!schedule}
            onNewEvent={openCreate}
            onBlockTime={() => setBlockingTime(true)}
          />
        ) : null}
        {dashboard.isError ? <Text mt={16}>Could not load your schedule.</Text> : null}
        {date && schedule ? (
          <BookingActionsProvider
            resetKey={`${view}-${dateParam ?? ''}`}
            occurrences={schedule.occurrences}
            dismissed={dialogOpen || deleting !== null || noting !== null || blockingTime}
            onEdit={openEdit}
            onRemove={setDeleting}
            onNote={setNoting}
          >
            <CalendarDragProvider occurrences={schedule.occurrences}>
              {view === 'day' ? (
                <DayCalendar
                  occurrences={schedule.occurrences}
                  date={date}
                  selectedHour={slot && slot.day === dayKey(date) ? slot.hour : null}
                  focusKey={focusKey}
                  onSelectHour={(hour) => openSlot(date, hour)}
                  onClearHour={() => setSlot(null)}
                />
              ) : null}
              {view === 'week' ? (
                <WeekCalendar
                  occurrences={schedule.occurrences}
                  date={date}
                  selectedDay={slot?.day ?? null}
                  selectedHour={slot?.hour ?? null}
                  onSelectSlot={openSlot}
                  onClearSlot={() => setSlot(null)}
                />
              ) : null}
              {view === 'month' ? (
                <MonthCalendar
                  occurrences={schedule.occurrences}
                  date={date}
                  selectedDay={slot?.day ?? null}
                  onSelectDay={(day) => openSlot(day, DAY_CALENDAR_OPEN_HOUR)}
                  onClearSlot={() => setSlot(null)}
                />
              ) : null}
            </CalendarDragProvider>
          </BookingActionsProvider>
        ) : null}
        {date && schedule ? (
          <>
            <NewEventDialog
              opened={dialogOpen}
              types={schedule.types}
              assignees={schedule.assignees}
              initialRange={editingEventId ? null : slotRange}
              eventId={editingEventId}
              occurrenceStart={editingOccurrenceStart}
              onClose={closeDialog}
              onSaved={(warning) => {
                if (warning) {
                  setNotice(warning);
                }
              }}
            />
            <BlockTimeDialog
              opened={blockingTime}
              view={view}
              date={date}
              occurrences={schedule.occurrences}
              onClose={() => setBlockingTime(false)}
              onReschedule={(eventId, occurrenceStart) => {
                setBlockingTime(false);
                openEdit(eventId, occurrenceStart);
              }}
              onBlocked={() => setNotice('Time blocked')}
            />
            <DeleteEventDialog occurrence={deleting} onClose={() => setDeleting(null)} />
            <NotesDialog occurrence={noting} onClose={() => setNoting(null)} />
            <BookingNotice message={notice} />
          </>
        ) : null}
      </Box>
    </Box>
  );
}
