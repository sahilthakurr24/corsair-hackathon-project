import type { Request, Response } from "express";
import { addClient, removeClient } from "../../lib/sse";

export async function sseHandler(req: Request, res: Response) {
  const userId = req.query.userId as string;
  res.setHeader("Content-Type", "text/event-stream");

  res.setHeader("Cache-Control", "no-cache");

  res.setHeader("Connection", "keep-alive");

  addClient(userId, res);

  req.on("close", () => {
    removeClient(userId);
  });
}
