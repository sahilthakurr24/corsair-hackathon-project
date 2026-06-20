"use client";

import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useEffect, useState } from "react";
import { ChatHeader } from "../_components/chat-header";

type GmailHeader = { name?: string; value?: string };
type GmailMessage = {
  id?: string;
  threadId?: string;
  snippet?: string;
  internalDate?: string;
  payload?: { headers?: GmailHeader[] };
};

function getHeader(message: GmailMessage, name: string) {
  return (
    message.payload?.headers?.find((header) => header.name?.toLowerCase() === name.toLowerCase())
      ?.value ?? ""
  );
}

function formatMessageDate(internalDate?: string) {
  const date = new Date(Number(internalDate));
  if (!internalDate || Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

export default function InboxView() {
  const { getToken, isSignedIn } = useAuth();
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  async function fetchInbox() {
    if (!isSignedIn || loading) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error("Your session expired. Please sign in again.");

      const response = await axios.get<GmailMessage[]>(`${apiOrigin}/gmail/get-messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessages(response.data ?? []);
    } catch (requestError) {
      if (axios.isAxiosError(requestError) && requestError.response?.status === 404) {
        setMessages([]);
      } else {
        const message = axios.isAxiosError(requestError)
          ? ((requestError.response?.data as { message?: string } | undefined)?.message ??
              requestError.message)
          : requestError instanceof Error
            ? requestError.message
            : "Something went wrong.";
        setError(message);
      }
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }

  useEffect(() => {
    void fetchInbox();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <ChatHeader
        icon="inbox"
        title="Inbox"
        status={loading ? "Syncing…" : `${messages.length} messages`}
        subtitle="Synced from your connected Gmail account"
      />

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-none flex-wrap items-center justify-between gap-3 px-5 pt-[14px] md:px-[54px]">
          <p className="text-[10px] text-[#7f8b9e]">
            Showing the latest messages from your connected Gmail account.
          </p>
          <button
            type="button"
            onClick={() => void fetchInbox()}
            disabled={loading}
            className="flex-none rounded-md border border-[#d8e1eb] bg-white px-3 py-[7px] text-[9px] font-semibold text-[#344054] disabled:cursor-not-allowed disabled:text-[#98a2b3]"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-[14px] pb-6 md:px-[54px]">
          {loading && messages.length === 0 && (
            <p className="my-10 text-center text-[11px] text-[#98a2b3]">Loading your inbox…</p>
          )}

          {error && (
            <div className="mb-5 grid max-w-[680px] grid-cols-[1fr_auto] gap-x-3 gap-y-[3px] rounded-lg border border-[#f4c7c3] bg-[#fff6f5] px-[13px] py-[11px] text-[10px] text-[#9d322b]">
              <b className="col-start-1">Couldn’t load inbox</b>
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

          {!loading && !error && loaded && messages.length === 0 && (
            <p className="my-10 text-center text-[11px] text-[#98a2b3]">No messages found.</p>
          )}

          {messages.map((message) => {
            const from = getHeader(message, "From") || "Unknown sender";
            const subject = getHeader(message, "Subject") || "(no subject)";
            return (
              <article
                key={message.id ?? message.threadId}
                className="mb-[10px] rounded-[9px] border border-[#e7ecf2] bg-white px-[15px] py-[13px] hover:border-[#b7d6fb]"
              >
                <div className="mb-1 flex items-baseline justify-between gap-[10px]">
                  <b className="overflow-hidden text-[11px] text-ellipsis whitespace-nowrap">{from}</b>
                  <small className="flex-none text-[9px] text-[#98a2b3]">
                    {formatMessageDate(message.internalDate)}
                  </small>
                </div>
                <strong className="mb-1 block text-[11px]">{subject}</strong>
                <p className="overflow-hidden text-[10px] text-ellipsis whitespace-nowrap text-[#7f8b9e]">
                  {message.snippet}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}
