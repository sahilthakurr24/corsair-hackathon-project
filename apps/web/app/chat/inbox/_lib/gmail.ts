import axios from "axios";

export type GmailHeader = { name?: string; value?: string };
export type GmailMessage = {
  id?: string;
  threadId?: string;
  snippet?: string;
  internalDate?: string;
  payload?: { headers?: GmailHeader[] };
  html?: string | null;
  text?: string | null;
};

export function getHeader(message: GmailMessage, name: string) {
  return (
    message.payload?.headers?.find((header) => header.name?.toLowerCase() === name.toLowerCase())
      ?.value ?? ""
  );
}

export function formatMessageDate(internalDate?: string) {
  const date = new Date(Number(internalDate));
  if (!internalDate || Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

export function formatFullDate(internalDate?: string) {
  const date = new Date(Number(internalDate));
  if (!internalDate || Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function parseFromHeader(from: string) {
  const match = from.match(/^"?([^"<]*)"?\s*<([^>]+)>$/);
  if (match?.[1] !== undefined && match[2] !== undefined) {
    const name = match[1].trim();
    const email = match[2].trim();
    return { name: name || email, email };
  }
  return { name: from || "Unknown sender", email: from };
}

export function getErrorMessage(requestError: unknown) {
  if (axios.isAxiosError(requestError)) {
    const data = requestError.response?.data as { message?: string; reason?: string } | undefined;
    return data?.message ?? data?.reason ?? requestError.message;
  }

  return requestError instanceof Error ? requestError.message : "Something went wrong.";
}
