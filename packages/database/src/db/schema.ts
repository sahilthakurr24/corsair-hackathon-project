import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  boolean,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const connectedAccountProviderEnum = pgEnum(
  "connected_account_provider",
  ["google"],
);

export const connectedAccountStatusEnum = pgEnum("connected_account_status", [
  "active",
  "reauth_required",
  "revoked",
]);

export const messageRoleEnum = pgEnum("message_role", [
  "user",
  "assistant",
  "system",
]);
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    name: text("name"),
    email: text("email").notNull(),
    avatarUrl: text("avatar_url"),
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)],
);

export const connectedAccounts = pgTable(
  "connected_accounts",
  {
    id: text("id").primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    corsairAccountId: text("corsair_account_id")
      .notNull()
      .references(() => corsairAccounts.id),
    provider: connectedAccountProviderEnum("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    email: text("email").notNull(),
    status: connectedAccountStatusEnum("status").notNull().default("active"),
  },
  (table) => [
    uniqueIndex("connected_accounts_provider_account_idx").on(
      table.provider,
      table.providerAccountId,
    ),
    uniqueIndex("connected_accounts_corsair_account_idx").on(
      table.corsairAccountId,
    ),
    index("connected_accounts_user_id_idx").on(table.userId),
  ],
);

export const corsairIntegrations = pgTable("corsair_integrations", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  name: text("name").notNull(),
  config: jsonb("config").notNull().default({}),
  dek: text("dek"),
});

export const corsairAccounts = pgTable("corsair_accounts", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  tenantId: text("tenant_id").notNull(),
  integrationId: text("integration_id")
    .notNull()
    .references(() => corsairIntegrations.id),
  config: jsonb("config").notNull().default({}),
  dek: text("dek"),
});

export const corsairEntities = pgTable("corsair_entities", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  accountId: text("account_id")
    .notNull()
    .references(() => corsairAccounts.id),
  entityId: text("entity_id").notNull(),
  entityType: text("entity_type").notNull(),
  version: text("version").notNull(),
  data: jsonb("data").notNull().default({}),
});

export const corsairEvents = pgTable("corsair_events", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  accountId: text("account_id")
    .notNull()
    .references(() => corsairAccounts.id),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload").notNull().default({}),
  status: text("status"),
});

export const emailThreads = pgTable("email_threads", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: text("user_id").notNull(),

  gmailThreadId: text("gmail_thread_id").notNull().unique(),

  subject: text("subject"),

  snippet: text("snippet"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const emailMessages = pgTable("email_messages", {
  id: uuid("id").defaultRandom().primaryKey(),

  threadId: uuid("thread_id")
    .references(() => emailThreads.id, {
      onDelete: "cascade",
    })
    .notNull(),

  gmailMessageId: text("gmail_message_id").notNull().unique(),

  from: text("from"),

  to: text("to"),

  subject: text("subject"),

  snippet: text("snippet"),

  body: text("body"),

  isRead: boolean("is_read").default(false).notNull(),

  receivedAt: timestamp("received_at").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: varchar("user_id", { length: 255 }).notNull(),

  title: varchar("title", { length: 255 }).notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),

  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, {
      onDelete: "cascade",
    }),

  role: messageRoleEnum("role").notNull(),

  content: text("content").notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});
