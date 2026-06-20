import "dotenv/config";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { createCorsair } from "corsair";
import {
  decryptConfig,
  decryptDEK,
  encryptConfig,
  encryptDEK,
  generateDEK,
} from "corsair/core";
import { github } from "@corsair-dev/github";
import { gmail } from "@corsair-dev/gmail";
import { googlecalendar } from "@corsair-dev/googlecalendar";
import { env } from "../env";

type GoogleIntegrationName = "gmail" | "googlecalendar";

type OAuthClientCredentials = {
  client_id: string;
  client_secret: string;
};

export const pool = new Pool({ connectionString: env.DATABASE_URL });

pool.on("error", (error) => {
  console.error("[pg pool] idle client error", error);
});

export const corsair = createCorsair({
  plugins: [
    github(),
    gmail({ authType: "oauth_2" }),
    googlecalendar({ authType: "oauth_2" }),
  ],
  database: pool,
  kek: env.CORSAIR_KEK,
  multiTenancy: true,
});

type TenantCorsair = ReturnType<typeof corsair.withTenant>;

export function corsairForTenant(
  tenantId = env.CORSAIR_TENANT_ID,
): TenantCorsair {
  return corsair.withTenant(tenantId);
}

let setupPromise: Promise<void> | null = null;

async function ensureGoogleIntegration(
  name: GoogleIntegrationName,
  credentials: OAuthClientCredentials,
) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
      `corsair:${name}:integration`,
    ]);

    const existing = await client.query<{
      id: string;
      config: Record<string, string>;
      dek: string | null;
    }>(
      `SELECT id, config, dek
       FROM corsair_integrations
       WHERE name = $1
       ORDER BY created_at ASC, id ASC
       FOR UPDATE`,
      [name],
    );

    const id = existing.rows[0]?.id ?? randomUUID();
    let dek: string;
    let config: Record<string, string> = {};

    if (!existing.rows[0]) {
      dek = generateDEK();
      await client.query(
        `INSERT INTO corsair_integrations (id, name, config, dek)
         VALUES ($1, $2, '{}'::jsonb, $3)`,
        [id, name, await encryptDEK(dek, env.CORSAIR_KEK)],
      );
    } else {
      const encryptedDek = existing.rows[0].dek;

      if (encryptedDek) {
        dek = await decryptDEK(encryptedDek, env.CORSAIR_KEK);

        try {
          config = decryptConfig(existing.rows[0].config ?? {}, dek);
        } catch {
          config = {};
        }
      } else {
        dek = generateDEK();
        await client.query(
          `UPDATE corsair_integrations
           SET dek = $1, updated_at = now()
           WHERE id = $2`,
          [await encryptDEK(dek, env.CORSAIR_KEK), id],
        );
      }
    }

    const duplicateIds = existing.rows.slice(1).map((row) => row.id);

    if (duplicateIds.length > 0) {
      await client.query(
        `DELETE FROM corsair_integrations
         WHERE id = ANY($1::text[])`,
        [duplicateIds],
      );
    }

    const encryptedConfig = encryptConfig({ ...config, ...credentials }, dek);

    await client.query(
      `UPDATE corsair_integrations
       SET config = $1::jsonb, updated_at = now()
       WHERE id = $2`,
      [JSON.stringify(encryptedConfig), id],
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function setupCorsairIntegrations() {
  setupPromise ??= (async () => {
    await ensureGoogleIntegration("gmail", {
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
    });
    await ensureGoogleIntegration("googlecalendar", {
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
    });

    console.log(
      "[corsair:setup] Google OAuth integrations configured: gmail, googlecalendar",
    );
  })().catch((error) => {
    setupPromise = null;
    throw error;
  });

  return setupPromise;
}
