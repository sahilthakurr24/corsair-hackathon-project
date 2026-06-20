# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

CalMail: an AI email/calendar assistant. A pnpm + Turborepo monorepo with two actively developed apps:

- `apps/api` — Express API. Wraps the [Corsair SDK](https://corsair.dev) (Gmail/Calendar/GitHub integrations, OAuth, encrypted token storage) and an OpenAI Agents–based chat assistant.
- `apps/web` — Next.js 16 (App Router) frontend. Clerk auth, Tailwind v4, a marketing landing page, a Google-connections page, and a `/chat` workspace.

`apps/docs` and `packages/ui` are unmodified `create-turbo` boilerplate — not part of the product, not wired into `web`. Don't assume changes there matter unless explicitly asked.

`packages/database` holds the Drizzle/Postgres (Neon) schema shared by `api`.

## Commands

Run from the repo root unless noted. Turborepo fans these out per-package.

```sh
pnpm dev              # turbo run dev — api on :4000, web on :3000 (docs on :3001, unused)
pnpm build            # turbo run build
pnpm lint             # turbo run lint — only apps/web (and unused apps/docs) define a lint script
pnpm check-types      # turbo run check-types
pnpm format           # prettier --write on **/*.{ts,tsx,md}
```

Scope to one package with `--filter`, e.g. `pnpm --filter web dev` or `pnpm --filter @repo/api check-types`.

Per-app, when working inside `apps/api` or `apps/web` directly:

```sh
pnpm dev              # apps/api: tsx watch src/index.ts | apps/web: next dev --port 3000
pnpm check-types      # apps/api: tsc --noEmit | apps/web: next typegen && tsc --noEmit
pnpm lint             # apps/web only: eslint --max-warnings 0 (zero-warning policy)
```

There is no test suite yet (`apps/api`'s `test` script is a placeholder that exits 1; `apps/web` has no `test` script).

`packages/database` has its own Drizzle commands: `pnpm --filter @repo/database db:generate` / `db:migrate`.

You can also run the AI agent directly from the CLI for quick checks, bypassing the HTTP layer:

```sh
pnpm --filter @repo/api exec tsx src/agent.ts "summarize my unread emails"
```

## Environment

Env vars are loaded with cascading precedence (later overrides earlier): root `.env` → `packages/.env` → the app's own `apps/{api,web}/.env`. `apps/api/src/env.ts` validates everything through a zod schema (see that file for the full list — `DATABASE_URL`, `CORSAIR_KEK`, `OPENAI_API_KEY`, `CLERK_SECRET_KEY`, `GOOGLE_CLIENT_ID`/`SECRET`, etc.). `apps/web/next.config.js` does its own cascading load for `NEXT_PUBLIC_*` vars.

`WEBHOOK_URL` defaults to an ngrok tunnel — Corsair webhooks need a publicly reachable URL, so local webhook testing requires tunneling `apps/api`'s port.

## Architecture

### Corsair is the integration layer

`apps/api/src/server/corsair.ts` creates a single `corsair` instance (`gmail`, `googlecalendar`, `github` plugins, `multiTenancy: true`) backed by a raw `pg.Pool`. **Clerk's `userId` is used directly as the Corsair tenant ID** — `corsairForTenant(tenantId)` / `corsair.withTenant(tenantId)` scope every Corsair call to one user.

`ensureGoogleIntegration` bootstraps the `corsair_integrations` row (encrypting Google client id/secret with a per-integration DEK, itself encrypted with `CORSAIR_KEK`) using raw SQL with an advisory lock — this runs lazily via `setupCorsairIntegrations()` before any OAuth flow, not as a migration.

Note the two parallel ways data gets to Postgres: `server/corsair.ts` writes integration bootstrap rows via raw `pg` queries, while `services/google-connection` and `services/user` read/write the _same_ `corsair_*` tables (and app tables like `users`, `connected_accounts`) through Drizzle (`@repo/database`). Both point at the same physical tables — the schema in `packages/database/src/db/schema.ts` mirrors what the Corsair SDK expects.

When adding a new Corsair-backed feature (see `controller/gmail/index.ts` for the pattern): get `userId` from Clerk via `getAuth(req)`, then call `corsair.withTenant(userId).{plugin}.api.{operation}(...)`. Errors should be forwarded via `next(error)` to the shared `middleware/error` handler — don't swallow them in a local catch (it strips status codes and logging).

### AI agent (`apps/api/src/agent.ts`)

Uses `@openai/agents` (model `gpt-4o-mini`) with tools built by `@corsair-dev/mcp`'s `OpenAIAgentsProvider`. That provider exposes generic Corsair-discovery tools (`list_operations`, `get_schema`, `run_script`) rather than one hardcoded tool per Gmail/Calendar operation — the agent is instructed to discover exact operation names at runtime instead of assuming them. The one hand-written tool, `send_professional_gmail`, exists because sending mail requires building a base64url RFC 2822 MIME message, which the generic `gmail.messages.send` operation won't do for you.

The instructions string in `agent.ts` is long and opinionated (clarification policy, Gmail/Calendar argument shapes, no-placeholder-text rules for sent emails, etc.) — if behavior needs to change, that's almost always the place to edit, not the tool code.

### Webhooks → SSE

`POST /webhooks` (`controller/corsair-webhook`) runs Corsair's `processWebhook`, then pushes the result to the browser over SSE via `lib/sse.ts`. SSE client registration (`addClient`/`removeClient`) is an **in-memory `Map` keyed by userId, single-process only** — it won't work across multiple API instances without changes.

### Web app routing

`apps/web/app/chat` is a route group with its own `layout.tsx`: it owns the Clerk auth gate, the sidebar, and a `ChatShellProvider` context (`_components/chat-shell.tsx`) exposing sidebar-open state and a "new chat" signal to nested pages. Sibling routes (`/chat`, `/chat/inbox`, `/chat/calendar`, `/chat/drafts`, `/chat/tasks`, `/chat/contacts`) each consume that context via `useChatShell()` rather than duplicating sidebar/auth logic. `/chat/inbox` is the only one wired to real data (fetches `GET /gmail/get-messages` with the Clerk bearer token on mount); the rest render `_components/coming-soon.tsx`.

Styling is Tailwind v4 throughout (`@theme` block in `app/globals.css` defines the color palette as `--color-*` tokens, e.g. `bg-brand-blue`). There are no CSS Modules left in `apps/web`. Two things worth remembering if you touch global CSS: Tailwind v4 wraps its own rules in cascade layers, so any custom rule added outside `@layer base`/`@layer utilities` in `globals.css` will silently outrank _all_ Tailwind utilities for the properties it touches (this happened once with a stray `* { margin: 0; padding: 0 }`); and arbitrary gradient angles need `bg-linear-[<deg>]`, not `bg-gradient-to-[<deg>]` (only the eight named directions like `bg-gradient-to-br` are valid there).
