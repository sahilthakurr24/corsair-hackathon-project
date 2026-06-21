import { z } from "zod";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;

export const ListMessagesQuerySchema = z.object({
  pageToken: z.string().trim().min(1).optional(),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .optional()
    .default(DEFAULT_PAGE_SIZE),
});

export const MessageIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const DraftIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

// Drafts can be incomplete, so every field is optional and defaults to empty.
export const DraftBodySchema = z.object({
  to: z.string().trim().optional().default(""),
  cc: z.string().trim().optional().default(""),
  bcc: z.string().trim().optional().default(""),
  subject: z.string().optional().default(""),
  body: z.string().optional().default(""),
});
