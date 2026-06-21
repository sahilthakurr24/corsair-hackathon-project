"use client";

import { Icon } from "./icon";
import { useChatShell } from "./chat-shell";

export function ChatHeader({
  icon,
  title,
  status,
  subtitle,
}: {
  icon: string;
  title: string;
  status: React.ReactNode;
  subtitle: string;
}) {
  const { openSidebar } = useChatShell();

  return (
    <header className="flex h-[58px] flex-none items-center justify-between border-b border-[#e9edf3] px-[15px] md:h-[65px] md:px-6">
      <div className="flex items-center gap-[10px]">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={openSidebar}
          className="grid place-items-center text-[#344054] md:hidden"
        >
          <Icon name="menu" />
        </button>
        <span className="grid h-[31px] w-[31px] place-items-center rounded-lg bg-brand-blue text-white">
          <Icon name={icon} size={17} />
        </span>
        <div className="grid">
          <b className="text-[13px]">{title}</b>
          <small className="text-[9px] text-[#7f8b9e]">{status}</small>
        </div>
      </div>
      <span className="hidden text-[9px] text-[#98a2b3] md:block">
        {subtitle}
      </span>
    </header>
  );
}
