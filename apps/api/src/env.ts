import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  CORSAIR_KEK: z.string().describe("encryption key for corsair"),
  DATABASE_URL: z.string().describe("database url"),
  OPENAI_API_KEY: z.string().describe("open-ai keys"),
  CORSAIR_TENANT_ID: z.string().default("sahil"),
  CLERK_PUBLISHABLE_KEY: z.string().describe("publishable key for clerk"),
  CLERK_SECRET_KEY: z.string().describe("secret key for clerk"),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);
