import type { NextFunction, Request, Response } from "express";
import { corsair } from "../../server/corsair";
import { getAuthenticatedUserId } from "../auth";
import { ListMessagesQuerySchema } from "./model";

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

    // format: "metadata" skips the message body (the expensive part). Don't add
    // metadataHeaders here: @corsair-dev/gmail joins it into a single comma-separated
    // query value, but Gmail's API requires it as a repeated param, so a joined value
    // matches no header and silently returns an empty headers list.
    const emails = await Promise.all(
      messages
        .filter((msg) => msg.id)
        .map((msg) =>
          tenant.gmail.api.messages.get({
            id: msg.id!,
            format: "metadata",
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
