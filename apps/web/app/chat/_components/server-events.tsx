"use client";

import { useAuth } from "@clerk/nextjs";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// Mirrors the backend `SSEType` (apps/api/src/lib/sse.type.ts). `plugin` is the
// combined `${plugin}.${action}` string, e.g. "gmail.messages.received".
export type ServerEvent = {
  plugin: string;
  body: unknown;
};

export type ServerEventsStatus = "connecting" | "open" | "closed";

type Handler = (event: ServerEvent) => void;

type ServerEventsContextValue = {
  subscribe: (handler: Handler) => () => void;
  status: ServerEventsStatus;
};

const ServerEventsContext = createContext<ServerEventsContextValue | null>(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const MAX_BACKOFF_MS = 15_000;

/**
 * Reads one SSE response stream to completion, parsing `data:` frames and
 * skipping heartbeat comments (lines starting with ":"). Resolves when the
 * stream ends; rejects if the request fails or is aborted.
 */
async function readEventStream(
  signal: AbortSignal,
  token: string,
  onEvent: (event: ServerEvent) => void,
) {
  const response = await fetch(`${API_URL}/sse/events`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`SSE connection failed (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let boundary: number;
    while ((boundary = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);

      const data = rawEvent
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).replace(/^ /, ""))
        .join("\n");

      if (!data) continue; // heartbeat comment or empty frame

      try {
        onEvent(JSON.parse(data) as ServerEvent);
      } catch {
        // Ignore malformed frames rather than tearing down the stream.
      }
    }
  }
}

export function ServerEventsProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, getToken } = useAuth();
  const [status, setStatus] = useState<ServerEventsStatus>("closed");

  const handlersRef = useRef(new Set<Handler>());
  // Keep getToken out of the effect deps so token-identity churn doesn't
  // tear down and rebuild the connection.
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const subscribe = useCallback((handler: Handler) => {
    handlersRef.current.add(handler);
    return () => {
      handlersRef.current.delete(handler);
    };
  }, []);

  useEffect(() => {
    if (!isSignedIn) {
      setStatus("closed");
      return;
    }

    let closed = false;
    let controller: AbortController | null = null;

    const emit = (event: ServerEvent) => {
      handlersRef.current.forEach((handler) => handler(event));
    };

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));

    async function run() {
      let backoff = 1_000;

      while (!closed) {
        controller = new AbortController();
        setStatus("connecting");

        try {
          const token = await getTokenRef.current();
          if (!token) throw new Error("No Clerk token");

          setStatus("open");
          await readEventStream(controller.signal, token, emit);
          // Stream ended cleanly (server closed) — reconnect promptly.
          backoff = 1_000;
        } catch {
          if (closed) break;
          setStatus("connecting");
        }

        if (closed) break;
        await sleep(backoff);
        backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
      }
    }

    void run();

    return () => {
      closed = true;
      controller?.abort();
      setStatus("closed");
    };
  }, [isSignedIn]);

  return (
    <ServerEventsContext.Provider value={{ subscribe, status }}>
      {children}
    </ServerEventsContext.Provider>
  );
}

/** Subscribe to server-pushed events for the lifetime of the calling component. */
export function useServerEvent(handler: Handler) {
  const context = useContext(ServerEventsContext);
  if (!context) {
    throw new Error("useServerEvent must be used within ServerEventsProvider");
  }

  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const { subscribe } = context;
  useEffect(() => {
    return subscribe((event) => handlerRef.current(event));
  }, [subscribe]);
}

/** Read the current SSE connection status (for a live indicator, etc.). */
export function useServerEventsStatus() {
  const context = useContext(ServerEventsContext);
  if (!context) {
    throw new Error("useServerEventsStatus must be used within ServerEventsProvider");
  }
  return context.status;
}
