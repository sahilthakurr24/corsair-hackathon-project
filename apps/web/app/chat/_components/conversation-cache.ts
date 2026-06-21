import type { ChatMessage } from "./conversation";

// In-session cache of conversation messages keyed by conversation id.
// Lets the /chat/[conversationId] route render instantly (no loading flash)
// right after a conversation is created or when navigating back to one that
// was already open this session. Cleared on full page reload.
const messageCache = new Map<string, ChatMessage[]>();

export function setCachedMessages(
  conversationId: string,
  messages: ChatMessage[],
) {
  messageCache.set(conversationId, messages);
}

export function getCachedMessages(conversationId: string) {
  return messageCache.get(conversationId);
}
