"use client";

import Link from "next/link";
import {
  type GmailMessage,
  formatMessageDate,
  getHeader,
  parseFromHeader,
} from "../_lib/gmail";

export function MailListItem({ message }: { message: GmailMessage }) {
  const from = getHeader(message, "From") || "Unknown sender";
  const subject = getHeader(message, "Subject") || "(no subject)";
  const sender = parseFromHeader(from);
  const initials = sender.name.slice(0, 2).toUpperCase();

  return (
    <Link
      href={`/chat/inbox/${message.id}`}
      className="mb-[10px] flex gap-3 rounded-[9px] border border-[#e7ecf2] bg-white px-[15px] py-[13px] transition-colors hover:border-[#b7d6fb] hover:bg-[#f8fbff]"
    >
      <span className="grid h-8 w-8 flex-none place-items-center self-start rounded-full bg-gradient-to-br from-[#f4b283] to-[#74b6ac] text-[10px] font-bold text-white">
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-baseline justify-between gap-[10px]">
          <b className="overflow-hidden text-[11px] text-ellipsis whitespace-nowrap text-[#172033]">
            {sender.name}
          </b>
          <small className="flex-none text-[9px] text-[#98a2b3]">
            {formatMessageDate(message.internalDate)}
          </small>
        </div>
        <strong className="mb-1 block overflow-hidden text-[11px] text-ellipsis whitespace-nowrap">
          {subject}
        </strong>
        <p className="overflow-hidden text-[10px] text-ellipsis whitespace-nowrap text-[#7f8b9e]">
          {message.snippet}
        </p>
      </div>
    </Link>
  );
}
