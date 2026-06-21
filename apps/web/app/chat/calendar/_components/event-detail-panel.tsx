"use client";

import { Icon } from "../../_components/icon";
import { type CalendarEvent, formatEventDateTime } from "../_lib/calendar";

const RESPONSE_LABEL: Record<string, string> = {
  accepted: "Accepted",
  declined: "Declined",
  tentative: "Maybe",
  needsAction: "No response",
};

export function EventDetailPanel({
  event,
  onClose,
}: {
  event: CalendarEvent;
  onClose: () => void;
}) {
  const attendees = event.attendees ?? [];
  const isCancelled = event.status === "cancelled";

  return (
    <div className="mt-4 rounded-[12px] border border-[#e7ecf2] bg-white p-4 dark:border-dk-border dark:bg-dk-surface">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <strong
              className={`block text-[12px] text-[#172033] dark:text-dk-text ${isCancelled ? "line-through" : ""}`}
            >
              {event.summary || "(No title)"}
            </strong>
            {isCancelled && (
              <span className="flex-none text-[8px] font-semibold text-[#b42318]">Cancelled</span>
            )}
          </div>
          <p className="mt-1 text-[10px] text-[#7f8b9e] dark:text-dk-muted">{formatEventDateTime(event)}</p>
          {event.location && (
            <p className="mt-1 flex items-center gap-1 text-[9px] text-[#7f8b9e] dark:text-dk-muted">
              <Icon name="pin" size={11} />
              {event.location}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex-none text-[#98a2b3] hover:text-[#344054] dark:hover:text-dk-text"
        >
          <Icon name="close" size={14} />
        </button>
      </div>

      {event.description && (
        <p className="mt-3 border-t border-[#f0f2f5] pt-3 text-[10px] leading-[1.6] whitespace-pre-wrap text-[#475467] dark:border-dk-border dark:text-[#aab6c4]">
          {event.description}
        </p>
      )}

      {attendees.length > 0 && (
        <div className="mt-3 border-t border-[#f0f2f5] pt-3 dark:border-dk-border">
          <p className="mb-1.5 text-[9px] font-semibold text-[#344054] dark:text-dk-text">Attendees</p>
          <ul className="grid gap-1">
            {attendees.map((attendee) => (
              <li
                key={attendee.email ?? attendee.displayName}
                className="flex items-center justify-between gap-2 text-[9px] text-[#667085] dark:text-dk-muted"
              >
                <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {attendee.displayName || attendee.email}
                </span>
                <span className="flex-none text-[#98a2b3] dark:text-[#6f7c8a]">
                  {RESPONSE_LABEL[attendee.responseStatus ?? "needsAction"]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(event.hangoutLink || event.htmlLink) && (
        <div className="mt-3 flex gap-2 border-t border-[#f0f2f5] pt-3 dark:border-dk-border">
          {event.hangoutLink && (
            <a
              href={event.hangoutLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-[#edf5ff] px-2.5 py-1.5 text-[9px] font-semibold text-[#1772d3] dark:bg-[#16263b] dark:text-[#5aa6ff]"
            >
              <Icon name="video" size={12} />
              Join video call
            </a>
          )}
          {event.htmlLink && (
            <a
              href={event.htmlLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-[#d8e1eb] px-2.5 py-1.5 text-[9px] font-semibold text-[#344054] dark:border-dk-border dark:text-dk-text"
            >
              <Icon name="externalLink" size={12} />
              View in Google Calendar
            </a>
          )}
        </div>
      )}
    </div>
  );
}
