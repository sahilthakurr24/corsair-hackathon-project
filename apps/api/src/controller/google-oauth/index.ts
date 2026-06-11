import type { NextFunction, Request, Response } from "express";
import { env } from "../../env";
import { googleConnectionService } from "../../services";
import { getAuthenticatedUserId } from "../auth";
import {
  CallbackQuerySchema,
  PluginParamSchema,
  StartOAuthBodySchema,
} from "./model";

function getCallbackRedirectUri() {
  return `${env.API_PUBLIC_ORIGIN}/auth/google/oauth/callback`;
}

function getWebRedirectUrl(path: string, params: Record<string, string>) {
  const url = new URL(path, env.WEB_ORIGIN);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}

export async function startGoogleOAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = getAuthenticatedUserId(req, res);
    if (!userId) return;

    const input = await StartOAuthBodySchema.parseAsync(req.body);
    const result = await googleConnectionService.startOAuth({
      tenantId: userId,
      plugin: input.plugin,
      redirectUri: getCallbackRedirectUri(),
    });

    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

export async function completeGoogleOAuthCallback(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = await CallbackQuerySchema.parseAsync(req.query);
    const result = await googleConnectionService.completeOAuth({
      ...input,
      redirectUri: getCallbackRedirectUri(),
    });

    return res.redirect(
      getWebRedirectUrl("/connections", {
        oauth: "success",
        plugin: result.plugin,
      }),
    );
  } catch (error) {
    console.error(error);

    return res.redirect(
      getWebRedirectUrl("/connections", {
        oauth: "error",
      }),
    );
  }
}

export async function getGoogleConnectionStatus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = getAuthenticatedUserId(req, res);
    if (!userId) return;

    const status = await googleConnectionService.getStatus(userId);

    return res.json({ status });
  } catch (error) {
    return next(error);
  }
}

export async function disconnectGoogleConnection(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = getAuthenticatedUserId(req, res);
    if (!userId) return;

    const { plugin } = await PluginParamSchema.parseAsync(req.params);
    const status = await googleConnectionService.disconnect(userId, plugin);

    return res.json({ status });
  } catch (error) {
    return next(error);
  }
}
