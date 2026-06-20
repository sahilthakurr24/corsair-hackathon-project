import Link from "next/link";

type IconName =
  | "mail"
  | "calendar"
  | "spark"
  | "search"
  | "workflow"
  | "check"
  | "clock"
  | "play"
  | "arrow"
  | "plus"
  | "send"
  | "inbox"
  | "tasks";

function Icon({
  name,
  size = 18,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M8 3v4m8-4v4M3 10h18" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 1.3 4.1L17 9l-3.7 1.9L12 15l-1.3-4.1L7 9l3.7-1.9L12 3Z" />
        <path d="m19 15 .7 2.2L22 18.5l-2.3 1.3L19 22l-.7-2.2-2.3-1.3 2.3-1.3L19 15Z" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    workflow: (
      <>
        <rect x="3" y="4" width="7" height="6" rx="2" />
        <rect x="14" y="14" width="7" height="6" rx="2" />
        <path d="M10 7h4a3 3 0 0 1 3 3v4M7 10v7h7" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    play: <path d="m9 7 8 5-8 5V7Z" />,
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m14 7 5 5-5 5" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    send: (
      <>
        <path d="m3 4 18 8-18 8 3-8-3-8Z" />
        <path d="M6 12h15" />
      </>
    ),
    inbox: (
      <>
        <path d="M4 5h16l2 10v4H2v-4L4 5Z" />
        <path d="M2 15h6l2 2h4l2-2h6" />
      </>
    ),
    tasks: (
      <>
        <path d="m4 7 2 2 3-4M12 7h8M4 15l2 2 3-4M12 15h8" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {paths[name]}
    </svg>
  );
}

const eyebrowClass =
  "mx-auto mb-1.5 block w-max rounded-full bg-[#eef6ff] px-[9px] py-1 text-[10px] font-bold text-brand-blue";
const primaryButtonClass =
  "inline-flex items-center justify-center gap-[7px] rounded-lg bg-brand-blue px-5 py-3 font-[650] text-white shadow-[0_5px_14px_rgba(8,120,249,0.19)] transition-transform duration-200 hover:-translate-y-px hover:bg-brand-blue2";

function Brand({
  variant = "default",
}: {
  variant?: "default" | "mini" | "footer";
}) {
  const markSize =
    variant === "default"
      ? "h-[30px] w-[30px] border-2 shadow-[4px_4px_0_#beddff]"
      : "h-[21px] w-[21px] border shadow-[2px_2px_0_#beddff]";
  const textClass =
    variant === "default"
      ? "text-[19px]"
      : variant === "footer"
        ? "text-[15px] text-[#111827]"
        : "text-[13px]";

  return (
    <Link
      href="/"
      className={`flex items-center gap-[9px] font-[750] tracking-[-0.5px] ${textClass}`}
    >
      <span
        className={`grid place-items-center rounded-[7px] border-brand-blue text-brand-blue ${markSize}`}
      >
        <Icon name="mail" size={20} />
      </span>
      <span>CalMail</span>
    </Link>
  );
}

const logos = [
  "Linear",
  "Vercel",
  "Notion",
  "Framer",
  "Loom",
  "Webflow",
  "Figma",
  "Dropbox",
];
const logoMarks = ["◒", "▲", "N", "F", "✺", "W", "F", "◆"];
const integrations: Array<[string, string, string]> = [
  ["M", "Gmail", "#ef4335"],
  ["31", "Calendar", "#2776e8"],
  ["▲", "Drive", "#16a05d"],
  ["✣", "Slack", "#7b2b8f"],
  ["N", "Notion", "#171717"],
  ["▣", "Zoom", "#2d8cff"],
  ["O", "Outlook", "#0879d1"],
  ["T", "Teams", "#6554c0"],
  ["◆", "Dropbox", "#1267e9"],
  ["S", "HubSpot", "#ff6c35"],
  ["✓", "ClickUp", "#e54395"],
  ["◒", "Linear", "#5e6ad2"],
];

function MiniEvent({ floating = true }: { floating?: boolean }) {
  return (
    <div
      className={
        floating
          ? "absolute top-[33px] right-[3%] z-[3] w-[207px] rotate-[5deg] rounded-xl border border-[#ecf0f5] bg-white/96 p-[15px] shadow-[0_11px_30px_rgba(34,60,90,0.12)] hidden md:block lg:right-[8.5%]"
          : "relative mb-3 rounded-xl border border-[#ecf0f5] bg-white p-[15px]"
      }
    >
      <div className="mb-3 flex items-center gap-[7px] text-[11px]">
        <span className="grid place-items-center text-brand-blue">
          <Icon name="calendar" size={15} />
        </span>
        <b className="flex-1">Upcoming Meeting</b>
        <span className="tracking-[2px] text-[#98a2b3]">•••</span>
      </div>
      <strong className="mb-1 block text-[12px]">Design Review</strong>
      <small className="block text-[10px] text-[#667085]">Today, 2:00 PM</small>
      {floating && (
        <span className="absolute right-[15px] bottom-5 h-[7px] w-[7px] rounded-full bg-brand-blue" />
      )}
    </div>
  );
}

function BriefCard({ compact = false }: { compact?: boolean }) {
  const items: Array<["mail" | "calendar" | "check", React.ReactNode]> = [
    [
      "mail",
      <>
        <b>12</b> unread emails
      </>,
    ],
    [
      "calendar",
      <>
        <b>3</b> meetings today
      </>,
    ],
    [
      "check",
      <>
        <b>4</b> pending actions
      </>,
    ],
  ];

  return (
    <div
      className={
        compact
          ? "mb-3 rounded-lg border border-[#e8edf4] bg-white p-[11px]"
          : "absolute top-[260px] left-[7%] z-[3] hidden w-[181px] rounded-xl border border-[#ecf0f5] bg-white/96 p-[15px] shadow-[0_11px_30px_rgba(34,60,90,0.12)] lg:block"
      }
    >
      <div className="mb-3 flex items-center gap-[7px] text-[11px]">
        <span className="grid place-items-center text-brand-blue">
          <Icon name="tasks" size={15} />
        </span>
        <b className="flex-1">Today&apos;s Brief</b>
        <span className="tracking-[2px] text-[#98a2b3]">•••</span>
      </div>
      {items.map(([icon, label], i) => (
        <p
          key={i}
          className="my-[9px] flex items-center gap-[7px] text-[10px] text-[#475467]"
        >
          <Icon name={icon} size={13} className="text-brand-blue" />
          {label}
        </p>
      ))}
      <a className="mt-3 flex items-center justify-between text-[10px] font-[650] cursor-pointer">
        View all <Icon name="arrow" size={13} />
      </a>
    </div>
  );
}

export function ProductPreview({
  fullScreen = false,
}: {
  fullScreen?: boolean;
}) {
  return (
    <div
      className={
        fullScreen
          ? "grid h-[calc(100vh-32px)] w-full grid-cols-[220px_minmax(420px,1fr)_280px] overflow-hidden rounded-2xl text-[13px] shadow-[0_18px_55px_rgba(30,52,78,0.12)]"
          : "ml-3.5 mt-[42px] grid h-[570px] grid-cols-[110px_1fr] overflow-hidden rounded-t-2xl border border-[#dfe6ef] text-[10px] shadow-[0_12px_35px_rgba(30,52,78,0.08)] sm:h-[620px] sm:grid-cols-[125px_1fr] lg:grid-cols-[145px_1fr_180px]"
      }
    >
      <aside
        className={`hidden flex-col border-r border-[#e8edf4] sm:flex ${
          fullScreen ? "p-6" : "p-[17px_12px]"
        }`}
      >
        <Brand variant={fullScreen ? "default" : "mini"} />
        <button
          className={`my-[18px] flex items-center rounded-md border border-[#e8edf4] bg-white text-[9px] ${
            fullScreen ? "px-[10px] py-[10px] text-[12px]" : "p-[7px]"
          }`}
        >
          <Icon name="plus" size={14} /> New Chat{" "}
          <kbd className="ml-auto text-[8px] text-[#98a2b3]">⌘ K</kbd>
        </button>
        <nav className="grid gap-0.5">
          <a
            className={`flex items-center gap-[7px] rounded-md bg-[#eaf4ff] px-2 font-[650] text-brand-blue ${fullScreen ? "h-10 px-[11px] text-[12px]" : "h-[29px]"}`}
          >
            <Icon name="spark" className="w-[13px]" />
            Chat
          </a>
          <a
            className={`flex items-center gap-[7px] rounded-md px-2 text-[#667085] ${fullScreen ? "h-10 px-[11px] text-[12px]" : "h-[29px]"}`}
          >
            <Icon name="inbox" className="w-[13px]" />
            Inbox <em className="ml-auto not-italic">12</em>
          </a>
          <a
            className={`flex items-center gap-[7px] rounded-md px-2 text-[#667085] ${fullScreen ? "h-10 px-[11px] text-[12px]" : "h-[29px]"}`}
          >
            <Icon name="calendar" className="w-[13px]" />
            Calendar
          </a>
          <a
            className={`flex items-center gap-[7px] rounded-md px-2 text-[#667085] ${fullScreen ? "h-10 px-[11px] text-[12px]" : "h-[29px]"}`}
          >
            <Icon name="mail" className="w-[13px]" />
            Drafts
          </a>
          <a
            className={`flex items-center gap-[7px] rounded-md px-2 text-[#667085] ${fullScreen ? "h-10 px-[11px] text-[12px]" : "h-[29px]"}`}
          >
            <Icon name="tasks" className="w-[13px]" />
            Tasks
          </a>
          <a
            className={`flex items-center gap-[7px] rounded-md px-2 text-[#667085] ${fullScreen ? "h-10 px-[11px] text-[12px]" : "h-[29px]"}`}
          >
            <Icon name="workflow" className="w-[13px]" />
            Contacts
          </a>
        </nav>
        <div className="mt-auto flex items-center gap-[7px]">
          <span
            className={`grid place-items-center rounded-full bg-gradient-to-br from-[#f7b890] to-[#8cc5b8] text-[8px] ${
              fullScreen ? "h-9 w-9 text-[10px]" : "h-[27px] w-[27px]"
            }`}
          >
            SC
          </span>
          <div className="grid min-w-0">
            <b className={fullScreen ? "text-[11px]" : ""}>Sarah Chen</b>
            <small
              className={`text-[#98a2b3] ${fullScreen ? "text-[9px]" : "text-[7px]"}`}
            >
              sarah@company.com
            </small>
          </div>
          <span className="ml-auto">⌄</span>
        </div>
      </aside>

      <main className="flex min-w-0 flex-col bg-white">
        <header
          className={`flex items-center justify-between border-b border-[#e8edf4] ${
            fullScreen ? "h-16 px-6" : "h-[50px] px-4"
          }`}
        >
          <b>Summarize today&apos;s emails</b>
          <span className="flex gap-[7px] text-[#98a2b3]">
            <Icon name="clock" size={15} /> ☆ ···
          </span>
        </header>
        <div
          className={`flex-1 overflow-hidden ${
            fullScreen
              ? "overflow-y-auto p-[28px_30px_12px]"
              : "p-[22px_20px_10px]"
          }`}
        >
          <div
            className={`flex mb-[15px] ${fullScreen ? "gap-3 mb-[22px]" : "gap-[9px]"}`}
          >
            <span
              className={`grid place-items-center rounded-full bg-[#0d75ef] text-white text-[8px] ${
                fullScreen ? "h-[31px] w-[31px]" : "h-[23px] w-[23px]"
              }`}
            >
              S
            </span>
            <div>
              <small
                className={`mb-[5px] block text-[#98a2b3] ${fullScreen ? "text-[9px]" : "text-[7px]"}`}
              >
                You · 9:41 AM
              </small>
              <p className={fullScreen ? "text-[12px]" : "text-[9px]"}>
                Summarize my unread emails.
              </p>
            </div>
          </div>
          <div
            className={`flex mb-[15px] ${fullScreen ? "gap-3 mb-[22px]" : "gap-[9px]"}`}
          >
            <span
              className={`grid flex-none place-items-center rounded-md bg-brand-blue text-white ${
                fullScreen ? "h-[31px] w-[31px]" : "h-6 w-6"
              }`}
            >
              <Icon name="mail" size={16} />
            </span>
            <div
              className={
                fullScreen ? "w-[min(100%,500px)]" : "w-[min(100%,340px)]"
              }
            >
              <small
                className={`mb-[5px] block text-[#98a2b3] ${fullScreen ? "text-[9px]" : "text-[7px]"}`}
              >
                CalMail · 9:41 AM
              </small>
              <p className={fullScreen ? "text-[12px]" : "text-[9px]"}>
                You have 12 unread emails. Here&apos;s a summary:
              </p>
              <div
                className={`mt-2 rounded-[7px] border border-[#e8edf4] ${fullScreen ? "p-[10px] mt-[10px]" : "p-[7px]"}`}
              >
                {[
                  [
                    "!",
                    "#fff0ed",
                    "#ef6a57",
                    "A reply needs your action",
                    "Client follow-up, approval, and responses",
                  ],
                  [
                    "↗",
                    "#eef7ff",
                    "#3989df",
                    "5 new updates",
                    "Team updates, project progress, and notifications",
                  ],
                  [
                    "◷",
                    "#fff8e5",
                    "#e3a42a",
                    "3 are newsletters",
                    "Marketing, product updates, and insights",
                  ],
                ].map(([mark, bg, fg, title, desc], i, arr) => (
                  <p
                    key={title}
                    className={`flex gap-[7px] p-[5px] ${i < arr.length - 1 ? "border-b border-[#f1f3f6]" : ""}`}
                  >
                    <i
                      style={{ background: bg, color: fg }}
                      className={`grid flex-none place-items-center rounded-full not-italic ${
                        fullScreen ? "h-6 w-6" : "h-[18px] w-[18px]"
                      }`}
                    >
                      {mark}
                    </i>
                    <span className="grid">
                      <b>{title}</b>
                      <small
                        className={`text-[#98a2b3] ${fullScreen ? "text-[9px]" : "text-[7px]"}`}
                      >
                        {desc}
                      </small>
                    </span>
                  </p>
                ))}
                <a
                  className={`flex items-center justify-end gap-1 font-[650] cursor-pointer ${
                    fullScreen ? "pt-[9px] text-[10px]" : "pt-[7px] text-[8px]"
                  }`}
                >
                  View all <Icon name="arrow" size={13} />
                </a>
              </div>
            </div>
          </div>
          <div
            className={`flex mb-[15px] ${fullScreen ? "gap-3 mb-[22px]" : "gap-[9px]"}`}
          >
            <span
              className={`grid place-items-center rounded-full bg-[#0d75ef] text-white text-[8px] ${
                fullScreen ? "h-[31px] w-[31px]" : "h-[23px] w-[23px]"
              }`}
            >
              S
            </span>
            <div>
              <small
                className={`mb-[5px] block text-[#98a2b3] ${fullScreen ? "text-[9px]" : "text-[7px]"}`}
              >
                You · 9:43 AM
              </small>
              <p className={fullScreen ? "text-[12px]" : "text-[9px]"}>
                Schedule a meeting with Rahul next week.
              </p>
            </div>
          </div>
          <div className={`flex ${fullScreen ? "gap-3" : "gap-[9px]"}`}>
            <span
              className={`grid flex-none place-items-center rounded-md bg-brand-blue text-white ${
                fullScreen ? "h-[31px] w-[31px]" : "h-6 w-6"
              }`}
            >
              <Icon name="calendar" size={16} />
            </span>
            <div
              className={
                fullScreen ? "w-[min(100%,500px)]" : "w-[min(100%,340px)]"
              }
            >
              <small
                className={`mb-[5px] block text-[#98a2b3] ${fullScreen ? "text-[9px]" : "text-[7px]"}`}
              >
                CalMail · 9:43 AM
              </small>
              <p className={fullScreen ? "text-[12px]" : "text-[9px]"}>
                I found 3 available time slots that work for both you and Rahul.
              </p>
              <div
                className={`mt-2 rounded-[7px] border border-[#e8edf4] ${fullScreen ? "p-[10px] mt-[10px]" : "p-[7px]"}`}
              >
                {[
                  ["Tue, 14 May", "2:00 PM – 3:00 PM"],
                  ["Wed, 15 May", "11:00 AM – 12:00 PM"],
                  ["Thu, 16 May", "4:00 PM – 5:00 PM"],
                ].map(([day, time], i) => (
                  <p
                    key={day}
                    className={`flex justify-between ${fullScreen ? "p-[7px_5px]" : "p-[4px_3px]"} ${
                      i > 0 ? "border-t border-[#f0f2f5]" : ""
                    }`}
                  >
                    <b>{day}</b>
                    <span>{time}</span>
                  </p>
                ))}
                <a
                  className={`flex items-center justify-end gap-1 font-[650] cursor-pointer ${
                    fullScreen ? "pt-[9px] text-[10px]" : "pt-[7px] text-[8px]"
                  }`}
                >
                  <Icon name="calendar" size={13} /> Schedule meeting{" "}
                  <Icon name="arrow" size={13} />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`grid grid-cols-[1fr_auto] items-start rounded-lg border border-[#dce3eb] text-[#98a2b3] ${
            fullScreen
              ? "mx-6 mb-5 h-[68px] p-[11px_12px] text-[11px]"
              : "mx-[15px] mb-[14px] h-[55px] p-[9px_8px]"
          }`}
        >
          <span className={fullScreen ? "text-[11px]" : "text-[9px]"}>
            Ask CalMail anything...
          </span>
          <div
            className={`flex items-end gap-2 self-end ${fullScreen ? "text-[11px]" : "text-[9px]"}`}
          >
            <span>⌘</span>
            <span>📎</span>
            <span>☺</span>
          </div>
          <button
            className={`col-start-2 row-span-2 row-start-1 grid place-items-center rounded-md border-0 bg-brand-blue text-white ${
              fullScreen ? "h-[34px] w-[34px]" : "h-7 w-7"
            }`}
          >
            <Icon name="send" size={16} />
          </button>
        </div>
      </main>

      <aside
        className={`hidden border-l border-[#e8edf4] bg-[#f8fafc] lg:block ${
          fullScreen ? "p-5" : "p-[15px_10px]"
        }`}
      >
        <MiniEvent floating={false} />
        <div className="mb-3 rounded-lg border border-[#e8edf4] bg-white p-[11px]">
          <div className="mb-3 flex items-center gap-[7px] text-[11px]">
            <span className="grid place-items-center text-brand-blue">
              <Icon name="spark" size={15} />
            </span>
            <b className="flex-1">AI Draft</b>
            <span className="tracking-[2px] text-[#98a2b3]">•••</span>
          </div>
          <strong className="block text-[12px]">Reply to Alex</strong>
          <small className="mt-[3px] block text-[10px] text-[#98a2b3]">
            Project Update
          </small>
          <p className="my-[10px] text-[8px] leading-[1.5]">
            Hi Alex,
            <br />
            Thanks for the update. The progress looks great! I have a few
            suggestions...
          </p>
          <button className="flex w-full items-center justify-between rounded-md bg-[#f6f8fb] p-[7px] text-[8px]">
            Review draft <Icon name="arrow" size={13} />
          </button>
        </div>
        <BriefCard compact />
      </aside>
    </div>
  );
}

