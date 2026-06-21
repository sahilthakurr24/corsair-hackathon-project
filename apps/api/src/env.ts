import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const currentDir = dirname(fileURLToPath(import.meta.url));
const apiRoot = resolve(currentDir, "..");
const workspaceRoot = resolve(apiRoot, "../..");

config({ path: resolve(workspaceRoot, ".env") });
config({ path: resolve(workspaceRoot, "packages/.env") });
config({ path: resolve(apiRoot, ".env") });

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  CORSAIR_KEK: z.string().describe("encryption key for corsair"),
  DATABASE_URL: z.string().describe("database url"),
  OPENAI_API_KEY: z.string().describe("open-ai keys"),
  OPENAI_MODEL: z
    .string()
    .default("gpt-4o-mini")
    .describe("OpenAI model for the assistant agent"),
  CORSAIR_TENANT_ID: z.string().default("user_3EzDZVik1Xgbtzr8FkGmqyVuxxo"),
  GOOGLE_CLIENT_ID: z.string().describe("google client id"),
  CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string().describe("clerk secret key"),
  GOOGLE_CLIENT_SECRET: z.string().describe("google client secret"),
  WEB_ORIGIN: z.string().url().default("http://localhost:3000"),
  API_PUBLIC_ORIGIN: z.string().url().default("http://localhost:4000"),
  WEBHOOK_URL: z
    .string()
    .default("https://yapping-anyway-modular.ngrok-free.dev/"),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);
