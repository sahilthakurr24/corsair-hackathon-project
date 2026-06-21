import type { NextFunction, Request, Response } from "express";
import { corsair } from "../../server/corsair";
import { getAuthenticatedUserId } from "../auth";
import { buildRawMimeMessage, extractMessageBody } from "./mime";
import { DraftBodySchema, DraftIdParamSchema } from "./model";

type Header = { name?: string; value?: string };

function getHeader(headers: Header[] | undefined, name: string) {
  return (
    headers?.find((header) => header.name?.toLowerCase() === name.toLowerCase())
      ?.value ?? ""
  );
}

function toIsoDate(value: unknown) {
  return value instanceof Date ? value.toISOString() : null;
}

export async function listDrafts(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = getAuthenticatedUserId(req, res);
    if (!userId) return;

    const tenant = corsair.withTenant(userId);
    const { drafts } = await tenant.gmail.api.drafts.list({ maxResults: 25 });

    if (!drafts?.length) {
      return res.status(200).json({ drafts: [] });
    }

    // drafts.list only returns ids; fetch metadata for each to get headers/snippet.
    const detailed = await Promise.all(
      drafts
        .filter((draft) => draft.id)
        .map((draft) =>
          tenant.gmail.api.drafts.get({ id: draft.id!, format: "metadata" }),
        ),
    );

    const summaries = detailed.map((draft) => {
      const message = draft.message;
      const headers = message?.payload?.headers;
      return {
        id: draft.id ?? null,
        messageId: message?.id ?? null,
        threadId: message?.threadId ?? null,
        to: getHeader(headers, "To"),
        subject: getHeader(headers, "Subject"),
        snippet: message?.snippet ?? "",
        date: toIsoDate(message?.internalDate),
      };
    });

    summaries.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

    return res.status(200).json({ drafts: summaries });
  } catch (error) {
    return next(error);
  }
}

export async function getDraft(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getAuthenticatedUserId(req, res);
    if (!userId) return;

    const { id } = await DraftIdParamSchema.parseAsync(req.params);
    const tenant = corsair.withTenant(userId);

    const draft = await tenant.gmail.api.drafts.get({ id, format: "full" });
    const headers = draft.message?.payload?.headers;
    const { html, text } = extractMessageBody(draft.message?.payload);

    return res.status(200).json({
      draft: {
        id: draft.id ?? null,
        messageId: draft.message?.id ?? null,
        threadId: draft.message?.threadId ?? null,
        to: getHeader(headers, "To"),
        cc: getHeader(headers, "Cc"),
        subject: getHeader(headers, "Subject"),
        html,
        text,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function createDraft(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = getAuthenticatedUserId(req, res);
    if (!userId) return;

    const input = await DraftBodySchema.parseAsync(req.body);
    const tenant = corsair.withTenant(userId);

    const raw = buildRawMimeMessage(input);
    const draft = await tenant.gmail.api.drafts.create({
      draft: { message: { raw } },
    });

    return res.status(201).json({ draft: { id: draft.id ?? null } });
  } catch (error) {
    return next(error);
  }
}

export async function updateDraft(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = getAuthenticatedUserId(req, res);
    if (!userId) return;

    const { id } = await DraftIdParamSchema.parseAsync(req.params);
    const input = await DraftBodySchema.parseAsync(req.body);
    const tenant = corsair.withTenant(userId);

    const raw = buildRawMimeMessage(input);
    const draft = await tenant.gmail.api.drafts.update({
      id,
      draft: { message: { raw } },
    });

    return res.status(200).json({ draft: { id: draft.id ?? null } });
  } catch (error) {
    return next(error);
  }
}

export async function deleteDraft(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = getAuthenticatedUserId(req, res);
    if (!userId) return;

    const { id } = await DraftIdParamSchema.parseAsync(req.params);
    const tenant = corsair.withTenant(userId);

    await tenant.gmail.api.drafts.delete({ id });

    return res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
}

export async function sendDraft(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = getAuthenticatedUserId(req, res);
    if (!userId) return;

    const { id } = await DraftIdParamSchema.parseAsync(req.params);
    const tenant = corsair.withTenant(userId);

    const message = await tenant.gmail.api.drafts.send({ id });

    return res.status(200).json({ success: true, messageId: message.id ?? null });
  } catch (error) {
    return next(error);
  }
}
