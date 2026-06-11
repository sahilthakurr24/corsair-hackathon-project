import { getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";
import { runAiAgent } from "../../agent";
import { AiChatRequestSchema } from "./model";

export async function chat(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        reason: "No valid Clerk session token found",
      });
    }

    const { message } = await AiChatRequestSchema.parseAsync(req.body);
    const output = await runAiAgent({ tenantId: userId, message });

    return res.json({
      output,
      tenantId: userId,
    });
  } catch (error) {
    return next(error);
  }
}
