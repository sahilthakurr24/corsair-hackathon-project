"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../../lib/axios";
import { ChatHeader } from "../_components/chat-header";
import { MailListItem } from "./_components/mail-list-item";
import { type GmailMessage, getErrorMessage } from "./_lib/gmail";

type GmailListResponse = {
  messages: GmailMessage[];
  nextPageToken: string | null;
};

export default function InboxView() {
  const { isSignedIn } = useAuth();
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchInbox = useCallback(
    async ({ append }: { append: boolean }) => {
      if (!isSignedIn) return;
      if (append ? loadingMore : loading) return;
      if (append && !nextPageToken) return;

      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      try {
        const response = await api.get<GmailListResponse>("/gmail/get-messages", {
          params: append && nextPageToken ? { pageToken: nextPageToken } : undefined,
        });

        const page = response.data.messages ?? [];
        setMessages((current) => (append ? [...current, ...page] : page));
        setNextPageToken(response.data.nextPageToken ?? null);
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        if (append) setLoadingMore(false);
        else setLoading(false);
        setLoaded(true);
      }
    },
    [isSignedIn, loading, loadingMore, nextPageToken],
  );

  useEffect(() => {
    void fetchInbox({ append: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !nextPageToken) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void fetchInbox({ append: true });
        }
      },
      { root: scrollContainerRef.current, rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchInbox, nextPageToken]);

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
            onClick={() => void fetchInbox({ append: false })}
            disabled={loading}
            className="flex-none rounded-md border border-[#d8e1eb] bg-white px-3 py-[7px] text-[9px] font-semibold text-[#344054] disabled:cursor-not-allowed disabled:text-[#98a2b3]"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        <div
          ref={scrollContainerRef}
          className="min-h-0 flex-1 overflow-y-auto px-5 py-[14px] pb-6 md:px-[54px]"
        >
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

          {messages.map((message) => (
            <MailListItem key={message.id ?? message.threadId} message={message} />
          ))}

          {nextPageToken && <div ref={sentinelRef} className="h-1" />}
          {loadingMore && (
            <p className="py-3 text-center text-[10px] text-[#98a2b3]">Loading more…</p>
          )}
        </div>
      </div>
    </>
  );
}
