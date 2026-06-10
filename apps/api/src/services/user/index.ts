import { clerkClient } from "@clerk/express";
import { db, users } from "@repo/database";
import {
  ClerkUserForDbSchema,
  type ClerkUserForDbSchemaInput,
} from "./model";

class UserService {
  public async createUser(payload: ClerkUserForDbSchemaInput) {
    const { email, firstName, lastName, password } =
      await ClerkUserForDbSchema.parseAsync(payload);
    const user = await clerkClient.users.createUser({
      emailAddress: [email],
      firstName,
      lastName,
      password,
    });

    const [newUser] = await db
      .insert(users)
      .values({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? "",
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || null,
        avatarUrl: user.imageUrl,
      })
      .returning();

    return newUser;
  }
}
export const userService = new UserService();
