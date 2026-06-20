"use client";

import { createContext, useContext, useRef } from "react";
import type { GmailMessage } from "../_lib/gmail";

type ListCache = {
  messages: GmailMessage[];
  nextPageToken: string | null;
  loaded: boolean;
};

type InboxCacheContextValue = {
  getListCache: () => ListCache;
  setListCache: (cache: ListCache) => void;
  getMessageDetail: (id: string) => GmailMessage | undefined;
  setMessageDetail: (id: string, message: GmailMessage) => void;
};

const InboxCacheContext = createContext<InboxCacheContextValue | null>(null);

export function InboxCacheProvider({ children }: { children: React.ReactNode }) {
  const listCacheRef = useRef<ListCache>({
    messages: [],
    nextPageToken: null,
    loaded: false,
  });
  const detailCacheRef = useRef(new Map<string, GmailMessage>());

  const value = useRef<InboxCacheContextValue>({
    getListCache: () => listCacheRef.current,
    setListCache: (cache) => {
      listCacheRef.current = cache;
    },
    getMessageDetail: (id) => detailCacheRef.current.get(id),
    setMessageDetail: (id, message) => {
      detailCacheRef.current.set(id, message);
    },
  }).current;

  return <InboxCacheContext.Provider value={value}>{children}</InboxCacheContext.Provider>;
}

export function useInboxCache() {
  const context = useContext(InboxCacheContext);
  if (!context) throw new Error("useInboxCache must be used within InboxCacheProvider");
  return context;
}
