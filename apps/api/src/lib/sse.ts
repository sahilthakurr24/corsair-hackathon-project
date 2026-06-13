import { Response } from "express";
import type {SSEType} from "./sse.type";


const clients = new Map<string, Response>();

export function addClient(userId: string, res: Response) {
  clients.set(userId, res);
}

export function removeClient(userId: string) {
  clients.delete(userId);
}

export function sendToUser(userId: string, data: SSEType) {
  const client = clients.get(userId);

  if (!client) return;

  client.write(`data: ${JSON.stringify(data)}\n\n`);
}