export default function Home() {
  return (
    <div className="bg-white font-sans text-[#111827] [&_a]:cursor-pointer [&_a]:text-inherit [&_a]:no-underline">
      <header className="relative z-20 h-16 border-b border-[#f1f3f6] bg-white/[0.94] md:h-[76px]">
        <div className="mx-auto flex h-full w-[calc(100%-28px)] items-center justify-between sm:w-[min(1180px,calc(100%-48px))]">
          <Brand />
          <nav className="hidden gap-[18px] text-[13px] font-[550] text-[#344054] lg:flex lg:gap-[37px]">
            <a href="#features" className="hover:text-brand-blue">
              Features
            </a>
            <a href="#solutions" className="hover:text-brand-blue">
              Solutions
            </a>
            <a href="#integrations" className="hover:text-brand-blue">
              Integrations
            </a>
            <a href="#pricing" className="hover:text-brand-blue">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-5 text-[13px]">
            <Link href="/chat" className="hidden md:inline">
              Sign in
            </Link>
            <Link
              href="/chat"
              className={`${primaryButtonClass} text-white md:px-5 md:py-3 sm:px-[13px] sm:py-[10px]`}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative h-auto overflow-hidden px-[18px] py-[45px] pb-[60px] md:h-[510px] md:px-0 md:py-0 md:pb-0">
          <div className="absolute top-[92px] left-[4.5%] hidden h-[120px] w-[120px] rounded-full border-[1.5px] border-dashed border-[#48a9a8] opacity-85 md:block" />
          <div className="absolute top-[225px] right-[4.5%] hidden h-[120px] w-[120px] rounded-full border-[1.5px] border-dashed border-[#48a9a8] opacity-85 md:block" />
          <div className="absolute top-9 left-[3%] z-[3] hidden w-[190px] rotate-[-4deg] rounded-xl border border-[#ecf0f5] bg-gradient-to-br from-[#fff4bf] to-[#fffbdc] p-[20px_20px_50px] text-[15px] font-[650] leading-[1.5] shadow-[0_11px_30px_rgba(34,60,90,0.12)] md:block lg:left-[8.5%]">
            &ldquo;Summarize emails,
            <br />
            schedule meetings,
            <br />
            and stay on top of
            <br />
            your day.&rdquo;
            <span className="absolute right-4 -bottom-[29px] grid h-16 w-16 place-items-center rounded-2xl border-[10px] border-white bg-brand-blue text-white shadow-[0_6px_18px_#93b8dd]">
              <Icon name="mail" size={25} />
            </span>
          </div>
          <MiniEvent />
          <div className="absolute top-[165px] right-[3%] z-[3] hidden w-[174px] rotate-[4deg] rounded-xl border border-[#ecf0f5] bg-white/96 p-[14px] shadow-[0_11px_30px_rgba(34,60,90,0.12)] md:block lg:right-[8.5%]">
            <div className="mb-3 flex items-center gap-[7px] text-[11px]">
              <span className="grid place-items-center text-brand-blue">
                <Icon name="spark" size={15} />
              </span>
              <b className="flex-1">AI Draft</b>
              <span className="tracking-[2px] text-[#98a2b3]">•••</span>
            </div>
            <strong className="mb-1 block text-[12px]">Reply generated</strong>
            <small className="block text-[10px] text-[#667085]">
              Ready to send
            </small>
            <i className="mt-2 block h-1.5 w-full rounded-full bg-[#e9eef6]" />
            <i className="mt-2 block h-1.5 w-[85%] rounded-full bg-[#e9eef6]" />
            <i className="mt-2 block h-1.5 w-[60%] rounded-full bg-[#e9eef6]" />
          </div>
          <BriefCard />
          <div className="absolute top-[315px] right-[3%] z-[3] hidden w-[205px] rounded-xl border border-[#ecf0f5] bg-white/96 p-[14px] shadow-[0_11px_30px_rgba(34,60,90,0.12)] lg:right-[7%] lg:block">
            <div className="mb-3 flex items-center gap-[7px] text-[11px]">
              <span className="grid place-items-center text-brand-blue">
                <Icon name="calendar" size={15} />
              </span>
              <b className="flex-1">Integrations</b>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#e94235]">M</span>
              <span className="text-[#2877e9]">31</span>
              <span className="text-[#7e2c8c]">✣</span>
              <small className="text-[9px] text-[#667085]">+ more</small>
            </div>
          </div>
          <div className="relative z-[2] text-center md:pt-[57px]">
            <span className="mx-auto mb-[23px] grid h-[60px] w-[60px] place-items-center rounded-[19px] bg-white text-brand-blue shadow-[0_10px_28px_rgba(26,58,102,0.14)] md:mb-7 md:h-[72px] md:w-[72px]">
              <Icon name="mail" size={44} />
            </span>
            <h1 className="text-[30px] leading-[1.12] font-bold tracking-[-2px] sm:text-[35px] lg:text-[45px]">
              Your Inbox and Calendar.
              <br />
              <span className="text-brand-blue">
                Managed Through Conversation.
              </span>
            </h1>
            <p className="my-[22px] text-[16px] leading-[1.55] text-[#596477]">
              CalMail is your AI email and calendar assistant
              <br className="hidden md:inline" />
              that helps you read, write, schedule, and organize
              <br className="hidden md:inline" />
              your work through natural conversation.
            </p>
            <div className="mx-auto text-white flex w-[220px] flex-col justify-center gap-3 sm:w-auto sm:flex-row">
              <Link href="/chat" className={primaryButtonClass}>
                Start Free <Icon name="arrow" size={16} />
              </Link>
            </div>
          </div>
        </section>

        <section className="flex h-[76px] items-center justify-around gap-[18px] overflow-hidden border-b border-[#eef1f5] px-[18px] text-[13px] text-[#667085] md:justify-center md:gap-[25px] md:px-0 lg:gap-[52px]">
          {logos.map((logo, i) => (
            <span
              key={logo}
              className={`flex items-center gap-[7px] ${
                i >= 4 ? "hidden sm:inline-flex md:hidden lg:inline-flex" : ""
              } ${i >= 2 && i < 4 ? "hidden md:inline-flex" : ""}`}
            >
              <i className="font-[750] text-[#475467] not-italic">
                {logoMarks[i]}
              </i>
              {logo}
            </span>
          ))}
        </section>

        <section
          className="mx-auto mb-[38px] block w-[min(100%-28px,620px)] border-b border-[#e8edf4] sm:w-[min(100%-28px,620px)] md:grid md:w-[min(1190px,calc(100%-48px))] md:grid-cols-[300px_1fr]"
          id="solutions"
        >
          <div className="border-r-0 pr-0 pb-10 md:border-r md:border-[#e8edf4] md:py-[42px] md:pr-7">
            <span className={`${eyebrowClass} mx-0 mb-2`}>Solutions</span>
            <h2 className="mb-[34px] text-[25px] leading-[1.18] tracking-[-0.8px]">
              Solve your biggest
              <br />
              productivity challenges
            </h2>
            {(
              [
                [
                  "mail",
                  "AI Email Assistant",
                  "Summarize, draft, and prioritize emails instantly",
                ],
                [
                  "calendar",
                  "Smart Calendar",
                  "Schedule meetings, find availability, handle invites",
                ],
                [
                  "workflow",
                  "Workflow Automation",
                  "Automate follow-ups, reminders, and updates",
                ],
              ] satisfies Array<[IconName, string, string]>
            ).map(([icon, title, desc]) => (
              <div key={title} className="mb-[27px] flex gap-[14px]">
                <span className="grid h-[34px] w-[34px] flex-none place-items-center rounded-lg bg-[#edf6ff] text-brand-blue">
                  <Icon name={icon} />
                </span>
                <div>
                  <b className="text-[13px]">{title}</b>
                  <p className="mt-1 text-[11px] leading-[1.45] text-[#667085]">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
            <a className="mt-2 flex items-center gap-[5px] text-[11px] font-[650] text-brand-blue cursor-pointer">
              Learn More <Icon name="arrow" size={14} />
            </a>
          </div>
          <ProductPreview />
        </section>

        <section
          className="mx-auto w-[calc(100%-28px)] text-center sm:w-[calc(100%-28px)] md:w-[min(1180px,calc(100%-48px))]"
          id="features"
        >
          <span className={eyebrowClass}>Features</span>
          <h2 className="mb-[18px] text-[25px] tracking-[-0.6px]">
            Keep everything in one place
          </h2>
          <div className="grid grid-cols-1 gap-[14px] text-left md:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-[10px] border border-[#e8edf4] bg-white p-5">
              <small className="text-[11px] font-bold">
                Email Intelligence
              </small>
              <div className="mt-[26px]">
                {(
                  [
                    ["mail", "Summarize threads", "✦"],
                    ["spark", "Draft responses", "⌘"],
                    ["tasks", "Priority detection", "⚡"],
                  ] satisfies Array<[IconName, string, string]>
                ).map(([icon, label, mark]) => (
                  <p
                    key={label}
                    className="my-2 flex items-center gap-2 rounded-md border border-[#eef1f5] p-[9px] text-[9px]"
                  >
                    <Icon name={icon} className="text-brand-blue" />
                    {label}{" "}
                    <em className="ml-auto not-italic text-[#9dc7fa]">
                      {mark}
                    </em>
                  </p>
                ))}
              </div>
            </article>

            <article className="rounded-[10px] border border-[#e8edf4] bg-white p-5">
              <small className="text-[11px] font-bold">Smart Scheduling</small>
              <div className="mt-[18px]">
                <header className="flex justify-between text-[9px]">
                  <b>May 2024</b>
                  <span>‹ ›</span>
                </header>
                <div className="mt-3 grid grid-cols-7 gap-[5px] text-center text-[8px]">
                  {[
                    "M",
                    "T",
                    "W",
                    "T",
                    "F",
                    "S",
                    "S",
                    "6",
                    "7",
                    "8",
                    "9",
                    "10",
                    "11",
                    "12",
                    "13",
                    "14",
                    "15",
                    "16",
                    "17",
                    "18",
                    "19",
                  ].map((d, i) => (
                    <span
                      key={i}
                      className={
                        d === "17"
                          ? "rounded-full bg-brand-blue p-1 text-white"
                          : ""
                      }
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
              <ul className="mt-3 list-none text-[8px] leading-[1.7] text-[#667085] [&_li]:before:mr-[5px] [&_li]:before:text-[#475467] [&_li]:before:content-['✓']">
                <li>Create meetings</li>
                <li>Find availability</li>
                <li>Manage invitations</li>
              </ul>
            </article>

            <article className="rounded-[10px] border border-[#e8edf4] bg-white p-5">
              <small className="text-[11px] font-bold">
                AI Daily Briefings
              </small>
              <h3 className="my-[18px] text-[13px]">Good morning, Sarah 👋</h3>
              <div>
                <p className="my-[7px] flex items-center gap-[7px] text-[9px]">
                  <Icon name="calendar" className="text-brand-blue" />3 meetings
                  today
                </p>
                <p className="my-[7px] flex items-center gap-[7px] text-[9px]">
                  <Icon name="mail" className="text-brand-blue" />4 unread
                  emails
                </p>
                <p className="my-[7px] flex items-center gap-[7px] text-[9px]">
                  <Icon name="tasks" className="text-brand-blue" />1 action item
                </p>
              </div>
              <ul className="mt-3 list-none text-[8px] leading-[1.7] text-[#667085] [&_li]:before:mr-[5px] [&_li]:before:text-[#475467] [&_li]:before:content-['✓']">
                <li>Morning summaries</li>
                <li>Important emails</li>
                <li>Action items</li>
              </ul>
            </article>

            <article className="rounded-[10px] border border-[#e8edf4] bg-white p-5">
              <small className="text-[11px] font-bold">
                Natural Language Search
              </small>
              <div className="mt-[18px] grid grid-cols-[1fr_auto] rounded-md border border-[#edf0f4] p-3 text-[9px] leading-[1.5]">
                <span>
                  Find John&apos;s email
                  <br />
                  about the client project
                  <br />
                  from last month
                </span>
                <Icon
                  name="search"
                  className="col-start-2 row-span-2 row-start-1 self-center"
                />
                <div className="col-span-2 mt-[10px] grid grid-cols-[1fr_auto] rounded-md bg-[#f8fafc] p-2">
                  <b>Design Proposal</b>
                  <small className="col-start-1 block text-[#98a2b3]">
                    from John Smith
                  </small>
                  <Icon
                    name="arrow"
                    size={14}
                    className="col-start-2 row-span-2 row-start-1 self-center"
                  />
                </div>
              </div>
              <ul className="mt-3 list-none text-[8px] leading-[1.7] text-[#667085] [&_li]:before:mr-[5px] [&_li]:before:text-[#475467] [&_li]:before:content-['✓']">
                <li>Search by context</li>
                <li>Find anything instantly</li>
                <li>Save time every day</li>
              </ul>
            </article>

            <article className="col-span-1 rounded-[10px] border border-[#e8edf4] bg-white p-5 md:col-span-2 lg:col-span-2">
              <small className="text-[11px] font-bold">
                Meeting Coordination
              </small>
              <div className="relative mt-2 grid h-[100px] grid-cols-6 pt-5 text-[7px] text-[#98a2b3] after:absolute after:top-[45px] after:right-0 after:left-0 after:border-t after:border-[#e5eaf0]">
                <span>9 AM</span>
                <span>10 AM</span>
                <span>11 AM</span>
                <span>12 PM</span>
                <span>1 PM</span>
                <span>2 PM</span>
                <i className="absolute top-[37px] left-[8%] z-[2] rounded-md bg-[#e9f3ff] p-[5px_9px] text-[7px] not-italic text-[#2478d4]">
                  Team Standup
                </i>
                <i className="absolute top-[55px] left-[33%] z-[2] rounded-md bg-[#e9f3ff] p-[5px_9px] text-[7px] not-italic text-[#2478d4]">
                  Client Call
                </i>
                <i className="absolute top-[37px] left-[62%] z-[2] rounded-md bg-[#e9f3ff] p-[5px_9px] text-[7px] not-italic text-[#2478d4]">
                  Design Review
                </i>
                <i className="absolute top-[59px] left-[78%] z-[2] rounded-md bg-[#e9f3ff] p-[5px_9px] text-[7px] not-italic text-[#2478d4]">
                  Product Sync
                </i>
              </div>
              <ul className="mt-3 list-none text-[8px] leading-[1.7] text-[#667085] [&_li]:before:mr-[5px] [&_li]:before:text-[#475467] [&_li]:before:content-['✓']">
                <li>Coordinate meetings</li>
                <li>Avoid scheduling conflicts</li>
                <li>Keep everyone aligned</li>
              </ul>
            </article>

            <article className="col-span-1 rounded-[10px] border border-[#e8edf4] bg-white p-5 md:col-span-2 lg:col-span-2">
              <small className="text-[11px] font-bold">Custom Workspaces</small>
              <div className="my-5 grid grid-cols-3 gap-[9px]">
                {(
                  [
                    ["inbox", "Inbox", 12],
                    ["calendar", "Calendar", 5],
                    ["tasks", "Tasks", 7],
                  ] satisfies Array<[IconName, string, number]>
                ).map(([icon, label, count]) => (
                  <span
                    key={label}
                    className="flex items-center gap-[7px] rounded-md border border-[#eef1f5] p-3 text-[9px]"
                  >
                    <Icon name={icon} className="text-brand-blue" />
                    {label} <b className="ml-auto">{count}</b>
                  </span>
                ))}
              </div>
              <ul className="mt-3 columns-2 list-none text-[8px] leading-[1.7] text-[#667085] [&_li]:before:mr-[5px] [&_li]:before:text-[#475467] [&_li]:before:content-['✓']">
                <li>Organize your workflow</li>
                <li>Add what matters</li>
                <li>Built for your productivity</li>
              </ul>
            </article>
          </div>
        </section>

        <section
          className="mx-auto w-[calc(100%-28px)] py-[34px] pb-[58px] text-center sm:w-[calc(100%-28px)] md:w-[min(1180px,calc(100%-48px))]"
          id="pricing"
        >
          <span className={eyebrowClass}>Pricing</span>
          <h2 className="mb-[18px] text-[25px] tracking-[-0.6px]">
            Simple pricing plans
          </h2>
          <div className="mx-auto grid w-[min(350px,100%)] grid-cols-1 items-center gap-[14px] text-left sm:w-[min(350px,100%)] md:w-[min(760px,100%)] md:grid-cols-3">
            {[
              {
                name: "Basic plan",
                desc: "Perfect for individuals.",
                price: "$5",
                items: [
                  "All product features",
                  "Unlimited lists & tasks",
                  "Priority support",
                  "Unlimited tools",
                  "Unlimited file storage",
                  "Unlimited projects",
                ],
              },
              {
                name: "Pro plan",
                desc: "Ideal for small teams.",
                price: "$9",
                popular: true,
                items: [
                  "All product features",
                  "Unlimited lists & tasks",
                  "Priority support",
                  "Unlimited tools",
                  "Unlimited file storage",
                  "Unlimited projects",
                ],
              },
              {
                name: "Advanced plan",
                desc: "Best for large organizations.",
                price: "$15",
                items: [
                  "All product features",
                  "Unlimited lists & tasks",
                  "Priority support",
                  "Unlimited tools",
                  "Unlimited file storage",
                  "Unlimited projects",
                ],
              },
            ].map((plan) => (
              <article
                key={plan.name}
                className={
                  plan.popular
                    ? "relative min-h-[350px] rounded-[10px] border-0 bg-linear-[165deg] from-[#1682f5] to-[#0668e8] p-[22px] pt-[30px] text-white shadow-[0_15px_30px_rgba(8,111,232,0.2)] [&_p]:text-[#dbeeff] [&>a]:bg-white [&>a]:text-[#1b73d4]"
                    : "relative min-h-[350px] rounded-[10px] border border-[#e4e9ef] bg-white p-[22px]"
                }
              >
                {plan.popular && (
                  <span className="absolute -top-4 right-4 grid h-10 w-10 place-items-center rounded-lg bg-white text-[22px] text-[#ffc400] shadow-[0_6px_16px_#0d65bd55]">
                    ⚡
                  </span>
                )}
                <h3 className="text-[13px]">{plan.name}</h3>
                <p className="my-[5px] mb-[17px] text-[9px] text-[#98a2b3]">
                  {plan.desc}
                </p>
                <strong className="mb-[15px] block text-[27px]">
                  {plan.price}
                  <small className="text-[11px] font-[450]">/mo</small>
                </strong>
                <Link
                  href="/chat"
                  className="grid h-[30px] place-items-center rounded-md bg-brand-blue text-[9px] font-[650] text-white"
                >
                  Get started
                </Link>
                <ul className="mt-5 list-none">
                  {plan.items.map((item) => (
                    <li
                      key={item}
                      className="my-[10px] flex items-center gap-[5px] text-[8px]"
                    >
                      <Icon name="check" size={13} />
                      {item}
                    </li>
                  ))}
                </ul>
                <button className="border-0 bg-none text-[8px] underline">
                  Learn more
                </button>
              </article>
            ))}
          </div>
        </section>

        <section
          className="mx-auto w-[calc(100%-28px)] pb-11 text-center sm:w-[calc(100%-28px)] md:w-[min(1180px,calc(100%-48px))]"
          id="integrations"
        >
          <span className={eyebrowClass}>Integrations</span>
          <h2 className="mb-[18px] text-[25px] tracking-[-0.6px]">
            Connect integrations you use every day
          </h2>
          <div className="mt-[22px] grid grid-cols-3 gap-[13px] md:grid-cols-4 lg:grid-cols-[repeat(12,1fr)]">
            {integrations.map(([letter, name, color], i) => (
              <div
                key={name}
                className={`grid justify-items-center gap-2 ${i >= 6 ? "hidden lg:grid" : ""}`}
              >
                <span
                  style={{ color }}
                  className="grid h-[45px] w-[45px] place-items-center rounded-[10px] border border-[#e8edf3] bg-white text-[17px] font-extrabold shadow-[0_5px_14px_rgba(40,56,75,0.06)]"
                >
                  {letter}
                </span>
                <small className="text-[9px]">{name}</small>
              </div>
            ))}
          </div>
          <p className="mt-[18px] text-[9px] text-[#98a2b3]">
            And many more...
          </p>
        </section>

        <section className="mx-auto w-[calc(100%-28px)] pb-7 text-center sm:w-[calc(100%-28px)] md:w-[min(1180px,calc(100%-48px))]">
          <span className={eyebrowClass}>Testimonials</span>
          <h2 className="mb-[18px] text-[25px] tracking-[-0.6px]">
            People just like you are using CalMail
          </h2>
          <div className="grid grid-cols-1 gap-[10px] text-left sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {[
              [
                "“CalMail saves me hours every week. It’s like having a personal assistant.”",
                "Aaron Lee",
                "Founder at Clearbit",
                "AL",
              ],
              [
                "“The easiest way to manage emails and calendar together.”",
                "Arjun Patel",
                "CEO at Weekly",
                "AP",
              ],
              [
                "“I don’t manually schedule meetings anymore. CalMail does it all.”",
                "Natasha Kim",
                "Product Manager",
                "NK",
              ],
              [
                "“Finally, an AI that understands my inbox and my day.”",
                "Daniel Smith",
                "Marketing Lead",
                "DS",
              ],
            ].map(([quote, name, role, initials]) => (
              <article
                key={name}
                className="flex min-h-[150px] flex-col rounded-[10px] border border-[#e8edf4] p-[17px] sm:min-h-[180px]"
              >
                <blockquote className="text-[10px] leading-[1.55]">
                  {quote}
                </blockquote>
                <div className="mt-auto flex items-center gap-[9px]">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#dcecff] text-[8px] font-bold">
                    {initials}
                  </span>
                  <p className="grid">
                    <b className="text-[9px]">{name}</b>
                    <small className="text-[7px] text-[#98a2b3]">{role}</small>
                  </p>
                </div>
              </article>
            ))}
            <article className="relative col-span-1 hidden overflow-hidden bg-gradient-to-br from-[#d8e1d3] to-[#bd9471] !p-0 lg:col-span-1 lg:block">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 55% 36%, #f5dbc9 0 12%, transparent 12%), linear-gradient(120deg, transparent 0 38%, #2f4554 38% 58%, transparent 58%), linear-gradient(90deg, #dce8dc, #b88b68)",
                }}
              />
              <button className="absolute top-1/2 left-1/2 grid h-[42px] w-[42px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-0 bg-white text-brand-blue">
                <Icon name="play" size={20} />
              </button>
              <span className="absolute bottom-[10px] left-3 text-[9px] text-white underline">
                Watch customer story
              </span>
            </article>
          </div>
        </section>

        <section className="relative mx-auto h-[250px] w-[calc(100%-28px)] overflow-hidden rounded-t-2xl bg-gradient-to-br from-[#f8f6ff] to-[#eff9ff] pt-[34px] text-center sm:w-[calc(100%-28px)] md:w-[min(1180px,calc(100%-48px))]">
          <div className="hidden sm:block">
            <span className="absolute top-[34px] left-[13%] grid h-[45px] w-[45px] -rotate-[10deg] place-items-center rounded-[10px] bg-white text-brand-blue shadow-[0_8px_20px_rgba(45,76,110,0.12)]">
              <Icon name="mail" />
            </span>
            <span className="absolute top-[92px] left-[23%] grid h-[45px] w-[45px] rotate-[7deg] place-items-center rounded-[10px] bg-white text-brand-blue shadow-[0_8px_20px_rgba(45,76,110,0.12)]">
              <Icon name="spark" />
            </span>
            <span className="absolute top-[43px] right-[13%] grid h-[45px] w-[45px] rotate-[10deg] place-items-center rounded-[10px] bg-white text-brand-blue shadow-[0_8px_20px_rgba(45,76,110,0.12)]">
              <Icon name="calendar" />
            </span>
          </div>
          <h2 className="text-[27px] leading-[1.15] tracking-[-0.8px]">
            Stay organized and
            <br />
            let AI handle the busy work.
          </h2>
          <p className="my-3 mb-[17px] text-[10px] leading-[1.5] text-[#667085]">
            Join thousands of professionals using AI to
            <br />
            manage emails and schedules effortlessly.
          </p>
          <Link
            href="/chat"
            className={`${primaryButtonClass} px-[17px] py-[10px] text-[10px]`}
          >
            Get Started Free <Icon name="arrow" size={15} />
          </Link>
        </section>
      </main>

      <footer className="mx-auto w-[calc(100%-28px)] border-t border-[#e8edf4] py-8 pb-4 sm:w-[calc(100%-28px)] md:w-[min(1180px,calc(100%-48px))]">
        <div className="grid grid-cols-2 gap-[30px] sm:grid-cols-[2fr_1fr_1fr] md:grid-cols-[2.2fr_1fr_1fr_1fr_1fr]">
          <div className="col-span-2 flex flex-col gap-2 text-[9px] text-[#667085] sm:col-span-1">
            <Brand variant="footer" />
            <p className="my-1 mb-6 leading-[1.5]">
              Your inbox and calendar.
              <br />
              Managed through conversation.
            </p>
            <small>© 2026 CalMail. All rights reserved.</small>
          </div>
          <div className="hidden flex-col gap-2 text-[9px] text-[#667085] sm:flex">
            <b className="mb-1 text-[10px] text-[#344054]">Product</b>
            <a>Features</a>
            <a>Solutions</a>
            <a>Integrations</a>
            <a>Pricing</a>
          </div>
          <div className="hidden flex-col gap-2 text-[9px] text-[#667085] sm:flex">
            <b className="mb-1 text-[10px] text-[#344054]">Company</b>
            <a>About Us</a>
            <a>Careers</a>
            <a>Blog</a>
            <a>Contact</a>
          </div>
          <div className="hidden flex-col gap-2 text-[9px] text-[#667085] md:flex">
            <b className="mb-1 text-[10px] text-[#344054]">Resources</b>
            <a>Docs</a>
            <a>Security</a>
            <a>Help Center</a>
            <a>Privacy</a>
          </div>
          <div className="hidden flex-col gap-2 text-[9px] text-[#667085] md:flex">
            <b className="mb-1 text-[10px] text-[#344054]">Connect</b>
            <p className="flex gap-3 font-bold text-[#344054]">
              <span>𝕏</span>
              <span>in</span>
              <span>◉</span>
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-start gap-[22px] text-[8px] text-[#98a2b3] sm:mt-0 sm:justify-end">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Cookies</span>
        </div>
      </footer>
    </div>
  );
}
