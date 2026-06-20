"use client";

import {
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
  useUser,
} from "@clerk/nextjs";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";

type GooglePlugin = "gmail" | "googlecalendar";

type PluginStatus = {
  connected: boolean;
  accountId: string | null;
};

type StatusResponse = {
  status: Record<GooglePlugin, PluginStatus>;
};

type ApiErrorResponse = {
  error?: string;
  errors?: Array<{ message?: string; longMessage?: string }>;
};

const plugins: Array<{
  id: GooglePlugin;
  name: string;
  description: string;
}> = [
  {
    id: "gmail",
    name: "Gmail",
    description: "Use your connected mailbox for email search and actions.",
  },
  {
    id: "googlecalendar",
    name: "Google Calendar",
    description: "Use your calendar for availability and event operations.",
  },
];

const defaultStatus: StatusResponse["status"] = {
  gmail: { connected: false, accountId: null },
  googlecalendar: { connected: false, accountId: null },
};

const primaryButtonClass =
  "inline-flex min-h-[42px] items-center justify-center rounded-lg border-0 font-bold cursor-pointer flex-1 bg-primary text-white hover:enabled:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-65";
const secondaryButtonClass =
  "inline-flex min-h-[42px] w-full items-center justify-center rounded-lg border border-border bg-panel px-4 font-bold cursor-pointer text-foreground disabled:cursor-not-allowed disabled:opacity-65 sm:w-auto";
const dangerButtonClass =
  "inline-flex min-h-[42px] w-full items-center justify-center rounded-lg border-0 px-3.5 font-bold cursor-pointer bg-danger text-white hover:enabled:bg-danger-hover disabled:cursor-not-allowed disabled:opacity-65 sm:w-auto";

function getApiOrigin() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}

function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    const clerkMessage =
      data?.errors?.at(0)?.longMessage ?? data?.errors?.at(0)?.message;

    return clerkMessage ?? data?.error ?? error.message;
  }

  return error instanceof Error ? error.message : "Something went wrong.";
}

