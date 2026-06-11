import { generateOAuthUrl, processOAuthCallback } from "corsair/oauth";
import {
  connectedAccounts,
  corsairAccounts,
  corsairIntegrations,
  and,
  db,
  eq,
} from "@repo/database";
import {
  corsair,
  corsairForTenant,
  setupCorsairIntegrations,
} from "../../server/corsair";
import {
  CompleteGoogleOAuthSchema,
  type GooglePlugin,
  StartGoogleOAuthSchema,
  type CompleteGoogleOAuthInput,
  type StartGoogleOAuthInput,
} from "./model";

type GoogleConnectionStatus = Record<
  GooglePlugin,
  {
    connected: boolean;
    accountId: string | null;
  }
>;

class GoogleConnectionService {
  public async startOAuth(payload: StartGoogleOAuthInput) {
    const input = await StartGoogleOAuthSchema.parseAsync(payload);
    await setupCorsairIntegrations();

    return generateOAuthUrl(corsair, input.plugin, {
      tenantId: input.tenantId,
      redirectUri: input.redirectUri,
    });
  }

  public async completeOAuth(payload: CompleteGoogleOAuthInput) {
    const input = await CompleteGoogleOAuthSchema.parseAsync(payload);
    await setupCorsairIntegrations();

    return processOAuthCallback(corsair, {
      code: input.code,
      state: input.state,
      redirectUri: input.redirectUri,
    });
  }

  public async getStatus(tenantId: string): Promise<GoogleConnectionStatus> {
    const rows = await db
      .select({
        accountId: corsairAccounts.id,
        integration: corsairIntegrations.name,
        config: corsairAccounts.config,
      })
      .from(corsairAccounts)
      .innerJoin(
        corsairIntegrations,
        eq(corsairAccounts.integrationId, corsairIntegrations.id),
      )
      .where(eq(corsairAccounts.tenantId, tenantId));

    return {
      gmail: this.getPluginStatus(rows, "gmail"),
      googlecalendar: this.getPluginStatus(rows, "googlecalendar"),
    };
  }

  public async disconnect(tenantId: string, plugin: GooglePlugin) {
    const tenantCorsair = corsairForTenant(tenantId);
    const pluginClient = tenantCorsair[plugin];

    if (!pluginClient?.keys) {
      throw new Error(`Plugin '${plugin}' is not configured for OAuth`);
    }

    await Promise.all([
      pluginClient.keys.set_access_token(null),
      pluginClient.keys.set_refresh_token(null),
      pluginClient.keys.set_expires_at(null),
      pluginClient.keys.set_scope(null),
      pluginClient.keys.set_webhook_signature(null),
    ]);

    const rows = await db
      .select({
        accountId: corsairAccounts.id,
      })
      .from(corsairAccounts)
      .innerJoin(
        corsairIntegrations,
        eq(corsairAccounts.integrationId, corsairIntegrations.id),
      )
      .where(
        and(
          eq(corsairAccounts.tenantId, tenantId),
          eq(corsairIntegrations.name, plugin),
        ),
      );

    const account = rows.find((row) => row.accountId);

    if (account) {
      await db
        .update(connectedAccounts)
        .set({ status: "revoked", updatedAt: new Date() })
        .where(eq(connectedAccounts.corsairAccountId, account.accountId));
    }

    return this.getStatus(tenantId);
  }

  private getPluginStatus(
    rows: Array<{
      accountId: string;
      integration: string;
      config: unknown;
    }>,
    plugin: GooglePlugin,
  ) {
    const account = rows.find((row) => row.integration === plugin);
    const config = account?.config;
    const hasTokenConfig =
      !!config &&
      typeof config === "object" &&
      Object.keys(config).includes("access_token");

    return {
      connected: Boolean(account && hasTokenConfig),
      accountId: account?.accountId ?? null,
    };
  }
}

export const googleConnectionService = new GoogleConnectionService();
