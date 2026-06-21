"use client";

import { Icon } from "./icon";
import { useChatShell } from "./chat-shell";
import { ConnectionStatus } from "./connection-status";
import { ThemeToggle } from "./theme-toggle";

export function ChatHeader({
  icon,
  title,
  status,
  subtitle,
}: {
  icon: string;
  title: string;
  status?: React.ReactNode;
  subtitle: string;
}) {
  const { openSidebar } = useChatShell();

  return (
    <header className="flex h-[58px] flex-none items-center justify-between border-b border-[#e9edf3] px-[15px] md:h-[65px] md:px-6 dark:border-dk-border">
      <div className="flex items-center gap-[10px]">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={openSidebar}
          className="grid place-items-center text-[#344054] md:hidden dark:text-dk-muted"
        >
          <Icon name="menu" />
        </button>
        <span className="grid h-[31px] w-[31px] place-items-center rounded-lg bg-brand-blue text-white">
          <Icon name={icon} size={17} />
        </span>
        <div className="grid">
          <b className="text-[14px] dark:text-dk-text">{title}</b>
          {status && (
            <small className="text-[10px] text-[#7f8b9e] dark:text-dk-muted">
              {status}
            </small>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <span className="hidden text-[10px] text-[#98a2b3] lg:block dark:text-dk-muted">
          {subtitle}
        </span>
        <ConnectionStatus />
        <ThemeToggle />
      </div>
    </header>
  );
}