function ConnectionsContent() {
  const apiOrigin = useMemo(getApiOrigin, []);
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [status, setStatus] = useState(defaultStatus);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [busyPlugin, setBusyPlugin] = useState<GooglePlugin | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [accountSynced, setAccountSynced] = useState(false);

  const authHeaders = useCallback(async () => {
    const token = await getToken();

    if (!token) {
      throw new Error("Sign in again to continue.");
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  }, [getToken]);

  const syncAccount = useCallback(async () => {
    if (!isSignedIn) return;

    try {
      await axios.get(`${apiOrigin}/auth/me`, { headers: await authHeaders() });
      setAccountSynced(true);
    } catch (error) {
      throw new Error(`Could not sync your account: ${getApiErrorMessage(error)}`);
    }
  }, [apiOrigin, authHeaders, isSignedIn]);

  const refreshStatus = useCallback(async () => {
    if (!isSignedIn) return;

    setLoadingStatus(true);

    try {
      await syncAccount();

      const response = await axios
        .get<StatusResponse>(`${apiOrigin}/auth/google/status`, {
          headers: await authHeaders(),
        })
        .catch(() => {
          throw new Error("Could not load connection status");
        });

      setStatus(response.data.status);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Status failed");
    } finally {
      setLoadingStatus(false);
    }
  }, [apiOrigin, authHeaders, isSignedIn, syncAccount]);

  async function connect(plugin: GooglePlugin) {
    setBusyPlugin(plugin);
    setMessage(null);

    try {
      await syncAccount();

      const response = await axios.post<{ url: string }>(
        `${apiOrigin}/auth/google/oauth/start`,
        { plugin },
        {
          headers: {
            "Content-Type": "application/json",
            ...(await authHeaders()),
          },
        },
      );

      window.location.assign(response.data.url);
    } catch (error) {
      setMessage(getApiErrorMessage(error));
      setBusyPlugin(null);
    }
  }

  async function disconnect(plugin: GooglePlugin) {
    setBusyPlugin(plugin);
    setMessage(null);

    try {
      const response = await axios.delete<StatusResponse>(
        `${apiOrigin}/auth/google/connections/${plugin}`,
        { headers: await authHeaders() },
      );

      setStatus(response.data.status);
      const pluginName = plugins.find((item) => item.id === plugin)?.name;
      setMessage(`${pluginName} disconnected.`);
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    } finally {
      setBusyPlugin(null);
    }
  }

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const params = new URLSearchParams(window.location.search);
    const oauth = params.get("oauth");
    const plugin = params.get("plugin");

    if (oauth === "success") {
      setMessage(`${plugin ?? "Google"} connected successfully.`);
      window.history.replaceState({}, "", window.location.pathname);
    }

    if (oauth === "error") {
      setMessage("Google connection failed. Try again from this page.");
      window.history.replaceState({}, "", window.location.pathname);
    }

    void refreshStatus();
  }, [isLoaded, isSignedIn, refreshStatus]);

  if (!isLoaded) {
    return (
      <div className="mb-4 rounded-lg border border-border bg-panel-soft px-3.5 py-3">
        Loading account...
      </div>
    );
  }

  return (
    <section className="mx-auto w-[min(960px,100%)]">
      {!isSignedIn ? (
        <div className="mx-auto mt-[12vh] w-[min(560px,100%)] rounded-lg border border-border bg-panel p-6">
          <p className="text-[13px] font-bold uppercase text-primary">Corsair</p>
          <h1 className="mt-1.5 text-[28px] leading-[1.15] sm:text-[34px]">Connect your Google account</h1>
          <p className="mt-2 leading-[1.5] text-muted">
            Sign in to manage Gmail and Google Calendar access for your
            workspace.
          </p>
          <div className="mt-[22px] grid gap-2.5 sm:flex">
            <SignInButton mode="modal">
              <button className={primaryButtonClass} type="button">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className={secondaryButtonClass} type="button">
                Create account
              </button>
            </SignUpButton>
          </div>
        </div>
      ) : null}

      {isSignedIn ? (
        <>
          <div className="mb-5 grid gap-4 sm:flex sm:items-start sm:justify-between">
            <div>
              <p className="text-[13px] font-bold uppercase text-primary">Connections</p>
              <h1 className="mt-1.5 text-[28px] leading-[1.15] sm:text-[34px]">Google account access</h1>
              <p className="mt-2 leading-[1.5] text-muted">
                Signed in as{" "}
                <strong>
                  {user?.primaryEmailAddress?.emailAddress ?? user?.fullName}
                </strong>
              </p>
              <p className="mt-2 leading-[1.5] text-muted">
                {accountSynced ? "Account synced" : "Syncing account"}
              </p>
            </div>
            <div className="grid items-center gap-2.5 sm:flex">
              <button
                className={secondaryButtonClass}
                type="button"
                onClick={refreshStatus}
                disabled={loadingStatus}
              >
                {loadingStatus ? "Refreshing" : "Refresh"}
              </button>
              <UserButton />
            </div>
          </div>

          {message ? (
            <div className="mb-4 rounded-lg border border-border bg-panel-soft px-3.5 py-3">
              {message}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {plugins.map((plugin) => {
              const pluginStatus = status[plugin.id];
              const isBusy = busyPlugin === plugin.id;

              return (
                <article
                  className="flex min-w-0 flex-col gap-[18px] rounded-lg border border-border bg-panel p-[18px]"
                  key={plugin.id}
                >
                  <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[1fr_auto]">
                    <div>
                      <h2 className="text-xl leading-tight">{plugin.name}</h2>
                      <p className="mt-1.5 leading-[1.45] text-muted">{plugin.description}</p>
                    </div>
                    <span
                      className={`min-w-[112px] rounded-full px-2.5 py-1.5 text-center text-[13px] font-bold ${
                        pluginStatus.connected
                          ? "bg-primary-soft text-primary"
                          : "bg-danger-soft text-[#a63d3d]"
                      }`}
                    >
                      {pluginStatus.connected ? "Connected" : "Not connected"}
                    </span>
                  </div>

                  <div className="grid min-w-0 gap-1.5 rounded-lg bg-panel-soft p-3">
                    <span className="text-[13px] text-muted">Connection</span>
                    <strong>
                      {pluginStatus.connected
                        ? "Ready for this account"
                        : "Not linked"}
                    </strong>
                  </div>

                  <div className="grid gap-2.5 sm:flex">
                    <button
                      className={primaryButtonClass}
                      type="button"
                      onClick={() => connect(plugin.id)}
                      disabled={Boolean(busyPlugin)}
                    >
                      {isBusy
                        ? "Working"
                        : pluginStatus.connected
                          ? `Reconnect ${plugin.name}`
                          : `Connect ${plugin.name}`}
                    </button>
                    {pluginStatus.connected ? (
                      <button
                        className={dangerButtonClass}
                        type="button"
                        onClick={() => disconnect(plugin.id)}
                        disabled={Boolean(busyPlugin)}
                      >
                        Disconnect
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </>
      ) : null}
    </section>
  );
}

export default function ConnectionsPage() {
  return (
    <main className="min-h-screen px-3.5 py-7 sm:px-5 sm:py-10">
      <ConnectionsContent />
    </main>
  );
}
