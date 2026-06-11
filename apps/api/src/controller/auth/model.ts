import type { clerkClient } from "@clerk/express";

export type ClerkUser = Awaited<ReturnType<typeof clerkClient.users.getUser>>;
