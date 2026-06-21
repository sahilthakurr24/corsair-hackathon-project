import { drizzle } from "drizzle-orm/neon-http";
import { env } from "./env";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./db/schema";

export const db = drizzle(env.DATABASE_URL, { schema });
export { asc, desc, eq, sql } from "drizzle-orm";
export * from "drizzle-orm";
export * from "drizzle-orm/node-postgres";
export * from "./db";
