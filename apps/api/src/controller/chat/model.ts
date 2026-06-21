import { z } from "zod";

export const createConversationSchema = z.object({
  message: z.string().trim().min(1, "Message is required"),
});

export type createConversationType = z.infer<typeof createConversationSchema>;

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid().describe("conversation id from params"),
});

export const sendMessageBodySchema = z.object({
  message: z.string().trim().min(1, "Message is required"),
});
