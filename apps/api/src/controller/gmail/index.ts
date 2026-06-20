import type { NextFunction, Request, Response } from "express";
import { corsair } from "../../server/corsair";
import { getAuthenticatedUserId } from "../auth";
import { ListMessagesQuerySchema } from "./model";

const LIST_HEADERS = ["From", "Subject", "Date"];

export async function getMessages(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = getAuthenticatedUserId(req, res);
    if (!userId) return;

    const { pageToken, pageSize } = await ListMessagesQuerySchema.parseAsync(
      req.query,
    );
    const tenant = corsair.withTenant(userId);

    const { messages, nextPageToken } = await tenant.gmail.api.messages.list({
      maxResults: pageSize,
      pageToken,
    });

    if (!messages?.length) {
      return res.status(200).json({ messages: [], nextPageToken: null });
    }

    const emails = await Promise.all(
      messages
        .filter((msg) => msg.id)
        .map((msg) =>
          tenant.gmail.api.messages.get({
            id: msg.id!,
            format: "metadata",
            metadataHeaders: LIST_HEADERS,
          }),
        ),
    );

    return res.status(200).json({
      messages: emails,
      nextPageToken: nextPageToken ?? null,
    });
  } catch (error) {
    return next(error);
  }
}
