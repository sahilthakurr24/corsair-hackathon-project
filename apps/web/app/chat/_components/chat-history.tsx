"use client";

import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/axios";
import { Icon } from "./icon";

type Conversation = {
  id: string;
  title: string;
  updatedAt: string;
};

function formatUpdated(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function ChatHistory({
  activeConversationId,
}: {
  activeConversationId?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadConversations() {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<{ conversations?: Conversation[] }>(
        "/ai/chat",
      );
      setConversations(response.data?.conversations ?? []);
    } catch (requestError) {
      setError(
        axios.isAxiosError(requestError)
          ? "Could not load your chats."
          : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  function toggle() {
    setOpen((current) => {
      const next = !current;
      if (next) void loadConversations();
      return next;
    });
  }

  function openConversation(id: string) {
    setOpen(false);
    router.push(`/chat/${id}`);
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-label="Previous chats"
        aria-expanded={open}
        className="flex items-center gap-[6px] rounded-lg border border-[#dde5ee] bg-white px-[10px] py-[7px] text-[10px] font-semibold text-[#475467] hover:border-[#b7d6fb] hover:text-brand-blue"
      >
        <Icon name="clock" size={14} />
        <span className="hidden sm:inline">History</span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close history"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[45] border-0 bg-[rgba(20,29,43,0.36)]"
          />
          <aside className="fixed inset-y-0 right-0 z-[46] flex w-[300px] max-w-[86vw] flex-col border-l border-[#e9edf3] bg-white shadow-[-15px_0_35px_rgba(20,39,63,0.14)]">
            <header className="flex h-[58px] flex-none items-center justify-between border-b border-[#e9edf3] px-4 md:h-[65px]">
              <b className="text-[13px]">Your chats</b>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-md text-[#667085] hover:bg-[#f0f5fb]"
              >
                <Icon name="close" size={16} />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {loading && (
                <div className="grid place-items-center gap-2 py-10 text-[10px] text-[#98a2b3]">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#d6e8fb] border-t-brand-blue" />
                  Loading your chats…
                </div>
              )}

              {!loading && error && (
                <div className="rounded-lg border border-[#f4c7c3] bg-[#fff6f5] px-3 py-[10px] text-[10px] text-[#9d322b]">
                  {error}
                </div>
              )}

              {!loading && !error && conversations.length === 0 && (
                <p className="px-1 py-8 text-center text-[10px] text-[#98a2b3]">
                  No conversations yet. Start a new chat to see it here.
                </p>
              )}

              {!loading &&
                !error &&
                conversations.map((conversation) => {
                  const active = conversation.id === activeConversationId;
                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => openConversation(conversation.id)}
                      className={`mb-[6px] grid w-full gap-[3px] rounded-[9px] border px-[11px] py-[9px] text-left ${
                        active
                          ? "border-[#b7d6fb] bg-[#eaf4ff]"
                          : "border-transparent hover:border-[#dde5ee] hover:bg-[#f6f9fd]"
                      }`}
                    >
                      <b
                        className={`overflow-hidden text-[11px] text-ellipsis whitespace-nowrap ${active ? "text-brand-blue" : "text-[#344054]"}`}
                      >
                        {conversation.title || "Untitled chat"}
                      </b>
                      <small className="text-[8px] text-[#98a2b3]">
                        {formatUpdated(conversation.updatedAt)}
                      </small>
                    </button>
                  );
                })}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
