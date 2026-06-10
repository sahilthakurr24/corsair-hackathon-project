import "dotenv/config";
import { Pool } from "pg";
import { createCorsair } from "corsair";
import { github } from "@corsair-dev/github";
import { env } from "../env";

export const pool = new Pool({ connectionString: env.DATABASE_URL });

export const corsair = createCorsair({
  plugins: [github()],
  database: pool,
  kek: env.CORSAIR_KEK,
});

