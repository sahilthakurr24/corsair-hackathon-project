"use client";

import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../../lib/axios";
import {
  Conversation,
  formatTime,
  type ChatMessage,
} from "../_components/conversation";
import { getCachedMessages } from "../_components/conversation-cache";
import { Icon } from "../_components/icon";
import { Skeleton } from "../_components/skeleton";

type ServerMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
};

export default function ConversationPage() {
  const params = useParams<{ conversationId: string }>();
  const conversationId = params.conversationId;

  const [messages, setMessages] = useState<ChatMessage[]>(
    () => getCachedMessages(conversationId) ?? [],
  );
  const [loading, setLoading] = useState(
    () => getCachedMessages(conversationId) === undefined,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Cache hit (e.g. just created, or opened earlier this session): render
    // instantly, no spinner, no refetch.
    const cached = getCachedMessages(conversationId);
    if (cached) {
      setMessages(cached);
      setLoading(false);
      setError(null);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<{ messages?: ServerMessage[] }>(
          `/ai/chat/${conversationId}/messages`,
        );
        if (cancelled) return;
        const mapped = (response.data?.messages ?? [])
          .filter(
            (message) => message.role === "user" || message.role === "assistant",
          )
          .map<ChatMessage>((message) => ({
            id: message.id,
            role: message.role as "user" | "assistant",
            content: message.content,
            timestamp: formatTime(new Date(message.createdAt)),
          }));
        setMessages(mapped);
      } catch (requestError) {
        if (cancelled) return;
        setError(
          axios.isAxiosError(requestError) &&
            requestError.response?.status === 404
            ? "This conversation could not be found."
            : "We couldn’t load this conversation.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  if (loading) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 md:px-[54px]">
        {Array.from({ length: 4 }).map((_, index) => {
          const fromUser = index % 2 === 1;
          return (
            <div
              key={index}
              className={`mx-auto mb-[22px] flex max-w-[680px] gap-[11px] ${
                fromUser ? "flex-row-reverse" : ""
              }`}
            >
              <Skeleton className="h-[30px] w-[30px] flex-none rounded-lg" />
              <Skeleton
                className={`h-14 rounded-[11px] ${fromUser ? "w-[45%]" : "w-[62%]"}`}
              />
            </div>
          );
        })}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid flex-1 place-items-center content-center gap-3 px-6 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-[13px] bg-[#fff1f0] text-[#d6453c]">
          <Icon name="close" size={22} />
        </span>
        <p className="text-[13px] text-[#344054]">{error}</p>
        <Link
          href="/chat"
          className="rounded-lg bg-brand-blue px-4 py-2 text-[11px] font-semibold text-white"
        >
          Start a new chat
        </Link>
      </div>
    );
  }

  return (
    <Conversation
      key={conversationId}
      conversationId={conversationId}
      initialMessages={messages}
    />
  );
}
