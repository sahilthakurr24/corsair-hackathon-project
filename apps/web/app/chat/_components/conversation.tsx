"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/axios";
import { Icon } from "./icon";
import { ChatHeader } from "./chat-header";
import { ChatHistory } from "./chat-history";
import { setCachedMessages } from "./conversation-cache";

export type Role = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  timestamp: string;
};

const suggestedPrompts = [
  "Summarize my unread emails",
  "What’s on my calendar today?",
  "Draft a follow-up email",
];

export function formatTime(date: Date = new Date()) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function Conversation({
  conversationId: initialConversationId = null,
  initialMessages = [],
}: {
  conversationId?: string | null;
  initialMessages?: ChatMessage[];
}) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId,
  );
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const initials =
    user?.firstName?.at(0)?.toUpperCase() ??
    user?.primaryEmailAddress?.emailAddress.at(0)?.toUpperCase() ??
    "U";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Keep the in-session cache fresh so navigating back to this conversation
  // (or the route swap right after creating it) renders without a refetch.
  useEffect(() => {
    if (conversationId) setCachedMessages(conversationId, messages);
  }, [conversationId, messages]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [input]);

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault();
    const content = input.trim();
    if (!content || sending || !isSignedIn) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: formatTime(),
    };

    setInput("");
    setError(null);
    setSending(true);
    setMessages((current) => [...current, userMessage]);

    try {
      let assistantContent: string;
      let newConversationId: string | null = null;

      if (conversationId) {
        const response = await api.post<{
          aiResponse?: string;
          error?: string;
          reason?: string;
        }>(`/ai/chat/${conversationId}/messages`, { message: content });

        assistantContent = response.data?.aiResponse?.trim() ?? "";
      } else {
        const response = await api.post<{
          conversationId?: string;
          response?: string;
          error?: string;
          reason?: string;
        }>("/ai/chat", { message: content });

        assistantContent = response.data?.response?.trim() ?? "";
        newConversationId = response.data?.conversationId ?? null;
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          assistantContent || "The request completed without a response.",
        timestamp: formatTime(),
      };

      setMessages((current) => {
        const next = [...current, assistantMessage];
        // Seed the cache before the route swap so /chat/[id] renders instantly.
        if (newConversationId) setCachedMessages(newConversationId, next);
        return next;
      });

      if (newConversationId) {
        setConversationId(newConversationId);
        router.replace(`/chat/${newConversationId}`);
      }
    } catch (requestError) {
      const message = axios.isAxiosError(requestError)
        ? ((
            requestError.response?.data as
              | { error?: string; reason?: string }
              | undefined
          )?.error ??
          (
            requestError.response?.data as
              | { error?: string; reason?: string }
              | undefined
          )?.reason ??
          "CalMail could not complete that request.")
        : requestError instanceof Error
          ? requestError.message
          : "Something went wrong.";
      setError(message);
    } finally {
      setSending(false);
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <>
      <ChatHeader
        icon="spark"
        title="CalMail Assistant"
        status={
          <>
            <i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#22b573]" />
            Online
          </>
        }
        subtitle="AI-powered inbox & calendar"
        actions={<ChatHistory activeConversationId={conversationId} />}
      />

      <div
        className="flex-1 min-h-0 overflow-y-auto scroll-smooth px-5 py-6 md:px-[54px]"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <div className="mx-auto mb-8 mt-2 max-w-[580px] text-center md:mb-[34px]">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-[13px] bg-[#eaf4ff] text-brand-blue">
              <Icon name="spark" size={25} />
            </span>
            <h1 className="mt-[14px] mb-[6px] text-[20px] tracking-[-0.5px] md:text-[22px]">
              Hey {user?.firstName} How can I help today?
            </h1>
            <p className="text-[11px] text-[#7b8798]">
              Ask about your inbox, schedule, or let me handle a task.
            </p>
            <div className="mt-4 grid gap-[7px] md:flex md:flex-wrap md:justify-center">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    setInput(prompt);
                    textareaRef.current?.focus();
                  }}
                  className="w-full rounded-full border border-[#e0e7ef] bg-white px-[11px] py-2 text-[9px] text-[#526071] hover:border-[#9fcafb] hover:bg-[#f8fbff] hover:text-brand-blue md:w-auto"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <article
            key={message.id}
            className={`mx-auto mb-[22px] flex max-w-[680px] gap-[11px] ${
              message.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <span
              className={`grid h-[30px] w-[30px] flex-none place-items-center rounded-lg text-[10px] font-bold text-white ${
                message.role === "user"
                  ? "rounded-full bg-gradient-to-br from-[#f4b283] to-[#74b6ac]"
                  : "bg-brand-blue"
              }`}
            >
              {message.role === "user" ? (
                initials
              ) : (
                <Icon name="spark" size={17} />
              )}
            </span>
            <div
              className={`min-w-0 max-w-[calc(100%-41px)] ${message.role === "user" ? "grid justify-items-end" : ""}`}
            >
              <small className="mb-[6px] block text-[9px] text-[#98a2b3]">
                {message.role === "user" ? "You" : "CalMail"} ·{" "}
                {message.timestamp}
              </small>
              <p
                className={`w-fit max-w-full rounded-[3px_11px_11px_11px] px-[13px] py-[11px] text-[12px] leading-[1.6] whitespace-pre-wrap [overflow-wrap:anywhere] ${
                  message.role === "user"
                    ? "rounded-[11px_3px_11px_11px] bg-[#eaf4ff] text-[#15599f]"
                    : "bg-[#f6f8fb] text-[#344054]"
                }`}
              >
                {message.content}
              </p>
            </div>
          </article>
        ))}

        {sending && (
          <article className="mx-auto mb-[22px] flex max-w-[680px] gap-[11px]">
            <span className="grid h-[30px] w-[30px] flex-none place-items-center rounded-lg bg-brand-blue text-white">
              <Icon name="spark" size={17} />
            </span>
            <div className="min-w-0 max-w-[calc(100%-41px)]">
              <small className="mb-[6px] block text-[9px] text-[#98a2b3]">
                CalMail is working
              </small>
              <p className="flex w-12 gap-1 rounded-[3px_11px_11px_11px] bg-[#f6f8fb] px-[13px] py-[11px]">
                <i className="h-1.5 w-1.5 animate-[chat-bounce_1s_ease-in-out_infinite] rounded-full bg-[#8da0b7]" />
                <i className="h-1.5 w-1.5 animate-[chat-bounce_1s_ease-in-out_infinite] rounded-full bg-[#8da0b7] [animation-delay:140ms]" />
                <i className="h-1.5 w-1.5 animate-[chat-bounce_1s_ease-in-out_infinite] rounded-full bg-[#8da0b7] [animation-delay:280ms]" />
              </p>
            </div>
          </article>
        )}

        {error && (
          <div className="mx-auto mb-5 grid max-w-[680px] grid-cols-[1fr_auto] gap-x-3 gap-y-[3px] rounded-lg border border-[#f4c7c3] bg-[#fff6f5] px-[13px] py-[11px] text-[10px] text-[#9d322b]">
            <b className="col-start-1">Couldn’t send the message</b>
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
        <div ref={endRef} />
      </div>

      <form
        className="mx-auto mb-[7px] w-[calc(100%-24px)] flex-none rounded-[11px] border border-[#d8e1eb] bg-white p-3 pb-[9px] shadow-[0_7px_22px_rgba(34,60,90,0.08)] focus-within:border-[#9bc9fc] focus-within:shadow-[0_0_0_3px_#eaf4ff,0_7px_22px_rgba(34,60,90,0.08)] md:w-[min(680px,calc(100%-40px))]"
        onSubmit={sendMessage}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask CalMail anything…"
          rows={1}
          disabled={sending}
          className="block max-h-[120px] min-h-6 w-full resize-none overflow-y-auto border-0 bg-transparent text-[12px] leading-[1.5] text-[#273449] outline-none placeholder:text-[#98a2b3]"
        />
        <div className="mt-[7px] flex items-center justify-between">
          <span className="hidden text-[8px] text-[#a2adbb] md:inline">
            Enter to send · Shift + Enter for a new line
          </span>
          <button
            type="submit"
            aria-label="Send message"
            disabled={!input.trim() || sending}
            className="grid h-8 w-8 place-items-center rounded-[7px] bg-brand-blue text-white disabled:bg-[#c8d2df] disabled:cursor-not-allowed"
          >
            <Icon name="send" size={18} />
          </button>
        </div>
      </form>
      <small className="flex-none px-3 pb-[10px] text-center text-[8px] text-[#a0aaba]">
        CalMail can make mistakes. Review important emails and calendar changes.
      </small>
    </>
  );
}
