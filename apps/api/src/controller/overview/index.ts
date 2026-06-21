import type { NextFunction, Request, Response } from "express";
import { corsair } from "../../server/corsair";
import { getAuthenticatedUserId } from "../auth";

type Header = { name?: string; value?: string };

function getHeader(headers: Header[] | undefined, name: string) {
  return (
    headers?.find((header) => header.name?.toLowerCase() === name.toLowerCase())
      ?.value ?? ""
  );
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toLocalDateString(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Aggregates everything the chat right-rail shows (next meeting, latest draft,
// today's brief counts) into one request so the rail can refresh cheaply.
export async function getOverview(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = getAuthenticatedUserId(req, res);
    if (!userId) return;

    const tenant = corsair.withTenant(userId);

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);
    const weekAhead = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);
    const todayStr = toLocalDateString(now);

    const [eventsResponse, draftsResponse, unreadResponse] = await Promise.all([
      tenant.googlecalendar.api.events
        .getMany({
          timeMin: startOfToday.toISOString(),
          timeMax: weekAhead.toISOString(),
          maxResults: 50,
          singleEvents: true,
          orderBy: "startTime",
        })
        .catch(() => ({ items: [] as any[] })),
      tenant.gmail.api.drafts
        .list({ maxResults: 10 })
        .catch(() => ({ drafts: [] as any[], resultSizeEstimate: 0 })),
      tenant.gmail.api.messages
        .list({ q: "is:unread", maxResults: 1 })
        .catch(() => ({ resultSizeEstimate: 0 })),
    ]);

    const events: any[] = eventsResponse?.items ?? [];

    const eventStart = (event: any) =>
      event.start?.dateTime ?? event.start?.date ?? null;
    const eventEnd = (event: any) =>
      event.end?.dateTime ?? event.end?.date ?? null;

    const upcoming =
      events.find((event) => {
        const end = eventEnd(event);
        return end ? new Date(end).getTime() >= now.getTime() : false;
      }) ?? null;

    const meetingsToday = events.filter((event) => {
      if (event.start?.date) return event.start.date === todayStr;
      const start = event.start?.dateTime;
      if (!start) return false;
      const date = new Date(start);
      return date >= startOfToday && date <= endOfToday;
    }).length;

    const upcomingEvent = upcoming
      ? {
          id: upcoming.id ?? null,
          summary: upcoming.summary ?? "(no title)",
          start: eventStart(upcoming),
          end: eventEnd(upcoming),
          location: upcoming.location ?? null,
          hangoutLink: upcoming.hangoutLink ?? null,
          htmlLink: upcoming.htmlLink ?? null,
          attendees: (upcoming.attendees ?? [])
            .map((attendee: any) => ({
              email: attendee.email ?? null,
              displayName: attendee.displayName ?? null,
            }))
            .filter((attendee: { email: string | null }) => attendee.email),
        }
      : null;

    const draftItems: any[] = draftsResponse?.drafts ?? [];
    const draftCount =
      (draftsResponse as any)?.resultSizeEstimate ?? draftItems.length;

    let latestDraft: {
      id: string | null;
      to: string;
      subject: string;
      snippet: string;
    } | null = null;

    if (draftItems.length) {
      const detailed = await Promise.all(
        draftItems
          .filter((draft) => draft.id)
          .map((draft) =>
            tenant.gmail.api.drafts
              .get({ id: draft.id, format: "metadata" })
              .catch(() => null),
          ),
      );

      const timeOf = (value: unknown) => {
        if (!value) return 0;
        const time = new Date(value as string | number | Date).getTime();
        return Number.isNaN(time) ? 0 : time;
      };

      const newest = detailed
        .filter((draft): draft is NonNullable<typeof draft> => Boolean(draft))
        .sort(
          (a, b) =>
            timeOf(b.message?.internalDate) - timeOf(a.message?.internalDate),
        )[0];

      if (newest) {
        const headers = newest.message?.payload?.headers;
        latestDraft = {
          id: newest.id ?? null,
          to: getHeader(headers, "To"),
          subject: getHeader(headers, "Subject"),
          snippet: newest.message?.snippet ?? "",
        };
      }
    }

    const unreadCount = (unreadResponse as any)?.resultSizeEstimate ?? 0;

    return res.status(200).json({
      upcomingEvent,
      meetingsToday,
      latestDraft,
      draftCount,
      unreadCount,
    });
  } catch (error) {
    return next(error);
  }
}
