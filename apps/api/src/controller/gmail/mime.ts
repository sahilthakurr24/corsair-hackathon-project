type MessagePartHeader = { name?: string; value?: string };
type MessagePartBody = { attachmentId?: string; size?: number; data?: string };
type MessagePart = {
  partId?: string;
  mimeType?: string;
  filename?: string;
  headers?: MessagePartHeader[];
  body?: MessagePartBody;
  parts?: MessagePart[];
};

function decodeBase64Url(data: string) {
  const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64").toString("utf-8");
}

function base64UrlToBase64(data: string) {
  const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
  return base64 + "=".repeat((4 - (base64.length % 4)) % 4);
}

function getPartHeader(part: MessagePart, name: string) {
  return part.headers?.find(
    (header) => header.name?.toLowerCase() === name.toLowerCase(),
  )?.value;
}

function flattenParts(part: MessagePart): MessagePart[] {
  if (!part.parts?.length) return [part];
  return part.parts.flatMap(flattenParts);
}

export function extractMessageBody(payload?: MessagePart) {
  if (!payload) return { html: null, text: null };

  const inlineImages: Record<string, string> = {};
  let html: string | null = null;
  let text: string | null = null;

  for (const part of flattenParts(payload)) {
    const mimeType = part.mimeType ?? "";
    const data = part.body?.data;
    if (!data) continue;

    if (mimeType === "text/html" && !html) {
      html = decodeBase64Url(data);
    } else if (mimeType === "text/plain" && !text) {
      text = decodeBase64Url(data);
    } else if (mimeType.startsWith("image/")) {
      // Only inline attachments small enough for Gmail to embed `body.data`
      // directly can be rendered; larger ones only get an `attachmentId`,
      // which there's no operation to fetch, so those stay unresolved.
      const contentId = getPartHeader(part, "Content-ID")?.replace(
        /^<|>$/g,
        "",
      );
      if (contentId) {
        inlineImages[contentId] = `data:${mimeType};base64,${base64UrlToBase64(data)}`;
      }
    }
  }

  if (html) {
    html = html.replace(
      /cid:([^"')\s]+)/g,
      (match, cid) => inlineImages[cid] ?? match,
    );
  }

  return { html, text };
}
