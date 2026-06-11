"use client";

import {
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
  useUser,
} from "@clerk/nextjs";
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

function getApiOrigin() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}

async function getApiErrorMessage(response: Response) {
  const data = (await response.json().catch(() => null)) as
    | ApiErrorResponse
    | null;
  const clerkMessage =
    data?.errors?.at(0)?.longMessage ?? data?.errors?.at(0)?.message;

  return clerkMessage ?? data?.error ?? `${response.status} ${response.statusText}`;
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

    const response = await fetch(`${apiOrigin}/auth/me`, {
      headers: await authHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Could not sync your account: ${await getApiErrorMessage(response)}`);
    }

    setAccountSynced(true);
  }, [apiOrigin, authHeaders, isSignedIn]);

  const refreshStatus = useCallback(async () => {
    if (!isSignedIn) return;

    setLoadingStatus(true);

    try {
      await syncAccount();

      const response = await fetch(`${apiOrigin}/auth/google/status`, {
        headers: await authHeaders(),
      });

      if (!response.ok) throw new Error("Could not load connection status");

      const data = (await response.json()) as StatusResponse;
      setStatus(data.status);
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

      const response = await fetch(`${apiOrigin}/auth/google/oauth/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await authHeaders()),
        },
        body: JSON.stringify({ plugin }),
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response));
      }

      const data = (await response.json()) as { url: string };
      window.location.assign(data.url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "OAuth failed");
      setBusyPlugin(null);
    }
  }

  async function disconnect(plugin: GooglePlugin) {
    setBusyPlugin(plugin);
    setMessage(null);

    try {
      const response = await fetch(
        `${apiOrigin}/auth/google/connections/${plugin}`,
        {
          method: "DELETE",
          headers: await authHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response));
      }

      const data = (await response.json()) as StatusResponse;
      setStatus(data.status);
      const pluginName = plugins.find((item) => item.id === plugin)?.name;
      setMessage(`${pluginName} disconnected.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Disconnect failed");
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
    return <div className="notice">Loading account...</div>;
  }

  return (
    <section className="connections-shell">
      {!isSignedIn ? (
        <div className="auth-panel">
          <p className="eyebrow">Corsair</p>
          <h1>Connect your Google account</h1>
          <p>
            Sign in to manage Gmail and Google Calendar access for your
            workspace.
          </p>
          <div className="auth-actions">
            <SignInButton mode="modal">
              <button className="primary-button" type="button">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="secondary-button" type="button">
                Create account
              </button>
            </SignUpButton>
          </div>
        </div>
      ) : null}

      {isSignedIn ? (
        <>
          <div className="connections-header">
            <div>
              <p className="eyebrow">Connections</p>
              <h1>Google account access</h1>
              <p>
                Signed in as{" "}
                <strong>
                  {user?.primaryEmailAddress?.emailAddress ?? user?.fullName}
                </strong>
              </p>
              <p>{accountSynced ? "Account synced" : "Syncing account"}</p>
            </div>
            <div className="header-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={refreshStatus}
                disabled={loadingStatus}
              >
                {loadingStatus ? "Refreshing" : "Refresh"}
              </button>
              <UserButton />
            </div>
          </div>

          {message ? <div className="notice">{message}</div> : null}

          <div className="plugin-grid">
            {plugins.map((plugin) => {
              const pluginStatus = status[plugin.id];
              const isBusy = busyPlugin === plugin.id;

              return (
                <article className="plugin-card" key={plugin.id}>
                  <div className="plugin-card-header">
                    <div>
                      <h2>{plugin.name}</h2>
                      <p>{plugin.description}</p>
                    </div>
                    <span
                      className={
                        pluginStatus.connected
                          ? "status-pill connected"
                          : "status-pill"
                      }
                    >
                      {pluginStatus.connected ? "Connected" : "Not connected"}
                    </span>
                  </div>

                  <div className="account-row">
                    <span>Connection</span>
                    <strong>
                      {pluginStatus.connected
                        ? "Ready for this account"
                        : "Not linked"}
                    </strong>
                  </div>

                  <div className="card-actions">
                    <button
                      className="primary-button"
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
                        className="danger-button"
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
    <main className="connections-page">
      <ConnectionsContent />
    </main>
  );
}
