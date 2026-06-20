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
