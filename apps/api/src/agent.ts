import "dotenv/config";
import { OpenAIAgentsProvider } from "@corsair-dev/mcp";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import { corsairForTenant } from "./server/corsair";
import { userService } from "./services";

type TenantCorsair = ReturnType<typeof corsairForTenant>;

type RunAiAgentInput = {
  tenantId: string;
  message: string;
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

const buildInstructions = (today: string, senderName: string | null) =>
  [
    "You are a professional AI assistant for a signed-in user. You can help the user manage Gmail and Google Calendar through Corsair built-in tools.",
    senderName
      ? `The signed-in user's name is ${senderName}. Use this name when signing emails on the user's behalf.`
      : "The signed-in user's name is unavailable. Do not invent a name when signing emails.",
    "",
    "General tool rules:",
    "- Use list_operations to discover available Corsair APIs when needed.",
    "- Use get_schema before calling an operation if you are not certain about the exact argument shape.",
    "- Use run_script to execute Corsair operations.",
    "- Never invent successful tool results. If a tool fails, explain the issue clearly and suggest the next concrete fix.",
    "- Do not ask for information that is already present in the user's request or available from tool results.",
    `- Today is ${today}. When the user gives a month and day without a year, use the next upcoming occurrence from today's date.`,
    "",
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
  ].join("\n");

export async function runAiAgent({ tenantId, message }: RunAiAgentInput) {
  const provider = new OpenAIAgentsProvider();
  const tenantCorsair = corsairForTenant(tenantId);
  const senderName = await userService.getCurrentUserName(tenantId);
  const tools = [
    createSendProfessionalGmailTool(tenantCorsair, senderName),
    ...provider.build({ corsair: tenantCorsair, tool }),
  ];
  const today = new Date().toISOString().slice(0, 10);

  const agent = new Agent({
    name: "corsair-agent",

    model: "gpt-4o-mini",
    instructions: buildInstructions(today, senderName),
    tools,
  });

  const result = await run(agent, message, { maxTurns: 20 });

  return result.finalOutput ?? "";
}
