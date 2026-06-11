import { clerkClient, getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";
import { userService } from "../../services";
import type { ClerkUser } from "./model";

function getPrimaryEmail(user: ClerkUser) {
  return (
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses.at(0)?.emailAddress ??
    null
  );
}

export function getAuthenticatedUserId(req: Request, res: Response) {
  const auth = getAuth(req);

  if (!auth.userId) {
    res.status(401).json({
      error: "Unauthorized",
      reason: auth.sessionId
        ? "Clerk session found without a user id"
        : "No valid Clerk session token found",
    });
    return null;
  }

  return auth.userId;
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getAuthenticatedUserId(req, res);
    if (!userId) return;

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

export async function syncUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = getAuthenticatedUserId(req, res);
    if (!userId) return;

    const clerkUser = await clerkClient.users.getUser(userId);
    const email = getPrimaryEmail(clerkUser);

    if (!email) {
      return res.status(400).json({
        error: "Authenticated Clerk user does not have an email address",
      });
    }

    const syncedUser = await userService.syncClerkUser({
      id: clerkUser.id,
      email,
      name:
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        null,
      avatarUrl: clerkUser.imageUrl,
    });

    return res.json({ user: syncedUser });
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
