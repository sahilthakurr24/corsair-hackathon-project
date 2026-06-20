import type { NextFunction, Request, Response } from "express";
import { corsair } from "../../server/corsair";
import { getAuthenticatedUserId } from "../auth";
import { ListEventsQuerySchema } from "./model";

export async function getCalendarEvents(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = getAuthenticatedUserId(req, res);
    if (!userId) return;

    const { pageToken, pageSize, timeMin, timeMax } =
      await ListEventsQuerySchema.parseAsync(req.query);
    const tenant = corsair.withTenant(userId);

    const response = await tenant.googlecalendar.api.events.getMany({
      timeMin: timeMin ?? (pageToken ? undefined : new Date().toISOString()),
      timeMax,
      maxResults: pageSize,
      pageToken,
      singleEvents: true,
      orderBy: "startTime",
    });

    return res.status(200).json({
      events: response.items ?? [],
      nextPageToken: response.nextPageToken ?? null,
    });
  } catch (error) {
    return next(error);
  }
}
