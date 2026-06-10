import { generateOAuthUrl, processOAuthCallback } from "corsair/oauth";
import {
  corsairAccounts,
  corsairIntegrations,
  db,
  eq,
} from "@repo/database";
import { corsair } from "../../server/corsair";
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

    return generateOAuthUrl(corsair, input.plugin, {
      tenantId: input.tenantId,
      redirectUri: input.redirectUri,
    });
  }

  public async completeOAuth(payload: CompleteGoogleOAuthInput) {
    const input = await CompleteGoogleOAuthSchema.parseAsync(payload);

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
