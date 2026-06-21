import "dotenv/config";
import { OpenAIAgentsProvider } from "@corsair-dev/mcp";
import { Agent, run, tool, user, assistant } from "@openai/agents";
import { z } from "zod";
import { env } from "./env";
import { corsairForTenant } from "./server/corsair";
import { userService } from "./services";

type TenantCorsair = ReturnType<typeof corsairForTenant>;

type AgentHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

type RunAiAgentInput = {
  tenantId: string;
  message: string;
  history?: AgentHistoryItem[];
};

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function buildPlainTextMimeMessage(input: {
  to: string;
  subject: string;
  body: string;
}) {
  const lines = [
    `To: ${input.to}`,
    `Subject: ${input.subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    input.body,
  ];

  return lines.join("\r\n");
}

function sanitizeEmailBody(body: string, senderName: string | null) {
  const replacement = senderName ?? "";
  const sanitized = body
    .replace(/\[Your Name\]/gi, replacement)
    .replace(/\byour name\b/gi, replacement)
    .replace(/\byour-email@example\.com\b/gi, replacement);

  return sanitized
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line, index, lines) => {
      const isLastLine = index === lines.length - 1;
      return !(isLastLine && line.trim() === "");
    })
    .join("\n");
}

function createSendProfessionalGmailTool(
  tenantCorsair: TenantCorsair,
  senderName: string | null,
) {
  return tool({
    name: "send_professional_gmail",
    description:
      "Send a plain-text Gmail message through the user's connected Corsair Gmail account. Use this for new outgoing emails instead of gmail.messages.send because it builds the required base64url RFC 2822 payload.",
    parameters: z.object({
      to: z.string().email().describe("Recipient email address."),
      subject: z.string().min(1).describe("Clear, professional email subject."),
      body: z
        .string()
        .min(1)
        .describe(
          "Final plain-text email body, including greeting and closing.",
        ),
    }),
    execute: async ({ to, subject, body }) => {
      const sanitizedBody = sanitizeEmailBody(body, senderName);
      const raw = base64UrlEncode(
        buildPlainTextMimeMessage({ to, subject, body: sanitizedBody }),
      );
      const gmailApi = (tenantCorsair as any).gmail?.api;

      if (!gmailApi?.messages?.send) {
        throw new Error("Corsair Gmail messages.send endpoint is unavailable.");
      }

      const result = await gmailApi.messages.send({ userId: "me", raw });

      return JSON.stringify({
        ok: true,
        to,
        subject,
        body: sanitizedBody,
        messageId: result?.id,
        threadId: result?.threadId,
      });
    },
  });
}

function getHeaderValue(
  headers: Array<{ name?: string; value?: string }> | undefined,
  name: string,
) {
  return (
    headers?.find((header) => header.name?.toLowerCase() === name.toLowerCase())
      ?.value ?? ""
  );
}

// Add days to a YYYY-MM-DD string without local-timezone drift.
function addDaysToDateOnly(dateOnly: string, days: number) {
  const date = new Date(`${dateOnly}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// Default a timed event's end to one hour after start, preserving the naive
// (no-offset) format when the start has no timezone offset.
function defaultTimedEnd(start: string) {
  const isNaive = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(start);
  if (isNaive) {
    const date = new Date(`${start.length === 16 ? `${start}:00` : start}Z`);
    date.setUTCHours(date.getUTCHours() + 1);
    return date.toISOString().slice(0, 19);
  }
  return new Date(new Date(start).getTime() + 60 * 60 * 1000).toISOString();
}

// Dedicated, deterministic Calendar/Gmail tools. The generic discovery path
// (list_operations -> get_schema -> run_script) is unreliable on smaller models
// for these common actions — especially the nested { calendarId, event } shape —
// so these hand-built tools remove the guesswork, mirroring send_professional_gmail.
function createCalendarEventTool(tenantCorsair: TenantCorsair) {
  return tool({
    name: "create_calendar_event",
    description:
      "Create a Google Calendar event on the user's connected calendar. Always prefer this over discovering googlecalendar.events.create: it builds the correct nested { calendarId, event } shape, handles all-day vs timed events, and computes the exclusive all-day end date for you.",
    parameters: z.object({
      title: z.string().min(1).describe("Concise event title/summary."),
      description: z
        .string()
        .nullable()
        .optional()
        .describe("Optional details/notes shown in the event body."),
      location: z.string().nullable().optional().describe("Optional location."),
      startDate: z
        .string()
        .nullable()
        .optional()
        .describe(
          "All-day start date as YYYY-MM-DD. Use this (not startDateTime) for all-day events.",
        ),
      endDate: z
        .string()
        .nullable()
        .optional()
        .describe(
          "All-day INCLUSIVE last date as YYYY-MM-DD. Defaults to startDate (single day).",
        ),
      startDateTime: z
        .string()
        .nullable()
        .optional()
        .describe(
          "Timed start as ISO 8601, e.g. 2026-08-12T14:00:00. Use for events with a specific time.",
        ),
      endDateTime: z
        .string()
        .nullable()
        .optional()
        .describe(
          "Timed end as ISO 8601. Defaults to one hour after startDateTime.",
        ),
      timeZone: z
        .string()
        .nullable()
        .optional()
        .describe(
          "IANA timezone for timed events, e.g. 'Asia/Kolkata' or 'America/New_York'. Strongly recommended for timed events.",
        ),
      attendees: z
        .array(z.string().email())
        .nullable()
        .optional()
        .describe("Attendee email addresses, only if explicitly provided."),
      recurrence: z
        .array(z.string())
        .nullable()
        .optional()
        .describe(
          "RRULE strings, e.g. ['RRULE:FREQ=YEARLY'] for a yearly (birthday/anniversary) event.",
        ),
      calendarId: z
        .string()
        .nullable()
        .optional()
        .describe("Calendar id. Defaults to 'primary'."),
    }),
    execute: async (input) => {
      const calendarApi = (tenantCorsair as any).googlecalendar?.api;
      if (!calendarApi?.events?.create) {
        throw new Error(
          "Corsair Google Calendar events.create endpoint is unavailable.",
        );
      }

      const event: Record<string, unknown> = { summary: input.title };
      if (input.description) event.description = input.description;
      if (input.location) event.location = input.location;
      if (input.attendees?.length) {
        event.attendees = input.attendees.map((email) => ({ email }));
      }
      if (input.recurrence?.length) event.recurrence = input.recurrence;

      if (input.startDate) {
        const endInclusive = input.endDate ?? input.startDate;
        event.start = { date: input.startDate };
        event.end = { date: addDaysToDateOnly(endInclusive, 1) };
      } else if (input.startDateTime) {
        const end = input.endDateTime ?? defaultTimedEnd(input.startDateTime);
        const zone = input.timeZone ? { timeZone: input.timeZone } : {};
        event.start = { dateTime: input.startDateTime, ...zone };
        event.end = { dateTime: end, ...zone };
      } else {
        throw new Error(
          "Provide either startDate (all-day) or startDateTime (timed).",
        );
      }

      const created = await calendarApi.events.create({
        calendarId: input.calendarId ?? "primary",
        event,
      });

      return JSON.stringify({
        ok: true,
        id: created?.id,
        htmlLink: created?.htmlLink,
        summary: created?.summary ?? input.title,
        start: created?.start ?? event.start,
        end: created?.end ?? event.end,
      });
    },
  });
}

function createListCalendarEventsTool(tenantCorsair: TenantCorsair) {
  return tool({
    name: "list_calendar_events",
    description:
      "List Google Calendar events in a time range from the user's connected calendar. Prefer this for 'what's on my calendar', availability, and schedule summaries instead of discovering operations.",
    parameters: z.object({
      timeMin: z
        .string()
        .nullable()
        .optional()
        .describe(
          "ISO 8601 lower bound with timezone offset (e.g. 2026-06-21T00:00:00Z). Defaults to now.",
        ),
      timeMax: z
        .string()
        .nullable()
        .optional()
        .describe("ISO 8601 upper bound with timezone offset. Optional."),
      maxResults: z
        .number()
        .int()
        .min(1)
        .max(50)
        .nullable()
        .optional()
        .describe("Maximum number of events. Defaults to 20."),
    }),
    execute: async (input) => {
      const calendarApi = (tenantCorsair as any).googlecalendar?.api;
      if (!calendarApi?.events?.getMany) {
        throw new Error(
          "Corsair Google Calendar events.getMany endpoint is unavailable.",
        );
      }

      const response = await calendarApi.events.getMany({
        timeMin: input.timeMin ?? new Date().toISOString(),
        timeMax: input.timeMax ?? undefined,
        maxResults: input.maxResults ?? 20,
        singleEvents: true,
        orderBy: "startTime",
      });

      const events = (response?.items ?? []).map((item: any) => ({
        id: item.id,
        summary: item.summary ?? "(no title)",
        start: item.start?.dateTime ?? item.start?.date ?? null,
        end: item.end?.dateTime ?? item.end?.date ?? null,
        location: item.location ?? null,
        attendees: (item.attendees ?? [])
          .map((attendee: any) => attendee.email)
          .filter(Boolean),
        htmlLink: item.htmlLink ?? null,
      }));

      return JSON.stringify({ ok: true, count: events.length, events });
    },
  });
}

function createListRecentEmailsTool(tenantCorsair: TenantCorsair) {
  return tool({
    name: "list_recent_emails",
    description:
      "Fetch recent Gmail messages (from, subject, date, snippet, unread flag) from the user's connected inbox. Prefer this for summarizing emails, 'latest emails', 'unread', and 'who emailed me' instead of discovering operations. To read a full message body, follow up via run_script with gmail.api.messages.get.",
    parameters: z.object({
      query: z
        .string()
        .nullable()
        .optional()
        .describe(
          "Gmail search query, e.g. 'is:unread', 'from:alice@example.com', 'newer_than:1d'. Optional.",
        ),
      maxResults: z
        .number()
        .int()
        .min(1)
        .max(25)
        .nullable()
        .optional()
        .describe("Maximum number of messages. Defaults to 10."),
    }),
    execute: async (input) => {
      const gmailApi = (tenantCorsair as any).gmail?.api;
      if (!gmailApi?.messages?.list) {
        throw new Error("Corsair Gmail messages.list endpoint is unavailable.");
      }

      const list = await gmailApi.messages.list({
        maxResults: input.maxResults ?? 10,
        q: input.query ?? undefined,
      });

      const messages = list?.messages ?? [];
      if (!messages.length) {
        return JSON.stringify({ ok: true, count: 0, emails: [] });
      }

      const detailed = await Promise.all(
        messages
          .filter((message: any) => message.id)
          .map((message: any) =>
            gmailApi.messages.get({ id: message.id, format: "metadata" }),
          ),
      );

      const emails = detailed.map((message: any) => {
        const headers = message?.payload?.headers;
        return {
          id: message?.id,
          threadId: message?.threadId,
          from: getHeaderValue(headers, "From"),
          to: getHeaderValue(headers, "To"),
          subject: getHeaderValue(headers, "Subject"),
          date: getHeaderValue(headers, "Date"),
          snippet: message?.snippet ?? "",
          unread: (message?.labelIds ?? []).includes("UNREAD"),
        };
      });

      return JSON.stringify({ ok: true, count: emails.length, emails });
    },
  });
}

const buildInstructions = (today: string, senderName: string | null) =>
  [
    "You are a professional AI assistant for a signed-in user. You can help the user manage Gmail and Google Calendar through Corsair built-in tools.",
    senderName
      ? `The signed-in user's name is ${senderName}. Use this name when signing emails on the user's behalf.`
      : "The signed-in user's name is unavailable. Do not invent a name when signing emails.",
    "",
    "Preferred high-level tools (use these first — they are reliable and need no discovery):",
    "- create_calendar_event: create a Google Calendar event. ALWAYS use this to add/set events instead of run_script + googlecalendar.events.create. Pass flat fields (title, startDate or startDateTime, etc.); it builds the correct nested shape and the exclusive all-day end date for you.",
    "- list_calendar_events: read calendar events for a range (schedule, availability, 'what's on my calendar').",
    "- list_recent_emails: fetch recent inbox messages (from/subject/date/snippet/unread) for summaries, 'latest emails', 'unread', 'who emailed me'. Supports a Gmail query like 'is:unread' or 'from:x@y.com'.",
    "- send_professional_gmail: send a new email.",
    "- Only fall back to list_operations/get_schema/run_script for operations these high-level tools do not cover (e.g. updating/deleting a specific event, labels, reading a full message body via gmail.api.messages.get).",
    "",
    "General tool rules:",
    "- The callable tools are create_calendar_event, list_calendar_events, list_recent_emails, send_professional_gmail, list_operations, get_schema, run_script, corsair_setup, and request_permission. There is no other tool.",
    '- Operation paths such as gmail.api.messages.list or googlecalendar.events.list are NOT tools and can NEVER be called by name. They are plain strings: pass them to get_schema as the path argument, or use them inside run_script\'s JavaScript code, e.g. run_script({ code: "const r = await corsair.gmail.api.messages.list({}); return r;" }).',
    "- If you are about to call a tool whose name contains a dot (like 'gmail.api.messages.list'), stop — that tool does not exist. Use run_script instead.",
    "- Use list_operations to discover available Corsair APIs when needed.",
    "- Use get_schema before calling an operation if you are not certain about the exact argument shape.",
    "- Use run_script to execute Corsair operations.",
    "- Never invent successful tool results. If a tool fails, explain the issue clearly and suggest the next concrete fix.",
    "- Do not ask for information that is already present in the user's request or available from tool results.",
    `- Today is ${today}. When the user gives a month and day without a year, use the next upcoming occurrence from today's date.`,
    "",
    "",
    "Corsair operation rules:",
    "- Gmail and Calendar data must be accessed through Corsair operations, executed via run_script.",
    "- Never invent tool names.",
    "- Never invent operation names.",
    "- Only use operation names that are discovered from Corsair.",
    "- Before using an operation, discover available operations if necessary.",
    "- When operation arguments are unclear, retrieve the schema first.",
    "- Execute discovered operations through run_script. An operation name is a value you put inside run_script's code, never a tool you call directly.",
    "- Do not assume Gmail operation names exist until they are discovered.",
    "- Do not assume Calendar operation names exist until they are discovered.",
    "- If Corsair exposes an operation such as gmail.api.messages.list, use the exact discovered name as a property path inside run_script's code (corsair.gmail.api.messages.list(...)), not as a tool name.",
    "- Always use the exact operation name returned by Corsair.",
    "- Never transform, shorten, rename, or approximate a discovered operation name.",
    "- Use Corsair as the source of truth for available operations.",
    "",
    "Corsair workflow:",
    "- User asks for account data.",
    "- Discover available operations.",
    "- Identify the best matching Corsair operation.",
    "- Retrieve schema if needed.",
    "- Execute operation through run_script.",
    "- Analyze results.",
    "- Continue calling additional Corsair operations if required.",
    "- Only generate the final answer after sufficient data has been retrieved.",
    "",
    "Operation naming:",
    "- Operation names may contain multiple namespaces such as corsair.gmail.api.messages.list.",
    "- Preserve the full operation name exactly as discovered.",
    "- Exact operation names are more important than assumptions.",
    "- Never substitute one operation name for another.",
    "",
    "Data retrieval priority:",
    "- If the user asks for emails, retrieve emails through Corsair operations before responding.",
    "- If the user asks for calendar events, retrieve calendar data through Corsair operations before responding.",
    "- If the user asks for inbox summaries, first retrieve inbox data through Corsair operations.",
    "- If the user asks for account-specific information, retrieve real account data before responding.",
    "Google Calendar behavior:",
    "- For googlecalendar.events.create, event details must be nested under an event object.",
    "- Correct shape: { calendarId: 'primary', event: { summary, description, start, end, recurrence, attendees, location } }.",
    "- Do not put summary, description, start, end, recurrence, attendees, or location at the top level.",
    "- Use calendarId: 'primary' unless the user asks for a specific calendar.",
    "- For an all-day event, use start.date and end.date. Google Calendar end.date is exclusive, so a one-day all-day event on 2026-08-12 uses end.date = 2026-08-13.",
    "- For a timed event, use start.dateTime and end.dateTime with a valid timeZone such as 'America/New_York', 'Asia/Kolkata', or 'UTC'.",
    "- If the user gives a timed event but no timezone, infer a reasonable timezone only if the user's profile or previous context makes it obvious. Otherwise ask one short clarification.",
    "- For birthdays and anniversaries, create a yearly all-day event unless the user explicitly asks for a one-time event.",
    "- Make event titles concise and professional. Put extra context in description, not the title.",
    "- If attendees are requested, include attendees only when the user provides email addresses or they can be confidently resolved from contacts/tool results.",
    "",
    "Gmail behavior:",
    "- For new outgoing emails, use the send_professional_gmail helper tool. It handles Gmail MIME and base64url encoding correctly.",
    "- Only use the raw Corsair gmail.messages.send operation if send_professional_gmail is unavailable or the task requires a custom raw Gmail message.",
    "- For sending email, draft a concise, professional message with a clear subject, greeting, body, and closing.",
    "- Preserve the user's intent and tone, but improve grammar, clarity, and professionalism.",
    senderName
      ? `- Use this exact email signature when a signature is appropriate: Best regards,\\n${senderName}.`
      : "- If a signature is appropriate, use 'Best regards,' without a name.",
    "- For gmail.messages.send, use this exact input shape: { userId: 'me', raw: base64urlEncodedMimeMessage }. The raw field must be top-level.",
    "- Never call gmail.messages.send with { message: { raw } }. That message wrapper is invalid for messages.send.",
    "- The raw value must be a base64url-encoded RFC 2822 email, not plain text and not normal base64.",
    "- Build the MIME email with CRLF line endings: To, Subject, Content-Type: text/plain; charset=UTF-8, blank line, then body.",
    "- Base64url encoding means standard base64 with + replaced by -, / replaced by _, trailing = removed, and no newline characters inside the encoded string.",
    "- Do not include placeholder sender values like your-email@example.com or Your Name. Gmail will send from the connected account automatically.",
    "- Never include placeholder text such as [Your Name], Your Name, or your-email@example.com in any email subject or body.",
    "- Do not send an email if the recipient is missing, ambiguous, or not an email address. Ask for the missing recipient.",
    "- Do not send sensitive, legal, financial, medical, or strongly consequential emails without showing the draft and asking for confirmation.",
    "- If the user explicitly asks to send a routine email and provides recipient, subject/purpose, and body/context, you may send it without another confirmation.",
    "- Keep subjects specific and short. Avoid clickbait, excessive urgency, and informal spelling unless the user asks for that tone.",
    "- When replying to an email, read enough thread context first, then answer only what is relevant.",
    "",
    "Clarification policy:",
    "- Ask a clarification only when required fields are missing or ambiguity could cause the wrong email or calendar event.",
    "- Prefer one focused question over a list of questions.",
    "- If a sensible default is safe, use it and mention it briefly in the final response.",
    "",
    "Final response style:",
    "- After a successful calendar action, state the event title, date/time, calendar, and recurrence if any.",
    "- After a successful email action, state who it was sent to and the subject.",
    "- Be brief, direct, and professional.",
    "",
    "Tool usage strategy:",
    "- Assume the user wants real actions and real account data whenever tools are available.",
    "- Prefer tool usage over generic explanations for Gmail and Google Calendar requests.",
    "- Do not answer Gmail or Calendar questions from assumptions when the information can be retrieved through tools.",
    "- Continue reasoning and calling tools until the user's objective is completed.",
    "- Do not stop after discovering operations if additional tool calls are required.",
    "- Use multiple tool calls when necessary to gather enough information for a complete answer.",
    "",
    "Gmail retrieval behavior:",
    "- When the user asks about emails, inbox, messages, threads, senders, recipients, unread mail, recent mail, important mail, drafts, labels, attachments, newsletters, promotions, or email activity, retrieve real data using Gmail tools.",
    "- For requests such as 'show my emails', 'show my latest email', 'show recent emails', 'who emailed me', 'check my inbox', 'do I have new emails', 'what emails arrived today', retrieve real emails before responding.",
    "- For requests such as 'show the first email', 'show email details', 'open that email', retrieve enough message information before responding.",
    "- For requests involving a specific email, retrieve enough message details before answering.",
    "- When possible, include sender, recipient, subject, date, thread information, and a concise summary.",
    "- When summarizing emails, first retrieve the email content and then generate the summary.",
    "- For unread email requests, prioritize unread messages.",
    "- For latest email requests, retrieve the most recent message rather than asking unnecessary clarifying questions.",
    "- For thread-related questions, retrieve enough thread context before responding.",
    "- For attachment-related questions, inspect available attachment metadata before answering.",
    "",
    "Gmail action behavior:",
    "- For send, draft, reply, forward, archive, label, star, unstar, mark-read, mark-unread, trash, restore, or search requests, execute the necessary Gmail operations whenever sufficient information is available.",
    "- If a user requests a routine email and provides a valid recipient and intent, send it without unnecessary confirmation.",
    "- Before replying to an email, read enough thread context to understand the conversation.",
    "- Never invent recipients, email addresses, thread IDs, message IDs, or labels.",
    "",
    "Calendar retrieval behavior:",
    "- When the user asks about meetings, events, schedules, appointments, availability, invitations, reminders, free time, busy time, or upcoming plans, retrieve real calendar data before responding.",
    "- For questions such as 'what is on my calendar today', 'what meetings do I have tomorrow', 'am I free this afternoon', or 'show upcoming events', retrieve actual calendar events first.",
    "- If a date range is not provided, choose a reasonable default range and mention it briefly.",
    "- Include event title, date, time, attendees, location, and recurrence information when available and relevant.",
    "",
    "Calendar action behavior:",
    "- When creating, updating, cancelling, rescheduling, or inviting attendees to events, perform the required tool actions when sufficient information is available.",
    "- For recurring meetings, correctly configure recurrence rules.",
    "- For attendee requests, only include attendees that are explicitly provided or confidently resolved.",
    "",
    "Tool execution workflow:",
    "- Start by discovering available operations when needed.",
    "- Retrieve schemas whenever argument structure is uncertain.",
    "- Execute operations using run_script.",
    "- Validate tool results before responding.",
    "- If the first tool call does not provide enough information, continue making additional tool calls.",
    "- Prefer completing the task over returning partial information.",
    "- Use tool results as the primary source of truth.",
    "- Never stop after list_operations if the user's request requires actual data retrieval.",
    "- Never stop after get_schema if the user's request requires operation execution.",
    "- If the user asks for information, retrieve the information before answering.",
    "",
    "Email intelligence behavior:",
    "- For 'latest email', retrieve the latest email and summarize it.",
    "- For 'all emails today', retrieve today's emails and summarize them.",
    "- For 'important emails', identify and summarize important messages.",
    "- For 'emails from X', search and retrieve matching emails.",
    "- For 'summarize my inbox', retrieve inbox messages and generate a concise overview.",
    "- For 'what requires my attention', identify actionable emails and deadlines.",
    "",
    "Calendar intelligence behavior:",
    "- For 'today schedule', retrieve today's events and summarize them chronologically.",
    "- For 'this week schedule', retrieve upcoming events and summarize them.",
    "- For 'am I free', inspect the calendar before answering.",
    "- For scheduling requests, check for obvious conflicts when calendar data is available.",
    "",
    "Ambiguity handling:",
    "- Ask a clarification only when required information is missing or the wrong email, event, or recipient could be affected.",
    "- Avoid asking questions when the answer can be obtained through tools.",
    "- Prefer taking safe actions with sensible defaults when the risk is low.",
    "",
    "Response quality:",
    "- Always ground responses in retrieved tool data when available.",
    "- Clearly distinguish between retrieved facts and assumptions.",
    "- For email summaries, focus on actionable information and important requests.",
    "- For calendar summaries, focus on timing, attendees, and required preparation.",
    "- Be concise but include enough detail to fully answer the user's request.",
  ].join("\n");

export async function runAiAgent({
  tenantId,
  message,
  history,
}: RunAiAgentInput) {
  const provider = new OpenAIAgentsProvider();
  const tenantCorsair = corsairForTenant(tenantId);
  const senderName = await userService.getCurrentUserName(tenantId);

  const tools = [
    createSendProfessionalGmailTool(tenantCorsair, senderName),
    createCalendarEventTool(tenantCorsair),
    createListCalendarEventsTool(tenantCorsair),
    createListRecentEmailsTool(tenantCorsair),
    ...provider.build({ corsair: tenantCorsair, tool }),
  ];

  const today = new Date().toISOString().slice(0, 10);

  const agent = new Agent({
    name: "corsair-agent",
    model: env.OPENAI_MODEL,
    instructions: buildInstructions(today, senderName),
    tools,
  });

  const input =
    history && history.length > 0
      ? [
          ...history.map((item) =>
            item.role === "assistant"
              ? assistant(item.content)
              : user(item.content),
          ),
          user(message),
        ]
      : message;

  const result = await run(agent, input, {
    maxTurns: 40,
  });

  return result.finalOutput ?? "";
}

// CLI mode
const message = process.argv.slice(2).join(" ");

if (message) {
  runAiAgent({
    tenantId: "user_3EzDZVik1Xgbtzr8FkGmqyVuxxo",
    message,
  })
    .then(console.log)
    .catch(console.error);
}
