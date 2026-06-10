import z from "zod";

export const ClerkUserForDbSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(5, "Password must contain atleast 5 characters")
    .max(15, "Password is too long"),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
});

export type ClerkUserForDbSchemaInput = z.infer<typeof ClerkUserForDbSchema>;
