"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../../lib/axios";
import { ChatHeader } from "../_components/chat-header";
import { Icon } from "../_components/icon";
import { Skeleton } from "../_components/skeleton";
import { getErrorMessage } from "../inbox/_lib/gmail";

type DraftSummary = {
  id: string | null;
  messageId: string | null;
  threadId: string | null;
  to: string;
  subject: string;
  snippet: string;
  date: string | null;
};

type DraftDetail = {
  id: string | null;
  to: string;
  cc: string;
  subject: string;
  html: string | null;
  text: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

const emptyEditor = { id: null as string | null, to: "", subject: "", body: "" };

export function DraftsView() {
  const { isSignedIn } = useAuth();
  const [drafts, setDrafts] = useState<DraftSummary[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [editor, setEditor] = useState(emptyEditor);
  const [draftLoading, setDraftLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const busy = saving || sending || deleting || draftLoading;

  const loadDrafts = useCallback(async () => {
    if (!isSignedIn) return;
    setListLoading(true);
    try {
      const response = await api.get<{ drafts: DraftSummary[] }>("/gmail/drafts");
      setDrafts(response.data.drafts ?? []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setListLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    void loadDrafts();
  }, [loadDrafts]);

  function startNewDraft() {
    setEditor(emptyEditor);
    setError(null);
    setNotice(null);
  }

  async function openDraft(id: string) {
    setError(null);
    setNotice(null);
    setDraftLoading(true);
    try {
      const response = await api.get<{ draft: DraftDetail }>(
        `/gmail/drafts/${id}`,
      );
      const draft = response.data.draft;
      setEditor({
        id: draft.id,
        to: draft.to,
        subject: draft.subject,
        body: draft.text ?? "",
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDraftLoading(false);
    }
  }

  // Persist the current editor and return the draft id (creating it if new).
  async function persist() {
    const payload = {
      to: editor.to,
      subject: editor.subject,
      body: editor.body,
    };
    if (editor.id) {
      await api.put(`/gmail/drafts/${editor.id}`, payload);
      return editor.id;
    }
    const response = await api.post<{ draft: { id: string | null } }>(
      "/gmail/drafts",
      payload,
    );
    const newId = response.data.draft.id;
    if (newId) setEditor((current) => ({ ...current, id: newId }));
    return newId;
  }

  async function handleSave() {
    setError(null);
    setNotice(null);
    setSaving(true);
    try {
      await persist();
      await loadDrafts();
      setNotice("Draft saved.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function handleSend() {
    if (!editor.to.trim()) {
      setError("Add at least one recipient before sending.");
      return;
    }
    setError(null);
    setNotice(null);
    setSending(true);
    try {
      const id = await persist();
      if (!id) throw new Error("Could not save the draft before sending.");
      await api.post(`/gmail/drafts/${id}/send`);
      startNewDraft();
      await loadDrafts();
      setNotice("Email sent.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSending(false);
    }
  }

  async function handleDelete() {
    if (!editor.id) {
      startNewDraft();
      return;
    }
    setError(null);
    setNotice(null);
    setDeleting(true);
    try {
      await api.delete(`/gmail/drafts/${editor.id}`);
      startNewDraft();
      await loadDrafts();
      setNotice("Draft deleted.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <ChatHeader
        icon="mail"
        title="Drafts"
        status={listLoading ? "Loading…" : `${drafts.length} drafts`}
        subtitle="Compose and manage your Gmail drafts"
      />

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Draft list */}
        <aside className="flex max-h-[38vh] flex-none flex-col border-b border-[#e9edf3] md:max-h-none md:w-[266px] md:border-r md:border-b-0 dark:border-dk-border dark:bg-[#11161d]">
          <div className="flex flex-none items-center justify-between gap-2 px-4 py-3">
            <button
              type="button"
              onClick={startNewDraft}
              className="flex items-center gap-[6px] rounded-lg bg-brand-blue px-[11px] py-[7px] text-[11px] font-semibold text-white hover:bg-[#1565c9]"
            >
              <Icon name="plus" size={14} />
              New draft
            </button>
            <button
              type="button"
              onClick={() => void loadDrafts()}
              disabled={listLoading}
              className="rounded-md border border-[#d8e1eb] bg-white dark:border-dk-border dark:bg-dk-surface dark:text-dk-text px-[10px] py-[6px] text-[9px] font-semibold text-[#344054] disabled:text-[#98a2b3]"
            >
              {listLoading ? "…" : "Refresh"}
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
            {listLoading && drafts.length === 0 && (
              <div className="grid gap-[5px]">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="grid gap-[6px] rounded-[9px] px-[11px] py-[10px]"
                  >
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-2.5 w-1/2" />
                    <Skeleton className="h-2.5 w-4/5" />
                  </div>
                ))}
              </div>
            )}

            {!listLoading && drafts.length === 0 && (
              <p className="px-2 py-6 text-center text-[10px] text-[#98a2b3] dark:text-dk-muted">
                No drafts yet. Create one with “New draft”.
              </p>
            )}

            {drafts.map((draft) => {
              const active = draft.id === editor.id;
              return (
                <button
                  key={draft.id ?? draft.messageId}
                  type="button"
                  onClick={() => draft.id && void openDraft(draft.id)}
                  className={`mb-[5px] grid w-full gap-[3px] rounded-[9px] border px-[11px] py-[9px] text-left ${
                    active
                      ? "border-[#b7d6fb] bg-[#eaf4ff] dark:border-[#2c4a6e] dark:bg-[#16263b]"
                      : "border-transparent hover:border-[#dde5ee] hover:bg-[#f6f9fd] dark:hover:border-dk-border dark:hover:bg-dk-surface-2"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <b
                      className={`overflow-hidden text-[11px] text-ellipsis whitespace-nowrap ${active ? "text-brand-blue dark:text-[#5aa6ff]" : "text-[#1d2939] dark:text-dk-text"}`}
                    >
                      {draft.subject || "(no subject)"}
                    </b>
                    <span className="flex-none text-[8px] text-[#98a2b3] dark:text-dk-muted">
                      {formatDate(draft.date)}
                    </span>
                  </div>
                  <span className="overflow-hidden text-[9px] text-ellipsis whitespace-nowrap text-[#667085] dark:text-dk-muted">
                    {draft.to ? `To: ${draft.to}` : "No recipient"}
                  </span>
                  <span className="overflow-hidden text-[9px] text-ellipsis whitespace-nowrap text-[#98a2b3] dark:text-[#6f7c8a]">
                    {draft.snippet || "Empty draft"}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Editor */}
        <section className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-none flex-wrap items-center justify-between gap-2 border-b border-[#eef1f5] px-5 py-3 md:px-7 dark:border-dk-border">
            <b className="text-[12px] text-[#1d2939] dark:text-dk-text">
              {editor.id ? "Edit draft" : "New draft"}
            </b>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={busy}
                className="rounded-md border border-[#d8e1eb] bg-white dark:border-dk-border dark:bg-dk-surface dark:text-dk-text px-3 py-[7px] text-[10px] font-semibold text-[#344054] disabled:cursor-not-allowed disabled:text-[#98a2b3]"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={busy}
                className="flex items-center gap-[5px] rounded-md border border-[#f2c4bf] bg-white px-3 py-[7px] text-[10px] font-semibold text-[#b3261e] hover:bg-[#fff6f5] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#5a2c2c] dark:bg-dk-surface dark:text-[#f0928a] dark:hover:bg-[#2a1517]"
              >
                <Icon name="trash" size={13} />
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={busy}
                className="flex items-center gap-[5px] rounded-md bg-brand-blue px-3 py-[7px] text-[10px] font-semibold text-white hover:bg-[#1565c9] disabled:cursor-not-allowed disabled:bg-[#9fc3f3]"
              >
                <Icon name="send" size={13} />
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 md:px-7">
            {error && (
              <div className="mb-3 grid max-w-[680px] grid-cols-[1fr_auto] gap-x-3 rounded-lg border border-[#f4c7c3] bg-[#fff6f5] px-[13px] py-[10px] text-[10px] text-[#9d322b] dark:border-[#5a2c2c] dark:bg-[#2a1517] dark:text-[#f0a8a0]">
                <span className="col-start-1">{error}</span>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="col-start-2 border-0 bg-transparent text-[9px] text-inherit underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {notice && (
              <div className="mb-3 max-w-[680px] rounded-lg border border-[#bfe6cd] bg-[#f2fbf5] px-[13px] py-[10px] text-[10px] text-[#1a7340] dark:border-[#27543a] dark:bg-[#12251a] dark:text-[#7fd3a0]">
                {notice}
              </div>
            )}

            {draftLoading ? (
              <div className="mx-auto grid max-w-[720px] gap-3">
                <Skeleton className="h-[38px] w-full" />
                <Skeleton className="h-[38px] w-full" />
                <Skeleton className="h-[260px] w-full" />
              </div>
            ) : (
              <div className="mx-auto grid max-w-[720px] gap-3">
                <label className="grid gap-[5px]">
                  <span className="text-[9px] font-semibold tracking-wide text-[#8a94a6] uppercase dark:text-dk-muted">
                    To
                  </span>
                  <input
                    type="text"
                    value={editor.to}
                    onChange={(event) =>
                      setEditor((current) => ({
                        ...current,
                        to: event.target.value,
                      }))
                    }
                    placeholder="recipient@example.com"
                    className="rounded-lg border border-[#d8e1eb] bg-white dark:border-dk-border dark:bg-dk-surface px-3 py-[9px] text-[13px] text-[#273449] dark:text-dk-text outline-none focus:border-[#9bc9fc] focus:shadow-[0_0_0_3px_#eaf4ff] dark:focus:border-[#3a6ea5] dark:focus:shadow-[0_0_0_3px_#16263b] placeholder:text-[#aab4c2] dark:placeholder:text-dk-muted"
                  />
                </label>

                <label className="grid gap-[5px]">
                  <span className="text-[9px] font-semibold tracking-wide text-[#8a94a6] uppercase dark:text-dk-muted">
                    Subject
                  </span>
                  <input
                    type="text"
                    value={editor.subject}
                    onChange={(event) =>
                      setEditor((current) => ({
                        ...current,
                        subject: event.target.value,
                      }))
                    }
                    placeholder="Subject"
                    className="rounded-lg border border-[#d8e1eb] bg-white dark:border-dk-border dark:bg-dk-surface px-3 py-[9px] text-[13px] text-[#273449] dark:text-dk-text outline-none focus:border-[#9bc9fc] focus:shadow-[0_0_0_3px_#eaf4ff] dark:focus:border-[#3a6ea5] dark:focus:shadow-[0_0_0_3px_#16263b] placeholder:text-[#aab4c2] dark:placeholder:text-dk-muted"
                  />
                </label>

                <label className="grid gap-[5px]">
                  <span className="text-[9px] font-semibold tracking-wide text-[#8a94a6] uppercase dark:text-dk-muted">
                    Message
                  </span>
                  <textarea
                    value={editor.body}
                    onChange={(event) =>
                      setEditor((current) => ({
                        ...current,
                        body: event.target.value,
                      }))
                    }
                    placeholder="Write your message…"
                    rows={14}
                    className="min-h-[260px] resize-y rounded-lg border border-[#d8e1eb] bg-white dark:border-dk-border dark:bg-dk-surface px-3 py-[10px] text-[12px] leading-[1.6] text-[#273449] dark:text-dk-text outline-none focus:border-[#9bc9fc] focus:shadow-[0_0_0_3px_#eaf4ff] dark:focus:border-[#3a6ea5] dark:focus:shadow-[0_0_0_3px_#16263b] placeholder:text-[#aab4c2] dark:placeholder:text-dk-muted"
                  />
                </label>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
