"use client";

import { SignInButton, UserButton, useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "./_components/brand";
import { Icon } from "./_components/icon";
import { ChatShellProvider, useChatShell } from "./_components/chat-shell";
import { ServerEventsProvider } from "./_components/server-events";
import { SidebarChatNav } from "./_components/sidebar-chat-nav";

const navItems = [
  { href: "/chat/inbox", label: "Inbox", icon: "inbox" },
  { href: "/chat/calendar", label: "Calendar", icon: "calendar" },
  { href: "/chat/drafts", label: "Drafts", icon: "mail" },
  { href: "/chat/tasks", label: "Tasks", icon: "tasks" },
  { href: "/chat/contacts", label: "Contacts", icon: "contacts" },
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
        className={`z-20 flex min-w-0 flex-col border-r border-[#e9edf3] bg-[#fbfcfe] px-4 py-[23px] pb-[18px] transition-transform duration-200 ease-out md:static md:w-[224px] md:translate-x-0 ${
          sidebarOpen
            ? "fixed inset-y-0 left-0 w-[236px] translate-x-0 shadow-[15px_0_35px_rgba(20,39,63,0.14)]"
            : "fixed inset-y-0 left-0 w-[236px] -translate-x-[102%] md:shadow-none"
        }`}
      >
        <Brand />
        <button
          type="button"
          onClick={startNewChat}
          className="my-4 flex w-full items-center gap-2 rounded-lg border border-[#dde5ee] bg-white px-[11px] py-[10px] text-[12px] font-semibold text-[#344054] hover:border-[#b7d6fb] hover:text-brand-blue"
        >
          <Icon name="plus" size={15} />
          New Chat
          <kbd className="ml-auto text-[9px] font-medium text-[#98a2b3]">
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
                className={`flex h-10 items-center gap-[10px] rounded-[7px] px-[11px] text-[12px] ${
                  active
                    ? "bg-[#eaf4ff] font-semibold text-brand-blue"
                    : "text-[#667085] hover:bg-[#f0f5fb] hover:text-[#344054]"
                }`}
              >
                <Icon name={item.icon} />
                {item.label}
              </Link>
            );
          })}
          <SidebarChatNav onNavigate={closeSidebar} />
        </nav>
        <div className="mt-auto flex items-center gap-[9px] border-t border-[#e9edf3] pt-4">
          <span className="grid h-[34px] w-[34px] flex-none place-items-center rounded-full bg-gradient-to-br from-[#f4b283] to-[#74b6ac] text-[10px] font-bold text-white">
            {initials}
          </span>
          <div className="grid min-w-0 flex-1">
            <b className="overflow-hidden text-[11px] text-ellipsis whitespace-nowrap">
              {user?.fullName ?? "CalMail User"}
            </b>
            <small className="overflow-hidden text-[8px] text-ellipsis whitespace-nowrap text-[#98a2b3]">
              {user?.primaryEmailAddress?.emailAddress}
            </small>
          </div>
          <UserButton />
        </div>
      </aside>
    </>
  );
}

