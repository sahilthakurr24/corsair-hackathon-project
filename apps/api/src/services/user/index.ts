import { clerkClient } from "@clerk/express";
import { db, users } from "@repo/database";
import {
  ClerkUserForDbSchema,
  type ClerkUserForDbSchemaInput,
} from "./model";

type ClerkUser = Awaited<ReturnType<typeof clerkClient.users.getUser>>;
type SyncedClerkUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
};

class UserService {
  private async persistClerkUser(user: ClerkUser) {
    const email =
      user.primaryEmailAddress?.emailAddress ??
      user.emailAddresses.at(0)?.emailAddress;

    if (!email) {
      throw new Error("Clerk user does not have an email address");
    }

    const name =
      [user.firstName, user.lastName].filter(Boolean).join(" ") || null;

    const [dbUser] = await db
      .insert(users)
      .values({
        id: user.id,
        email,
        name,
        avatarUrl: user.imageUrl,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email,
          name,
          avatarUrl: user.imageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();

    return dbUser;
  }

  public async upsertClerkUser(clerkUserId: string) {
    const user = await clerkClient.users.getUser(clerkUserId);
    return this.persistClerkUser(user);
  }

  public async syncClerkUser(user: SyncedClerkUser) {
    const [dbUser] = await db
      .insert(users)
      .values({
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          updatedAt: new Date(),
        },
      })
      .returning();

    return dbUser;
  }

  public async createUser(payload: ClerkUserForDbSchemaInput) {
    const { email, firstName, lastName, password } =
      await ClerkUserForDbSchema.parseAsync(payload);
    const user = await clerkClient.users.createUser({
      emailAddress: [email],
      firstName,
      lastName,
      password,
    });

    return this.persistClerkUser(user);
  }
}
export const userService = new UserService();
