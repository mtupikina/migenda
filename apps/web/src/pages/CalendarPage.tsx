import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Loader, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';

import { fetchDashboard } from '../api/events';
import { calendarPath, calendarRange, parseCalendarDate, type CalendarView } from '../calendarPeriod';
import { AppNav } from '../components/AppNav';
import { CalendarToolbar } from '../components/calendar/CalendarToolbar';
import { BookingActionsProvider } from '../components/calendar/BookingActionsProvider';
import { DayCalendar } from '../components/calendar/DayCalendar';
import { MonthCalendar } from '../components/calendar/MonthCalendar';
import { WeekCalendar } from '../components/calendar/WeekCalendar';
import { NewEventDialog } from '../components/dashboard/NewEventDialog';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { dayKey } from '../dashboardDays';
import { slotEventRange } from '../newEventForm';
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
  const [slot, setSlot] = useState<{ day: string; hour: number } | null>(null);
  const range = date ? calendarRange(view, date) : null;
  const dashboard = useQuery({
    queryKey: ['dashboard', range?.from, range?.to],
    queryFn: () => {
      if (!range) {
        throw new Error('Missing range');
      }
      return fetchDashboard(range);
    },
    enabled: Boolean(user) && range !== null,
  });

  useEffect(() => {
    if (date) {
      return;
    }
    void navigate(calendarPath(view, new Date()), { replace: true });
  }, [date, navigate, view]);

  const schedule = dashboard.data;
  const showLoader = isLoading || !user || !date;
  const slotDate = slot ? parseCalendarDate(slot.day) : null;
  const slotRange = slotDate && slot ? slotEventRange(slotDate, slot.hour) : null;
  const closeDialog = () => {
    setDialogOpen(false);
    setSlot(null);
  };
  const openSlot = (day: Date, hour: number) => {
    setSlot({ day: dayKey(day), hour });
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
            onNewEvent={() => {
              setSlot(null);
              setDialogOpen(true);
            }}
          />
        ) : null}
        {dashboard.isError ? <Text mt={16}>Could not load your schedule.</Text> : null}
        {date && schedule ? (
          <BookingActionsProvider
            resetKey={`${view}-${dateParam ?? ''}`}
            occurrences={schedule.occurrences}
            dismissed={dialogOpen}
          >
            {view === 'day' ? (
              <DayCalendar
                occurrences={schedule.occurrences}
                date={date}
                selectedHour={slot && slot.day === dayKey(date) ? slot.hour : null}
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
          </BookingActionsProvider>
        ) : null}
        {schedule ? (
          <NewEventDialog
            opened={dialogOpen}
            types={schedule.types}
            assignees={schedule.assignees}
            initialRange={slotRange}
            onClose={closeDialog}
          />
        ) : null}
      </Box>
    </Box>
  );
}
