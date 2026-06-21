"use client";

import { useState } from "react";

function getDomain(email: string) {
  const match = email.match(/@([^\s>]+)/);
  return match?.[1]?.toLowerCase() ?? null;
}

export function SenderAvatar({
  email,
  name,
  size = 32,
}: {
  email: string;
  name: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const domain = getDomain(email);
  const initials = name.slice(0, 2).toUpperCase();

  if (!domain || failed) {
    return (
      <span
        style={{ width: size, height: size, fontSize: size * 0.3 }}
        className="grid flex-none place-items-center self-start rounded-full bg-gradient-to-br from-[#f4b283] to-[#74b6ac] font-bold text-white"
      >
        {initials}
      </span>
    );
  }

  return (
    <span
      style={{ width: size, height: size }}
      className="grid flex-none place-items-center self-start overflow-hidden rounded-full border border-[#e7ecf2] bg-white dark:border-dk-border dark:bg-dk-surface"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size * 2}`}
        alt=""
        width={Math.round(size * 0.6)}
        height={Math.round(size * 0.6)}
        onError={() => setFailed(true)}
        className="object-contain"
      />
    </span>
  );
}
