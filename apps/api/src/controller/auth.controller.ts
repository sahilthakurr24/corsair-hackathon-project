import { clerkClient, getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";
import { userService } from "../services";

function getPrimaryEmail(user: Awaited<ReturnType<typeof clerkClient.users.getUser>>) {
  return (
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses.at(0)?.emailAddress ??
    null
  );
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const clerkUser = await clerkClient.users.getUser(userId);
    const email = getPrimaryEmail(clerkUser);

    return res.json({
      user: {
        id: clerkUser.id,
        email,
        name: [clerkUser.firstName, clerkUser.lastName]
          .filter(Boolean)
          .join(" "),
        avatarUrl: clerkUser.imageUrl,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await userService.createUser(req.body);

    return res.status(201).json({ user });
  } catch (error) {
    return next(error);
  }
}
