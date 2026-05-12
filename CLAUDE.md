# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Touchscreen inventory kiosk for a 72-compartment Legris pneumatic-fittings box (Cutie de scule · Stația 1). Romanian UI. Deployed on Vercel against Supabase Postgres. See `HANDOFF.md` for an exhaustive feature & operational rundown — read it before any non-trivial change.

## Commands

```bash
npm run dev                     # Next dev (Turbopack)
npm run build                   # prisma generate && next build
npm start                       # production server
npm run db:generate             # regenerate Prisma client (needed after schema edits + dev restart)
npm run db:push                 # push schema to Supabase (non-destructive when adding nullable columns)
npm run db:seed                 # upsert items + users; preserves transaction history
npm run db:reseed               # tsx prisma/seed.ts --wipe — DELETES transactions, sessions, audit log, items
npx tsc --noEmit                # typecheck without emitting (no test suite exists)
```

There are no tests and no lint script. Typecheck (`npx tsc --noEmit`) and `npm run build` are the only correctness gates.

**Prisma 7 + Turbopack gotcha**: regenerating the client (`npx prisma generate`) is not enough — Turbopack caches the previous client module. Restart `npm run dev` after any schema change.

**`PIN_LOOKUP_SECRET`** must not change after the first seed. It's the HMAC key used to index PIN lookups; changing it invalidates every existing user. Set it in `.env` and never rotate.

## Architecture

### Auth — two distinct flows

1. **Kiosk PIN auth** (`verifyKioskPin` in `src/app/actions.ts`): bcrypt-hashed PIN compared after locating the user by a deterministic HMAC `pinLookup` (so we don't scan every row). On success a `Session` row is created; its id is attached to every subsequent transaction in that "session" (multi-item flow — see below).

2. **Admin auth** (`verifyAdminPin` + `src/lib/admin-session.ts`): same PIN check but requires `role === "Administrator"` and `active === true`. On success an HMAC-signed cookie (`admin_session`, 8 h TTL, httpOnly) is set. `requireAdmin()` in `actions.ts` reads + verifies the cookie at the top of every admin server action; `/admin/page.tsx` redirects to `/admin/login` if the cookie is missing.

The signing secret is the same `PIN_LOOKUP_SECRET`.

### Kiosk state machine (`src/components/kiosk/kiosk-app.tsx`)

A single client component owns the entire kiosk flow:

```
grid  ─tap─►  auth (Keypad)  ─PIN ok─►  tx (TransactionScreen)
                                            │ +1/−1 (records transaction, stays)
                                            │ "Alt articol" → grid, keeps session
                                            │ "Gata"        → endSession, grid
                                            ▼
                                          grid (with session banner)
                                            │ tap any item → tx (no PIN re-prompt)
                                            ▼
                                          (sliding 90s idle → silent endSession)
```

`activeSession` (`{ user, sessionId, tape, expiresAt }`) is held in component state and refreshed (`bumpExpiry`) on every interaction. Items poll fresh on the grid every 15 s.

Two separate timeouts coexist:
- **Per-screen** timeout (`screenTimeoutRef`, ~60 s on tx, ~45 s on keypad) → returns to grid.
- **Session-wide** timeout (`sessionTimeoutRef`, 90 s sliding) → ends the DB session.

### Admin shell (`src/components/admin/admin-shell.tsx`)

Server component at `/admin` calls four server actions in parallel (`getDashboardStats`, `listTransactions`, `listUsers`, `listItemsAdmin`) and passes the results as `initial` props. Each tab then either uses props directly or pulls fresh data via its own server action. **Dashboard and Usage tabs auto-poll every 30 s** (so adjusting stock or doing +1/−1 in the kiosk shows up without navigating). Other tabs refresh only via their explicit reload paths.

### Database (`prisma/schema.prisma`)

- `Item.slotIndex` is a unique 0..71 — the grid position is data, not derived. `slotFor(idx)` in `src/lib/i18n.ts` produces the label (`A1`..`L6`) using `String.fromCharCode(65 + row)` — works for any row count if you change the grid dimensions.
- `Transaction.type` is a Postgres enum `take | return_`. The trailing underscore is real and must appear in both Prisma queries (`where: { type: "return_" }`) and seed/upsert payloads.
- `User.pinHash` (bcrypt) + `User.pinLookup` (HMAC index). Always update both together when changing a PIN — `updateUser` does this.
- `AuditLog` is append-only; never auto-pruned.

### Prisma client (`src/lib/prisma.ts`)

Prisma 7 + `@prisma/adapter-pg`, but wrapped around a **`pg.Pool`** rather than a raw connection string. This is intentional: Supabase's transaction-mode pooler kills idle sockets aggressively, which surfaced as `P1017 Server has closed the connection` errors. The pool has `idleTimeoutMillis: 10_000` and `maxLifetimeSeconds: 300` so sockets are always fresh by the time Supabase's reaper reaches them. Stored on `globalThis` to survive HMR.

If you see `P1017` again, don't go back to the raw adapter — extend the pool config instead.

### Timezone

All date bucketing for charts and the monthly CSV export uses **`Europe/Bucharest`** via `Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Bucharest", … })`. This is critical: localhost runs in local TZ, Vercel runs in UTC. Without explicit Bucharest formatting, day boundaries shift between environments. Don't add new time bucketing without this pattern.

### CSS inlining (`next.config.ts`)

`experimental.inlineCss: true` is **not** a perf optimization — it's a workaround for an antivirus on the kiosk PC that strips `Content-Type: text/css` headers, breaking strict MIME checking. Removing it will break the kiosk in the field. Keep it on unless the AV constraint is gone.

### Item images

`/public/items/<color>.jpeg` (10 files). Slot → file mapping is in `src/lib/slot-images.ts`. The mapping is purely positional (by slot label like `A1`), not by item identity. New layouts may need the mapping table refreshed.

### Seeding semantics

`prisma/seed.ts`:
- Default (`npm run db:seed`) — upserts items by id, upserts users by `pinLookup`. Existing items get their slots shuffled to `1000+i` first so the new layout can claim 0..N without unique-constraint collisions. Users not in `DEFAULT_USERS` get deactivated (history preserved).
- `--wipe` (`npm run db:reseed`) — deletes all transactions, sessions, audit log, and items, then recreates from `DEFAULT_ITEMS`. Use when changing slot count or replacing the entire item set.

`DEFAULT_ITEMS` and `DEFAULT_USERS` live in `src/lib/items-seed.ts`. The same module is imported by both the seed script (Node) and runtime code, so keep it free of Next-only imports.

### Romanian copy

All UI strings live in `src/lib/i18n.ts` as `T`. The data — item names, role names ("Tehnician", "Administrator"), seeded user names — is also Romanian/Hungarian and lives in `items-seed.ts`. There is no i18n framework; adding a second language requires introducing one.

## Things to be careful with

- **`grid-rows-12` in `grid-screen.tsx`** is the only place that hardcodes the row count. If you change the layout to a different row count, update both this class and the row-letter array.
- **CSV exports** use a UTF-8 BOM (`"﻿"`) prefix so Excel renders Romanian diacritics. Keep the BOM when adding new exports.
- **Deleting users** is blocked if they have transactions (FK constraint). `removeUser` returns `{ ok: false, reason: "has-history" }` and the UI tells the admin to deactivate instead.
- **Stock adjustments via `adjustStock`** also write a `Transaction` row (with the admin as actor), so the audit trail reflects who changed stock and by how much. Keep that behavior if you refactor — the Comenzi tab and dashboard analytics depend on it.
