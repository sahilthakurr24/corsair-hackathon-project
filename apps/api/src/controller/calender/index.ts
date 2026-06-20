import type { Request, Response } from "express";
import { getAuthenticatedUserId } from "../auth";
import { corsair } from "../../server/corsair";

export async function getCalendarEvents(req: Request, res: Response) {
  try {
    const userId = getAuthenticatedUserId(req, res);

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const tenant = corsair.withTenant(userId);

    const eventsResponse = await tenant.googlecalendar.api.events.getMany({});

    const googleEvents = eventsResponse.items;

    if (!googleEvents?.length) {
      return res.status(404).json({
        message: "No events found",
      });
    }

    return res.status(200).json({
      message: "Fetched successfully",
      googleEvents,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}
