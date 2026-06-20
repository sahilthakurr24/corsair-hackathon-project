"use client";

import { useEffect, useRef, useState } from "react";

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildSrcDoc(html?: string | null, text?: string | null) {
  const body = html ?? (text ? `<pre>${escapeHtml(text)}</pre>` : "<p>This message has no content.</p>");

  return `<!doctype html>
<html>
  <head>
    <base target="_blank">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      html, body { margin: 0; padding: 16px; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: #1f2937;
        overflow-wrap: anywhere;
      }
      pre { white-space: pre-wrap; word-break: break-word; font-family: inherit; margin: 0; }
      img { max-width: 100%; height: auto; }
      a { color: #0878f9; }
    </style>
  </head>
  <body>${body}</body>
</html>`;
}

export function MailBody({ html, text }: { html?: string | null; text?: string | null }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(160);
  const srcDoc = buildSrcDoc(html, text);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    function resize() {
      const doc = iframeRef.current?.contentWindow?.document;
      if (doc?.documentElement) {
        setHeight(doc.documentElement.scrollHeight + 32);
      }
    }

    iframe.addEventListener("load", resize);
    return () => iframe.removeEventListener("load", resize);
  }, [srcDoc]);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={srcDoc}
      sandbox="allow-same-origin allow-popups"
      title="Email content"
      style={{ height }}
      className="block w-full rounded-b-[12px]"
    />
  );
}
