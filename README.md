# Cutie de scule · Stația 3 — Usage Tracker

Touchscreen kiosk that tracks the 48 compartments of a workshop toolbox (8 rows × 6 cols).
A user taps a compartment, enters a 4-digit PIN, and records a take (−1) or return (+1).

Built with **Next.js (App Router) + Tailwind + shadcn/ui**, persisted to
**Supabase Postgres** via **Prisma** (driver-adapter runtime). PINs are bcrypt-hashed.

## Stack

- Next.js 16 (App Router, Turbopack)
- Tailwind v4 + shadcn/ui components
- IBM Plex Sans / Mono (via `next/font`)
- Prisma 7 + `@prisma/adapter-pg` against Supabase Postgres
- `bcryptjs` for PIN hashing, HMAC-SHA256 (`PIN_LOOKUP_SECRET`) for indexed lookup
- `sonner` for kiosk toasts

## Setup

1. Copy `.env.example` to `.env` and fill in your Supabase connection strings.
   - `DATABASE_URL` — pooled (port 6543)
   - `DIRECT_URL` — direct (port 5432), used for migrations
   - `PIN_LOOKUP_SECRET` — `openssl rand -hex 32`
2. Install deps and generate the Prisma client:
   ```
   npm install
   npm run db:generate
   ```
3. Push the schema and seed the 48 default items + 2 demo users:
   ```
   npm run db:push
   npm run db:seed
   ```
4. Run the app:
   ```
   npm run dev
   ```

Demo PINs (from the prototype, seeded by `prisma/seed.ts`):
- `1211` — Demo Utilizator (Tehnician)
- `5356` — Admin Operator (Administrator)

## Schema overview

- `items` — 48 rows, one per compartment (`slot_index` = 0..47)
- `users` — name, role, bcrypt `pin_hash`, indexed HMAC `pin_lookup`
- `transactions` — every +1/−1 with item, user, type, qty, session
- `sessions` — kiosk auth sessions (start/end timestamps)
- `audit_log` — admin-side actions
- `settings` — kv store for admin config

## Project layout

```
src/
  app/
    actions.ts          server actions: getItems, verifyKioskPin, recordTransaction
    page.tsx            server entry — loads items, renders <KioskApp>
    layout.tsx          IBM Plex fonts + Sonner toaster
    globals.css         Tailwind + lab-aesthetic CSS vars
  components/
    kiosk/
      kiosk-app.tsx     state machine (grid → auth → tx)
      grid-screen.tsx   header + 8×6 compartment grid + footer clock
      keypad.tsx        PIN entry (touchscreen + keyboard)
      transaction-screen.tsx   greeting + −1/+1 buttons + session tape
      compartment.tsx   single tile w/ tier coloring
  lib/
    prisma.ts           PrismaClient + pg adapter (singleton)
    pin.ts              bcrypt hash + HMAC lookup
    i18n.ts             Romanian copy + slot helpers
    items-seed.ts       48 default items + 2 demo users
prisma/
  schema.prisma
  seed.ts
prisma.config.ts
```

## What's not built yet

- Admin panel (`/admin`) — dashboard, transaction log, charts, user/item management, settings.
  The schema and the auth flow on the kiosk side already support it (`admin-auth` view exists).
- Realtime sync via Supabase Realtime channels (the kiosk polls items every 15s instead).
- Rate-limiting / lockout on repeated PIN failures.
