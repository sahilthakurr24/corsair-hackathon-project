import "dotenv/config";
import { Pool } from "pg";
import { createCorsair } from "corsair";
import { github } from "@corsair-dev/github";
import { gmail } from "@corsair-dev/gmail";
import { googlecalendar } from "@corsair-dev/googlecalendar";
import { env } from "../env";

export const pool = new Pool({ connectionString: env.DATABASE_URL });

export const corsair = createCorsair({
  plugins: [github(), gmail(), googlecalendar()],
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

