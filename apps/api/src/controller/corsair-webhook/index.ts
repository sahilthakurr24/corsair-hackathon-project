import { processWebhook } from "corsair";
import type { NextFunction, Request, Response } from "express";
import { env } from "../../env";
import { corsair } from "../../server/corsair";
import { sendToUser } from "../../lib/sse";

function getTenantId(req: Request) {
  const url = new URL(req.originalUrl, env.WEBHOOK_URL);
  return url.searchParams.get("tenantId") ?? env.CORSAIR_TENANT_ID;
}

export async function handleCorsairWebhook(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const tenantId = getTenantId(req);
    const result = await processWebhook(corsair, req.headers, req.body ?? {}, {
      tenantId,
    });

    if (result.responseHeaders) {
      for (const [name, value] of Object.entries(result.responseHeaders)) {
        res.setHeader(name, value);
      }
    }

    if (!result.plugin) {
      return res.status(202).json({ handled: false });
    }

    console.log(`[corsair:webhook] ${result.plugin}.${result.action}`);
    console.log("webhook-result:", result);

    //send the events to frontend

    if (result.plugin && result.action) {
      sendToUser(tenantId, {
        plugin: `${result.plugin}.${result.action}`,
        body: result?.body,
      });
    }

    return res.status(result.response?.success === false ? 500 : 200).json({
      handled: true,
      plugin: result.plugin,
      action: result.action,
      response: result.response ?? { success: true },
    });
  } catch (error) {
    return next(error);
  }
}
