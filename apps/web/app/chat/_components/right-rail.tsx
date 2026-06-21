"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../../lib/axios";
import { Icon } from "./icon";
import { Skeleton } from "./skeleton";
import { useServerEvent } from "./server-events";

type Attendee = { email: string | null; displayName: string | null };

type Overview = {
  upcomingEvent: {
    id: string | null;
    summary: string;
    start: string | null;
    end: string | null;
    location: string | null;
    hangoutLink: string | null;
    htmlLink: string | null;
    attendees: Attendee[];
  } | null;
  meetingsToday: number;
  latestDraft: {
    id: string | null;
    to: string;
    subject: string;
    snippet: string;
  } | null;
  draftCount: number;
  unreadCount: number;
};

const emptyOverview: Overview = {
  upcomingEvent: null,
  meetingsToday: 0,
  latestDraft: null,
  draftCount: 0,
  unreadCount: 0,
};

function isAllDay(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dayLabel(date: Date) {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (sameDay(date, now)) return "Today";
  if (sameDay(date, tomorrow)) return "Tomorrow";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatEventWhen(start: string | null, end: string | null) {
  if (!start) return "";
  if (isAllDay(start)) {
    return `${dayLabel(new Date(`${start}T00:00:00`))} · All day`;
  }
  const startDate = new Date(start);
  const base = `${dayLabel(startDate)}, ${formatTime(startDate)}`;
  if (!end || isAllDay(end)) return base;
  return `${base} – ${formatTime(new Date(end))}`;
}

function attendeeInitials(attendee: Attendee) {
  const source = attendee.displayName || attendee.email || "?";
  const parts = source.trim().split(/[\s@.]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

export function RightRail() {
  const { isSignedIn } = useAuth();
  const [data, setData] = useState<Overview>(emptyOverview);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const response = await api.get<Overview>("/overview");
      setData({ ...emptyOverview, ...response.data });
    } catch {
      // Keep the last known values on a transient failure.
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Realtime: refresh when Gmail or Calendar push events arrive over SSE.
  useServerEvent((event) => {
    if (
      event.plugin.startsWith("gmail") ||
      event.plugin.startsWith("googlecalendar")
    ) {
      void refresh();
    }
  });

  const { upcomingEvent, latestDraft } = data;
  const shownAttendees = upcomingEvent?.attendees.slice(0, 3) ?? [];
  const extraAttendees = Math.max(
    0,
    (upcomingEvent?.attendees.length ?? 0) - shownAttendees.length,
  );
  const meetingLink = upcomingEvent?.hangoutLink ?? upcomingEvent?.htmlLink;

  return (
    <aside className="hidden min-w-0 overflow-y-auto border-l border-[#e9edf3] bg-[#f8fafc] p-[15px] py-5 lg:block dark:border-dk-border dark:bg-[#0f141b] dark:text-dk-text">
      <div className="mx-[3px] mb-[15px] flex items-center justify-between">
        <b className="text-[13px]">Today</b>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-[#98a2b3] dark:text-dk-muted">
            {new Intl.DateTimeFormat("en", {
              month: "short",
              day: "numeric",
            }).format(new Date())}
          </span>
          <button
            type="button"
            onClick={() => void refresh()}
            aria-label="Refresh"
            className="grid h-6 w-6 place-items-center rounded-md text-[#98a2b3] dark:text-dk-muted hover:bg-[#eef2f7] hover:text-[#475467] dark:hover:bg-dk-surface-2 dark:hover:text-dk-text"
          >
            <Icon name="clock" size={13} />
          </button>
        </div>
      </div>

      {/* Upcoming meeting */}
      <article className="mb-3 rounded-[9px] border border-[#e7ecf2] bg-white p-[14px] dark:border-dk-border dark:bg-dk-surface">
        <header className="mb-3 flex items-center gap-[7px]">
          <span className="grid place-items-center text-brand-blue">
            <Icon name="calendar" size={15} />
          </span>
          <b className="flex-1 text-[10px]">Upcoming Meeting</b>
        </header>

        {loading && !upcomingEvent ? (
          <div className="grid gap-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-2.5 w-1/2" />
            <Skeleton className="mt-2 h-7 w-full" />
          </div>
        ) : upcomingEvent ? (
          <>
            <strong className="block text-[11px]">
              {upcomingEvent.summary}
            </strong>
            <small className="mt-[3px] block text-[8px] text-[#8793a4] dark:text-dk-muted">
              {formatEventWhen(upcomingEvent.start, upcomingEvent.end)}
              {upcomingEvent.location ? ` · ${upcomingEvent.location}` : ""}
            </small>

            {shownAttendees.length > 0 && (
              <div className="mt-3 flex">
                {shownAttendees.map((attendee, index) => (
                  <span
                    key={attendee.email ?? index}
                    title={attendee.email ?? undefined}
                    className="-mr-[5px] grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-[#dcecff] text-[7px] text-[#44617f] dark:border-dk-surface dark:bg-[#1e3a5a] dark:text-[#a9c9ec]"
                  >
                    {attendeeInitials(attendee)}
                  </span>
                ))}
                {extraAttendees > 0 && (
                  <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-[#dcecff] text-[7px] text-[#44617f] dark:border-dk-surface dark:bg-[#1e3a5a] dark:text-[#a9c9ec]">
                    +{extraAttendees}
                  </span>
                )}
              </div>
            )}

            {meetingLink ? (
              <a
                href={meetingLink}
                target="_blank"
                rel="noreferrer"
                className="mt-[10px] block w-full rounded-md bg-[#edf5ff] py-2 text-center text-[9px] font-bold text-[#1772d3] hover:bg-[#e1eeff] dark:bg-[#16263b] dark:text-[#5aa6ff] dark:hover:bg-[#1c3350]"
              >
                {upcomingEvent.hangoutLink ? "Join meeting" : "Open in Calendar"}
              </a>
            ) : null}
          </>
        ) : (
          <p className="text-[9px] text-[#98a2b3] dark:text-dk-muted">No upcoming meetings.</p>
        )}
      </article>

      {/* Latest draft */}
      <article className="mb-3 rounded-[9px] border border-[#e7ecf2] bg-white p-[14px] dark:border-dk-border dark:bg-dk-surface">
        <header className="mb-3 flex items-center gap-[7px]">
          <span className="grid place-items-center text-brand-blue">
            <Icon name="spark" size={15} />
          </span>
          <b className="flex-1 text-[10px]">Latest Draft</b>
        </header>

        {loading && !latestDraft ? (
          <div className="grid gap-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-2.5 w-1/2" />
            <Skeleton className="mt-1 h-10 w-full" />
            <Skeleton className="h-7 w-full" />
          </div>
        ) : latestDraft ? (
          <>
            <strong className="block text-[11px]">
              {latestDraft.subject || "(no subject)"}
            </strong>
            <small className="mt-[3px] block text-[8px] text-[#8793a4] dark:text-dk-muted">
              {latestDraft.to ? `To: ${latestDraft.to}` : "No recipient"}
            </small>
            <p className="my-[10px] line-clamp-3 text-[9px] leading-[1.6] text-[#596779] dark:text-[#aab6c4]">
              {latestDraft.snippet || "Empty draft"}
            </p>
            <Link
              href="/chat/drafts"
              className="mt-[2px] block w-full rounded-md bg-[#edf5ff] py-2 text-center text-[9px] font-bold text-[#1772d3] hover:bg-[#e1eeff] dark:bg-[#16263b] dark:text-[#5aa6ff] dark:hover:bg-[#1c3350]"
            >
              Review draft
            </Link>
          </>
        ) : (
          <p className="text-[9px] text-[#98a2b3] dark:text-dk-muted">No drafts yet.</p>
        )}
      </article>

      {/* Today's brief */}
      <article className="mb-3 rounded-[9px] border border-[#e7ecf2] bg-white p-[14px] dark:border-dk-border dark:bg-dk-surface">
        <header className="mb-3 flex items-center gap-[7px]">
          <span className="grid place-items-center text-brand-blue">
            <Icon name="tasks" size={15} />
          </span>
          <b className="flex-1 text-[10px]">Today&apos;s Brief</b>
        </header>
        <ul className="list-none">
          <li className="my-[9px] flex items-center gap-[7px] text-[9px] text-[#596779] dark:text-[#aab6c4]">
            <span className="text-brand-blue">
              <Icon name="mail" size={14} />
            </span>
            {loading ? (
              <Skeleton className="inline-block h-2.5 w-4" />
            ) : (
              <b>{data.unreadCount}</b>
            )}{" "}
            unread emails
          </li>
          <li className="my-[9px] flex items-center gap-[7px] text-[9px] text-[#596779] dark:text-[#aab6c4]">
            <span className="text-brand-blue">
              <Icon name="calendar" size={14} />
            </span>
            {loading ? (
              <Skeleton className="inline-block h-2.5 w-4" />
            ) : (
              <b>{data.meetingsToday}</b>
            )}{" "}
            {data.meetingsToday === 1 ? "meeting" : "meetings"} today
          </li>
          <li className="my-[9px] flex items-center gap-[7px] text-[9px] text-[#596779] dark:text-[#aab6c4]">
            <span className="text-brand-blue">
              <Icon name="mail" size={14} />
            </span>
            {loading ? (
              <Skeleton className="inline-block h-2.5 w-4" />
            ) : (
              <b>{data.draftCount}</b>
            )}{" "}
            {data.draftCount === 1 ? "draft" : "drafts"}
          </li>
        </ul>
      </article>
    </aside>
  );
}
