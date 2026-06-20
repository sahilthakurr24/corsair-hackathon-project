import axios from "axios";

export type CalendarEventAttendee = {
  email?: string;
  displayName?: string;
  responseStatus?: "needsAction" | "declined" | "tentative" | "accepted";
  organizer?: boolean;
  self?: boolean;
};

export type CalendarEventDateTime = {
  date?: string;
  dateTime?: string;
  timeZone?: string;
};

export type CalendarEvent = {
  id?: string;
  status?: "tentative" | "confirmed" | "cancelled";
  summary?: string;
  description?: string;
  location?: string;
  start?: CalendarEventDateTime;
  end?: CalendarEventDateTime;
  attendees?: CalendarEventAttendee[];
  hangoutLink?: string;
  htmlLink?: string;
};

export function getEventStart(event: CalendarEvent): Date | null {
  const value = event.start?.dateTime ?? event.start?.date;
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getEventEnd(event: CalendarEvent): Date | null {
  const value = event.end?.dateTime ?? event.end?.date;
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isAllDay(event: CalendarEvent) {
  return !event.start?.dateTime;
}

const timeFormatter = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" });

export function formatEventTime(event: CalendarEvent) {
  if (isAllDay(event)) return "All day";

  const start = getEventStart(event);
  if (!start) return "";

  const end = getEventEnd(event);
  if (!end) return timeFormatter.format(start);

  return `${timeFormatter.format(start)} – ${timeFormatter.format(end)}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const dayHeadingFormatter = new Intl.DateTimeFormat("en", {
  weekday: "long",
  month: "short",
  day: "numeric",
});

export function formatDayHeading(date: Date) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, tomorrow)) return "Tomorrow";

  return dayHeadingFormatter.format(date);
}

export function formatEventDateTime(event: CalendarEvent) {
  const start = getEventStart(event);
  if (!start) return "";
  return `${formatDayHeading(start)} · ${formatEventTime(event)}`;
}

export function getErrorMessage(requestError: unknown) {
  if (axios.isAxiosError(requestError)) {
    const data = requestError.response?.data as { message?: string; reason?: string } | undefined;
    return data?.message ?? data?.reason ?? requestError.message;
  }

  return requestError instanceof Error ? requestError.message : "Something went wrong.";
}
