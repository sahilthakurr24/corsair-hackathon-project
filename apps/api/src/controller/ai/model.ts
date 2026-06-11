import { z } from "zod";

export const AiChatRequestSchema = z.object({
  message: z.string().trim().min(1, "Message is required"),
});
