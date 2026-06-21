"use client";

import { SignInButton, UserButton, useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "./_components/brand";
import { Icon } from "./_components/icon";
import { ChatShellProvider, useChatShell } from "./_components/chat-shell";
import { ServerEventsProvider } from "./_components/server-events";
import { SidebarChatNav } from "./_components/sidebar-chat-nav";
import { RightRail } from "./_components/right-rail";
import { Skeleton } from "./_components/skeleton";

const navItems = [
  { href: "/chat/inbox", label: "Inbox", icon: "inbox" },
  { href: "/chat/calendar", label: "Calendar", icon: "calendar" },
  { href: "/chat/drafts", label: "Drafts", icon: "mail" },
];

function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { sidebarOpen, closeSidebar, startNewChat } = useChatShell();

  const initials =
    user?.firstName?.at(0)?.toUpperCase() ??
    user?.primaryEmailAddress?.emailAddress.at(0)?.toUpperCase() ??
    "U";

  return (
    <>
      {sidebarOpen && (
        <button
          aria-label="Close navigation"
          onClick={closeSidebar}
          className="fixed inset-0 z-[15] border-0 bg-[rgba(20,29,43,0.36)] md:hidden"
        />
      )}
      <aside
        className={`z-20 flex min-w-0 flex-col border-r border-[#e9edf3] bg-[#fbfcfe] px-4 py-[23px] pb-[18px] transition-transform duration-200 ease-out md:static md:w-[224px] md:translate-x-0 dark:border-dk-border dark:bg-[#11161d] ${
          sidebarOpen
            ? "fixed inset-y-0 left-0 w-[236px] translate-x-0 shadow-[15px_0_35px_rgba(20,39,63,0.14)]"
            : "fixed inset-y-0 left-0 w-[236px] -translate-x-[102%] md:shadow-none"
        }`}
      >
        <Brand />
        <button
          type="button"
          onClick={startNewChat}
          className="my-4 flex w-full items-center gap-2 rounded-lg border border-[#dde5ee] bg-white px-[11px] py-[10px] text-[13px] font-semibold text-[#344054] hover:border-[#b7d6fb] hover:text-brand-blue dark:border-dk-border dark:bg-dk-surface dark:text-dk-text dark:hover:border-[#3a4a5e]"
        >
          <Icon name="plus" size={15} />
          New Chat
          <kbd className="ml-auto text-[9px] font-medium text-[#98a2b3] dark:text-dk-muted">
            ⌘ K
          </kbd>
        </button>
        <nav className="grid gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`flex h-10 items-center gap-[10px] rounded-[7px] px-[11px] text-[13px] ${
                  active
                    ? "bg-[#eaf4ff] font-semibold text-brand-blue dark:bg-[#16263b] dark:text-[#5aa6ff]"
                    : "text-[#667085] hover:bg-[#f0f5fb] hover:text-[#344054] dark:text-dk-muted dark:hover:bg-dk-surface-2 dark:hover:text-dk-text"
                }`}
              >
                <Icon name={item.icon} />
                {item.label}
              </Link>
            );
          })}
          <SidebarChatNav onNavigate={closeSidebar} />
        </nav>
        <div className="mt-auto flex items-center gap-[9px] border-t border-[#e9edf3] pt-4 dark:border-dk-border">
          <span className="grid h-[34px] w-[34px] flex-none place-items-center rounded-full bg-gradient-to-br from-[#f4b283] to-[#74b6ac] text-[10px] font-bold text-white">
            {initials}
          </span>
          <div className="grid min-w-0 flex-1">
            <b className="overflow-hidden text-[12px] text-ellipsis whitespace-nowrap dark:text-dk-text">
              {user?.fullName ?? "CalMail User"}
            </b>
            <small className="overflow-hidden text-[8px] text-ellipsis whitespace-nowrap text-[#98a2b3] dark:text-dk-muted">
              {user?.primaryEmailAddress?.emailAddress}
            </small>
          </div>
          <UserButton />
        </div>
      </aside>
    </>
  );
}

function ChatShell({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <main className="grid h-screen overflow-hidden bg-white md:grid-cols-[224px_minmax(420px,1fr)] lg:grid-cols-[224px_minmax(430px,1fr)_286px] dark:bg-dk-bg">
        <aside className="hidden flex-col gap-3 border-r border-[#e9edf3] bg-[#fbfcfe] px-4 py-[23px] md:flex dark:border-dk-border dark:bg-[#11161d]">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-10 w-full" />
          <div className="mt-2 grid gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-9 w-full" />
            ))}
          </div>
        </aside>

        <section className="flex flex-col bg-white dark:bg-dk-bg">
          <div className="flex h-[58px] flex-none items-center gap-3 border-b border-[#e9edf3] px-5 md:h-[65px] md:px-6 dark:border-dk-border">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex-1 space-y-4 px-5 py-6 md:px-[54px]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full max-w-[680px]" />
            ))}
          </div>
        </section>

        <aside className="hidden flex-col gap-3 border-l border-[#e9edf3] bg-[#f8fafc] p-4 lg:flex dark:border-dk-border dark:bg-[#0f141b]">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </aside>
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f9fc] font-sans dark:bg-dk-bg">
        <div className="grid w-[min(430px,calc(100%-32px))] justify-items-center rounded-2xl border border-[#e2e8f0] bg-white p-9 text-center shadow-[0_18px_48px_rgba(34,60,90,0.1)] dark:border-dk-border dark:bg-dk-surface">
          <Brand />
          <span className="my-4 grid h-[62px] w-[62px] place-items-center rounded-[17px] bg-[#eaf4ff] text-brand-blue dark:bg-[#16263b]">
            <Icon name="spark" size={32} />
          </span>
          <h1 className="text-[25px] tracking-[-0.7px] dark:text-dk-text">
            Your AI work assistant
          </h1>
          <p className="my-[10px] mb-[22px] text-[12px] leading-[1.6] text-[#667085] dark:text-dk-muted">
            Sign in to manage your inbox and calendar through conversation.
          </p>
          <SignInButton mode="modal">
            <button
              type="button"
              className="w-full rounded-lg bg-brand-blue px-[22px] py-3 font-semibold text-white"
            >
              Sign in to CalMail
            </button>
          </SignInButton>
          <Link
            href="/"
            className="mt-4 text-[10px] text-[#667085] dark:text-dk-muted"
          >
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="grid h-screen overflow-hidden bg-white text-[#172033] md:grid-cols-[224px_minmax(420px,1fr)] lg:grid-cols-[224px_minmax(430px,1fr)_286px] dark:bg-dk-bg dark:text-dk-text">
      <Sidebar />
      <section className="flex h-screen min-w-0 flex-col bg-white dark:bg-dk-bg">
        {children}
      </section>
      <RightRail />
    </main>
  );
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatShellProvider>
      <ServerEventsProvider>
        <ChatShell>{children}</ChatShell>
      </ServerEventsProvider>
    </ChatShellProvider>
  );
}
