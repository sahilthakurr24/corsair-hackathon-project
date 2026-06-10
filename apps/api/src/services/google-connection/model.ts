import z from "zod";

export const GooglePluginSchema = z.enum(["gmail", "googlecalendar"]);

export const StartGoogleOAuthSchema = z.object({
  tenantId: z.string().min(1),
  plugin: GooglePluginSchema,
  redirectUri: z.string().url(),
});

export const CompleteGoogleOAuthSchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
  redirectUri: z.string().url(),
});

export type GooglePlugin = z.infer<typeof GooglePluginSchema>;
export type StartGoogleOAuthInput = z.infer<typeof StartGoogleOAuthSchema>;
export type CompleteGoogleOAuthInput = z.infer<
  typeof CompleteGoogleOAuthSchema
>;