function RightRail() {
  return (
    <aside className="hidden min-w-0 overflow-y-auto border-l border-[#e9edf3] bg-[#f8fafc] p-[15px] py-5 lg:block">
      <div className="mx-[3px] mb-[15px] flex items-center justify-between">
        <b className="text-[13px]">Today</b>
        <span className="text-[9px] text-[#98a2b3]">
          {new Intl.DateTimeFormat("en", {
            month: "short",
            day: "numeric",
          }).format(new Date())}
        </span>
      </div>

      <article className="mb-3 rounded-[9px] border border-[#e7ecf2] bg-white p-[14px]">
        <header className="mb-3 flex items-center gap-[7px]">
          <span className="grid place-items-center text-brand-blue">
            <Icon name="calendar" size={15} />
          </span>
          <b className="flex-1 text-[10px]">Upcoming Meeting</b>
          <i className="text-[9px] not-italic tracking-[1px] text-[#98a2b3]">
            •••
          </i>
        </header>
        <strong className="block text-[11px]">Design Review</strong>
        <small className="mt-[3px] block text-[8px] text-[#8793a4]">
          Today, 2:00 PM – 3:00 PM
        </small>
        <div className="mt-3 flex">
          <span className="-mr-[5px] grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-[#dcecff] text-[7px] text-[#44617f]">
            SC
          </span>
          <span className="-mr-[5px] grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-[#dcecff] text-[7px] text-[#44617f]">
            RK
          </span>
          <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-[#dcecff] text-[7px] text-[#44617f]">
            +2
          </span>
        </div>
        <button
          type="button"
          className="mt-[10px] w-full rounded-md bg-[#edf5ff] py-2 text-[9px] font-bold text-[#1772d3]"
        >
          Join meeting
        </button>
      </article>

      <article className="mb-3 rounded-[9px] border border-[#e7ecf2] bg-white p-[14px]">
        <header className="mb-3 flex items-center gap-[7px]">
          <span className="grid place-items-center text-brand-blue">
            <Icon name="spark" size={15} />
          </span>
          <b className="flex-1 text-[10px]">AI Draft</b>
          <i className="text-[9px] not-italic tracking-[1px] text-[#98a2b3]">
            •••
          </i>
        </header>
        <strong className="block text-[11px]">Reply to Alex</strong>
        <small className="mt-[3px] block text-[8px] text-[#8793a4]">
          Project Update
        </small>
        <p className="my-[10px] text-[9px] leading-[1.6] text-[#596779]">
          Hi Alex,
          <br />
          Thanks for the update. The progress looks great! I have a few
          suggestions…
        </p>
        <button
          type="button"
          className="mt-[10px] w-full rounded-md bg-[#edf5ff] py-2 text-[9px] font-bold text-[#1772d3]"
        >
          Review draft
        </button>
      </article>

      <article className="mb-3 rounded-[9px] border border-[#e7ecf2] bg-white p-[14px]">
        <header className="mb-3 flex items-center gap-[7px]">
          <span className="grid place-items-center text-brand-blue">
            <Icon name="tasks" size={15} />
          </span>
          <b className="flex-1 text-[10px]">Today&apos;s Brief</b>
          <i className="text-[9px] not-italic tracking-[1px] text-[#98a2b3]">
            •••
          </i>
        </header>
        <ul className="list-none">
          <li className="my-[9px] flex items-center gap-[7px] text-[9px] text-[#596779]">
            <span className="text-brand-blue">
              <Icon name="mail" size={14} />
            </span>
            <b>12</b> unread emails
          </li>
          <li className="my-[9px] flex items-center gap-[7px] text-[9px] text-[#596779]">
            <span className="text-brand-blue">
              <Icon name="calendar" size={14} />
            </span>
            <b>3</b> meetings today
          </li>
          <li className="my-[9px] flex items-center gap-[7px] text-[9px] text-[#596779]">
            <span className="text-brand-blue">
              <Icon name="check" size={14} />
            </span>
            <b>4</b> pending actions
          </li>
        </ul>
      </article>
    </aside>
  );
}

function ChatShell({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <main className="grid min-h-screen place-items-center content-center gap-3 bg-[#f7f9fc] font-sans text-[12px] text-[#667085]">
        <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-[#d6e8fb] border-t-brand-blue" />
        <p>Loading your workspace…</p>
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f9fc] font-sans">
        <div className="grid w-[min(430px,calc(100%-32px))] justify-items-center rounded-2xl border border-[#e2e8f0] bg-white p-9 text-center shadow-[0_18px_48px_rgba(34,60,90,0.1)]">
          <Brand />
          <span className="my-4 grid h-[62px] w-[62px] place-items-center rounded-[17px] bg-[#eaf4ff] text-brand-blue">
            <Icon name="spark" size={32} />
          </span>
          <h1 className="text-[25px] tracking-[-0.7px]">
            Your AI work assistant
          </h1>
          <p className="my-[10px] mb-[22px] text-[12px] leading-[1.6] text-[#667085]">
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
          <Link href="/" className="mt-4 text-[10px] text-[#667085]">
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="grid h-screen overflow-hidden bg-white text-[#172033] md:grid-cols-[224px_minmax(420px,1fr)] lg:grid-cols-[224px_minmax(430px,1fr)_286px]">
      <Sidebar />
      <section className="flex h-screen min-w-0 flex-col bg-white">
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
