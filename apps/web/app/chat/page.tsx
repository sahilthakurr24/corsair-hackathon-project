"use client";

import { Conversation } from "./_components/conversation";
import { useChatShell } from "./_components/chat-shell";

export default function ChatView() {
  const { newChatSignal } = useChatShell();

  // Remount with a fresh, empty conversation whenever "New Chat" is triggered.
  return <Conversation key={newChatSignal} />;
}
