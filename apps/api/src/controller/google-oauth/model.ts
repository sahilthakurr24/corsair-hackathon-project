import { z } from "zod";

export const StartOAuthBodySchema = z.object({
  plugin: z.enum(["gmail", "googlecalendar"]),
});

export const PluginParamSchema = z.object({
  plugin: z.enum(["gmail", "googlecalendar"]),
});

export const CallbackQuerySchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});
