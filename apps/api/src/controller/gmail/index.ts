import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { corsair } from "../../server/corsair";
export async function getMessages(req: Request, res: Response) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        reason: "No valid Clerk session token found",
      });
    }

    const { messages } = await corsair
      .withTenant(userId)
      .gmail.api.messages.list({});

    if (!messages?.length) {
      return res.status(404).json({
        message: "No messages found",
      });
    }

    const emails = await Promise.all(
      messages
        .filter((msg) => msg.id)
        .map((msg) =>
          corsair.withTenant(userId).gmail.api.messages.get({
            id: msg.id!,
          }),
        ),
    );

    return res.status(200).json(emails);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong!!" });
  }
}
