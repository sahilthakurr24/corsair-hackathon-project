"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../../lib/axios";
import { GmailLogo, GoogleCalendarLogo } from "./brand-logos";

type GooglePlugin = "gmail" | "googlecalendar";

type PluginStatus = {
  connected: boolean;
  accountId: string | null;
};

type StatusResponse = {
  status: Record<GooglePlugin, PluginStatus>;
};

const items: Array<{
  id: GooglePlugin;
  name: string;
  Logo: React.ComponentType<{ size?: number }>;
}> = [
  { id: "gmail", name: "Gmail", Logo: GmailLogo },
  { id: "googlecalendar", name: "Calendar", Logo: GoogleCalendarLogo },
];

const defaultStatus: StatusResponse["status"] = {
  gmail: { connected: false, accountId: null },
  googlecalendar: { connected: false, accountId: null },
};

export function ConnectionStatus() {
  const { isSignedIn } = useAuth();
  const [status, setStatus] = useState(defaultStatus);
  const [busy, setBusy] = useState<GooglePlugin | null>(null);

  const refresh = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      await api.get("/auth/me").catch(() => {});
      const response = await api.get<StatusResponse>("/auth/google/status");
      setStatus(response.data.status);
    } catch {
      // Leave the last known status in place on a transient failure.
    }
  }, [isSignedIn]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Clean up the ?oauth=... params after returning from a Google redirect.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("oauth")) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  async function connect(plugin: GooglePlugin) {
    setBusy(plugin);
    try {
      await api.get("/auth/me").catch(() => {});
      const response = await api.post<{ url: string }>(
        "/auth/google/oauth/start",
        { plugin },
      );
      window.location.assign(response.data.url);
    } catch {
      setBusy(null);
    }
  }

  async function disconnect(plugin: GooglePlugin) {
    setBusy(plugin);
    try {
      const response = await api.delete<StatusResponse>(
        `/auth/google/connections/${plugin}`,
      );
      setStatus(response.data.status);
    } catch {
      // Keep current status on failure.
    } finally {
      setBusy(null);
    }
  }

  function toggle(plugin: GooglePlugin, connected: boolean) {
    if (connected) void disconnect(plugin);
    else void connect(plugin);
  }

  return (
    <div className="flex items-center gap-2">
      {items.map(({ id, name, Logo }) => {
        const connected = status[id]?.connected ?? false;
        return (
          <button
            key={id}
            type="button"
            onClick={() => toggle(id, connected)}
            disabled={busy !== null}
            title={`${name}: ${connected ? "Connected" : "Not connected"} — click to ${connected ? "disconnect" : "connect"}`}
            className={`flex items-center gap-[6px] rounded-lg border bg-white px-[8px] py-[6px] text-[10px] font-semibold text-[#475467] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-dk-surface dark:text-dk-muted ${
              connected
                ? "border-[#b7e3c4] hover:border-[#8fd3a4] dark:border-[#27543a]"
                : "border-[#f2c4bf] hover:border-[#e79b93] dark:border-[#5a2c2c]"
            }`}
          >
            <Logo size={15} />
            <span className="hidden sm:inline">{name}</span>
            <span
              aria-hidden
              className={`h-2 w-2 flex-none rounded-full ${
                connected ? "bg-[#1aa251]" : "bg-[#e0463b]"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
