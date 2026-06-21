"use client";

import Link from "next/link";
import {
  type GmailMessage,
  formatMessageDate,
  getHeader,
  parseFromHeader,
} from "../_lib/gmail";
import { SenderAvatar } from "./sender-avatar";

export function MailListItem({ message }: { message: GmailMessage }) {
  const from = getHeader(message, "From") || "Unknown sender";
  const subject = getHeader(message, "Subject") || "(no subject)";
  const sender = parseFromHeader(from);

  return (
    <Link
      href={`/chat/inbox/${message.id}`}
      className="mb-[10px] flex gap-3 rounded-[9px] border border-[#e7ecf2] bg-white px-[15px] py-[13px] transition-colors hover:border-[#b7d6fb] hover:bg-[#f8fbff] dark:border-dk-border dark:bg-dk-surface dark:hover:border-[#3a4a5e] dark:hover:bg-dk-surface-2"
    >
      <SenderAvatar email={sender.email} name={sender.name} size={32} />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-baseline justify-between gap-[10px]">
          <b className="overflow-hidden text-[12px] text-ellipsis whitespace-nowrap text-[#172033] dark:text-dk-text">
            {sender.name}
          </b>
          <small className="flex-none text-[9px] text-[#98a2b3] dark:text-dk-muted">
            {formatMessageDate(message.internalDate)}
          </small>
        </div>
        <strong className="mb-1 block overflow-hidden text-[12px] text-ellipsis whitespace-nowrap dark:text-[#c7cfda]">
          {subject}
        </strong>
        <p className="overflow-hidden text-[11px] text-ellipsis whitespace-nowrap text-[#7f8b9e] dark:text-dk-muted">
          {message.snippet}
        </p>
      </div>
    </Link>
  );
}
