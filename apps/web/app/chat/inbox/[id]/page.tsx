"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../../../lib/axios";
import { ChatHeader } from "../../_components/chat-header";
import { Icon } from "../../_components/icon";
import { useInboxCache } from "../_components/inbox-cache";
import { MailBody } from "../_components/mail-body";
import { SenderAvatar } from "../_components/sender-avatar";
import {
  type GmailMessage,
  formatFullDate,
  getErrorMessage,
  getHeader,
  parseFromHeader,
} from "../_lib/gmail";

type MessageDetailResponse = { message: GmailMessage };

export default function MessageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isSignedIn } = useAuth();
  const cache = useInboxCache();
  const [message, setMessage] = useState<GmailMessage | null>(() =>
    id ? cache.getMessageDetail(id) ?? null : null,
  );
  const [loading, setLoading] = useState(() => !(id && cache.getMessageDetail(id)));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn || !id) return;

    const cached = cache.getMessageDetail(id);
    if (cached) {
      setMessage(cached);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .get<MessageDetailResponse>(`/gmail/get-message/${id}`)
      .then((response) => {
        if (cancelled) return;
        setMessage(response.data.message);
        cache.setMessageDetail(id, response.data.message);
      })
      .catch((requestError) => {
        if (!cancelled) setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, isSignedIn, cache]);

  const from = message ? getHeader(message, "From") : "";
  const subject = message ? getHeader(message, "Subject") || "(no subject)" : "";
  const to = message ? getHeader(message, "To") : "";
  const sender = parseFromHeader(from || "Unknown sender");

  return (
    <>
      <ChatHeader
        icon="mail"
        title={loading ? "Loading…" : subject || "Message"}
        status={loading ? "Loading…" : sender.name}
        subtitle="Synced from your connected Gmail account"
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-[14px] md:px-[54px]">
        <Link
          href="/chat/inbox"
          className="mb-4 inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#344054] hover:text-brand-blue"
        >
          <Icon name="back" size={14} />
          Back to inbox
        </Link>

        {loading && <p className="my-10 text-center text-[11px] text-[#98a2b3]">Loading message…</p>}

        {error && (
          <div className="mx-auto mb-5 grid max-w-[760px] grid-cols-[1fr_auto] gap-x-3 gap-y-[3px] rounded-lg border border-[#f4c7c3] bg-[#fff6f5] px-[13px] py-[11px] text-[10px] text-[#9d322b]">
            <b className="col-start-1">Couldn’t load message</b>
            <span className="col-start-1">{error}</span>
          </div>
        )}

        {message && !loading && !error && (
          <article className="mx-auto max-w-[760px] overflow-hidden rounded-[12px] border border-[#e7ecf2] bg-white">
            <header className="flex items-start gap-3 border-b border-[#e7ecf2] p-5">
              <SenderAvatar email={sender.email} name={sender.name} size={40} />
              <div className="min-w-0 flex-1">
                <strong className="block text-[14px] text-[#172033]">{subject}</strong>
                <div className="mt-1 flex flex-wrap items-baseline gap-1 text-[11px]">
                  <b className="text-[#344054]">{sender.name}</b>
                  <span className="text-[#98a2b3]">&lt;{sender.email}&gt;</span>
                </div>
                {to && <small className="mt-0.5 block text-[10px] text-[#98a2b3]">To: {to}</small>}
              </div>
              <small className="flex-none text-[9px] text-[#98a2b3]">
                {formatFullDate(message.internalDate)}
              </small>
            </header>

            <MailBody html={message.html} text={message.text} />
          </article>
        )}
      </div>
    </>
  );
}
