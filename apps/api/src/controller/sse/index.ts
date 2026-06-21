import type { Request, Response } from "express";
import { addClient, removeClient } from "../../lib/sse";
import { getAuthenticatedUserId } from "../auth";

const HEARTBEAT_INTERVAL_MS = 25_000;

export async function sseHandler(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) return;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  addClient(userId, res);

  // Keep the connection alive through proxies/tunnels that drop idle streams.
  const heartbeat = setInterval(() => {
    res.write(":\n\n");
  }, HEARTBEAT_INTERVAL_MS);

  req.on("close", () => {
    clearInterval(heartbeat);
    removeClient(userId);
  });
}
