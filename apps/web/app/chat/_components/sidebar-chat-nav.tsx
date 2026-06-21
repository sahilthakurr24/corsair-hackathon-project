"use client";

import axios from "axios";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../../lib/axios";
import { Icon } from "./icon";
import { Skeleton } from "./skeleton";

type Conversation = {
  id: string;
  title: string;
  updatedAt: string;
};

export function SidebarChatNav({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatActive = pathname === "/chat";

  const loadConversations = useCallback(async () => {
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
  }, []);

  // Load when the dropdown opens, and refresh on navigation while it stays open
  // (so a newly created conversation shows up in the list).
  useEffect(() => {
    if (open) void loadConversations();
  }, [open, pathname, loadConversations]);

  return (
    <div className="grid gap-1">
      <div
        className={`flex h-10 items-center gap-[10px] rounded-[7px] pr-1 pl-[11px] text-[13px] ${
          chatActive
            ? "bg-[#eaf4ff] font-semibold text-brand-blue dark:bg-[#16263b] dark:text-[#5aa6ff]"
            : "text-[#667085] hover:bg-[#f0f5fb] hover:text-[#344054] dark:text-dk-muted dark:hover:bg-dk-surface-2 dark:hover:text-dk-text"
        }`}
      >
        <Link
          href="/chat"
          onClick={onNavigate}
          className="flex flex-1 items-center gap-[10px]"
        >
          <Icon name="spark" />
          Chat
        </Link>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? "Hide chat history" : "Show chat history"}
          aria-expanded={open}
          className="grid h-7 w-7 place-items-center rounded-md text-current hover:bg-[#e2edf9] dark:hover:bg-dk-surface-2"
        >
          <span
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <Icon name="chevronDown" size={15} />
          </span>
        </button>
      </div>

      {open && (
        <div className="grid gap-[2px] pb-1 pl-[30px]">
          {loading && (
            <div className="grid gap-[6px] px-2 py-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-[18px] w-full" />
              ))}
            </div>
          )}

          {!loading && error && (
            <p className="px-2 py-2 text-[10px] text-[#9d322b]">{error}</p>
          )}

          {!loading && !error && conversations.length === 0 && (
            <p className="px-2 py-2 text-[10px] text-[#98a2b3] dark:text-dk-muted">
              No chats yet.
            </p>
          )}

          {!loading &&
            !error &&
            conversations.map((conversation) => {
              const active = pathname === `/chat/${conversation.id}`;
              return (
                <Link
                  key={conversation.id}
                  href={`/chat/${conversation.id}`}
                  onClick={onNavigate}
                  title={conversation.title}
                  className={`overflow-hidden rounded-[6px] px-2 py-[7px] text-[12px] font-semibold text-ellipsis whitespace-nowrap ${
                    active
                      ? "bg-[#eaf4ff] text-brand-blue dark:bg-[#16263b] dark:text-[#5aa6ff]"
                      : "text-[#0b1524] hover:bg-[#f0f5fb] hover:text-black dark:text-[#d5dce4] dark:hover:bg-dk-surface-2 dark:hover:text-white"
                  }`}
                >
                  {conversation.title ? `${conversation.title}…` : "Untitled chat"}
                </Link>
              );
            })}
        </div>
      )}
    </div>
  );
}
