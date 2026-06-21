"use client";

import { useAuth } from "@clerk/nextjs";
import type { DatesSetArg, EventClickArg, EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { api } from "../../../lib/axios";
import { ChatHeader } from "../_components/chat-header";
import { EventDetailPanel } from "./_components/event-detail-panel";
import { type CalendarEvent, getErrorMessage, isAllDay } from "./_lib/calendar";

type CalendarEventsResponse = {
  events: CalendarEvent[];
  nextPageToken: string | null;
};

export default function CalendarView() {
  const { isSignedIn } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const lastRangeRef = useRef<string | null>(null);

  const fetchRange = useCallback(
    async (start: Date, end: Date) => {
      if (!isSignedIn) return;

      const rangeKey = `${start.toISOString()}_${end.toISOString()}`;
      if (lastRangeRef.current === rangeKey) return;
      lastRangeRef.current = rangeKey;

      setLoading(true);
      setError(null);

      try {
        const response = await api.get<CalendarEventsResponse>("/calendar/events", {
          params: {
            timeMin: start.toISOString(),
            timeMax: end.toISOString(),
            pageSize: 100,
          },
        });

        // Pass every fetched event straight through to FullCalendar - none filtered out.
        setEvents(response.data.events ?? []);
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    },
    [isSignedIn],
  );

  function handleDatesSet(info: DatesSetArg) {
    void fetchRange(info.start, info.end);
  }

  function handleEventClick(info: EventClickArg) {
    setSelectedEvent(info.event.extendedProps.event as CalendarEvent);
  }

  const fullCalendarEvents = useMemo<EventInput[]>(
    () =>
      events
        .filter((event) => event.start?.dateTime || event.start?.date)
        .map((event) => ({
          id: event.id,
          title: event.summary || "(No title)",
          start: event.start?.dateTime ?? event.start?.date,
          end: event.end?.dateTime ?? event.end?.date,
          allDay: isAllDay(event),
          backgroundColor: event.status === "cancelled" ? "#fff6f5" : undefined,
          borderColor: event.status === "cancelled" ? "#f4c7c3" : undefined,
          textColor: event.status === "cancelled" ? "#9d322b" : undefined,
          extendedProps: { event },
        })),
    [events],
  );

  return (
    <>
      <ChatHeader
        icon="calendar"
        title="Calendar"
        status={loading ? "Syncing…" : `${events.length} events in view`}
        subtitle="Synced from your connected Google Calendar"
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-[14px] md:px-[54px]">
        {error && (
          <div className="mb-5 grid max-w-[680px] grid-cols-[1fr_auto] gap-x-3 gap-y-[3px] rounded-lg border border-[#f4c7c3] bg-[#fff6f5] px-[13px] py-[11px] text-[10px] text-[#9d322b] dark:border-[#5a2c2c] dark:bg-[#2a1517] dark:text-[#f0a8a0]">
            <b className="col-start-1">Couldn’t load calendar</b>
            <span className="col-start-1">{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="col-start-2 row-span-2 row-start-1 border-0 bg-transparent text-[9px] text-inherit underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="calendar-surface rounded-[12px] border border-[#e7ecf2] bg-white p-3 text-[13px] dark:border-dk-border dark:bg-dk-surface">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{ left: "title", right: "today prev,next" }}
            height="auto"
            dayMaxEvents
            events={fullCalendarEvents}
            eventClick={handleEventClick}
            datesSet={handleDatesSet}
          />
        </div>

        {selectedEvent && (
          <EventDetailPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        )}
      </div>
    </>
  );
}
