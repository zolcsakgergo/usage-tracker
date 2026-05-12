# Handoff — Cutie de scule · Stația 1

Touchscreen kiosk + admin panel for tracking 72 pneumatic-fitting compartments (Legris).
Romanian UI. Hosted on Vercel, data on Supabase Postgres.

---

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**, **Tailwind v4**, **shadcn/ui** components, **sonner** toasts
- **Prisma 7** with the `@prisma/adapter-pg` driver adapter (uses a `pg.Pool`)
- **Supabase Postgres** (pooled connection on port 6543 for runtime, direct 5432 for migrations)
- **bcryptjs** for PIN hashes + HMAC-SHA256 lookup index (so we can find a user by PIN without scanning every row)
- **IBM Plex Sans / Mono** via `next/font`

CSS is **inlined** into the HTML (`experimental.inlineCss: true` in `next.config.ts`) as a workaround for client-side antivirus / HTTPS-scanning proxies that strip `Content-Type: text/css` on hashed bundle files and break strict MIME checking on the kiosk PC. Do not remove unless you've confirmed the kiosk's AV no longer interferes.

---

## What's built

### Kiosk (`/`)

- **12 rows × 6 columns** = 72 compartments. Phone view collapses to a 3-column scrollable list, axis labels hidden.
- **Color-tinted tiles by tier**:
  - OK (above low threshold) — green
  - Aproape gol (≤ low threshold, > 0) — amber
  - Gol (= 0) — red
- **Compartment card** shows slot label (`A1`–`L6`), name, Legris `code` (small mono line), `count` + unit, and a per-slot color thumbnail from `/public/items/<color>.jpeg`.
- **Search bar** above the grid — filters by name, code, or slot (`a1`, `10`, `M5`, `puc-04`).
- **Multi-item session**: after a successful PIN, the user stays signed in for 90 s of sliding inactivity. The transaction screen has **Alt articol** (back to grid, keep session) and **Gata** (sign out). The grid shows a "Conectat: NAME · Auto-deconectare în Ns" banner plus a manual **Ieși** button.
- **Transaction tape** is fixed-height (6 rows) so the −1/+1 and Done buttons never shift as transactions accumulate.
- Auto-refresh of items every 15 s while on the grid.

### Admin (`/admin`)

Cookie-based auth — only users with `role = "Administrator"` can sign in. Currently:
- **ZOLCSAK SANDOR** (PIN `12`)
- **ERNI ZSOLT HERBERT** (PIN `1991`)

Seven tabs:

1. **Tablou de bord** — KPIs, 14-day stacked bar chart (Bucharest-local bucketing, hover for daily counts), top users / top items (14 d), low-stock alerts. Auto-refreshes every 30 s + manual refresh button.
2. **Jurnal** — searchable transaction log with filters (type, item, user, date range), CSV export.
3. **Utilizare** — 14-day summary + top items/users bars. Includes the **monthly CSV export** at the top (picks any month from the last 12, produces a CSV with a usage summary + transaction history including code & accounting code).
4. **Comenzi** — reorder suggestion engine. For each item, computes avg daily takes over a configurable window (default 30 d), days of stock remaining, suggested order quantity to cover the next N days, urgency badge. Sorted by urgency. CSV export.
5. **Utilizatori** — list of all users with 7-day activity, add/edit/deactivate/delete. Deletion is blocked if the user has transaction history (deactivate instead).
6. **Articole** — list of all 72 items with editable name, code, `accounting code` (admin-only), unit, low threshold, and one-click stock adjustment (logged as an admin transaction).
7. **Setări** — JSON backup download (PIN hashes are scrubbed), factory reset (wipes transactions + sessions, restores `count = startCount` for every item).

### Data model (Prisma)

- `Item` — `id` (slug), `name`, `code` (Legris), `accountingCode`, `unit`, `count`, `startCount`, `lowThreshold`, `slotIndex` (unique, 0–71)
- `User` — `id` (cuid), `name`, `role`, `pinHash` (bcrypt), `pinLookup` (HMAC index, unique), `active`
- `Transaction` — `ts`, `itemId`, `userId`, `type` (`take` | `return_`), `qty`, `sessionId`
- `Session` — kiosk auth sessions (start/end timestamps)
- `AuditLog` — admin-side actions (`user.create`, `item.update`, `settings.factory-reset`, etc.)
- `Setting` — kv store

---

## Setup

```bash
# install
npm install            # postinstall runs `prisma generate`

# env (copy from .env.example)
DATABASE_URL=postgresql://...:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://...:5432/postgres
PIN_LOOKUP_SECRET=<openssl rand -hex 32>      # do NOT change after first seed

# schema & seed
npm run db:push                # applies schema to Supabase
npm run db:seed                # upsert items + users (preserves history)
npm run db:reseed              # wipe everything + reseed (use this if changing layout)

# run
npm run dev                    # http://localhost:3000
npm run build && npm start
```

Vercel build runs `prisma generate && next build` (configured in `package.json`).

---

## Seeded users (PINs)

| PIN  | Name                       | Role          |
|------|----------------------------|---------------|
| 10   | VIRAG GHEORGHE             | Tehnician     |
| 12   | ZOLCSAK SANDOR             | Administrator |
| 124  | BESENYODI FERENC CSABA     | Tehnician     |
| 249  | PUSKAS KAROLY              | Tehnician     |
| 562  | INCZE FODOR SANDOR ISTVAN  | Tehnician     |
| 653  | DRAGOS VASILE              | Tehnician     |
| 674  | CSOKASI TAMAS GABOR        | Tehnician     |
| 956  | CORDIS FLORIN GHEORGHE     | Tehnician     |
| 1280 | TURCAS IOAN MARCEL         | Tehnician     |
| 1365 | SOMI ZOLTAN ATTILA         | Tehnician     |
| 1376 | KURTI CSABA                | Tehnician     |
| 1481 | GERGELY NORBERT            | Tehnician     |
| 1816 | BOTOS LORAND               | Tehnician     |
| 1830 | MAJER ALFRED ADRIAN        | Tehnician     |
| 1985 | NAGY NICOLAE ROBERT        | Tehnician     |
| 1991 | ERNI ZSOLT HERBERT         | Administrator |
| 2024 | NAGY TAMAS ISTVAN          | Tehnician     |
| 2045 | KOVACS ADALBERT            | Tehnician     |
| 2053 | LUKACS JANOS LORANT        | Tehnician     |
| 2072 | PUSKAS KAROLY PAL          | Tehnician     |
| 2087 | MARASESCU VIRGIL ION       | Tehnician     |

Manage users at **/admin → Utilizatori**. PINs accept 2–8 digits.

---

## Item images

Static jpegs in `public/items/`, mapped by slot in `src/lib/slot-images.ts`:

| File             | Slots                                              |
|------------------|----------------------------------------------------|
| yellow.jpeg      | A1–A5, B1–B5, C2–C5                                |
| blue.jpeg        | C1, D1–D5, E1–E5                                   |
| darkgreen.jpeg   | F1–F5                                              |
| orange.jpeg      | G1–G5                                              |
| lightgreen.jpeg  | H1–H5, I1–I5, J1–J5                                |
| brown.jpeg       | K1–K5                                              |
| red.jpeg         | L1–L5                                              |
| lightblue.jpeg   | A6, B6, C6, D6                                     |
| black.jpeg       | J6, K6, L6                                         |
| grey.jpeg        | E6, F6, G6, H6, I6                                 |

Drop replacements into `public/items/` and redeploy — no DB change.

---

## Operational notes / gotchas

- **`PIN_LOOKUP_SECRET` must not change after seeding.** It's an HMAC key used to index PIN lookups. Changing it invalidates every existing user.
- **CSS is inlined**, see `next.config.ts`. If switching to external CSS, expect MIME issues on the kiosk PC behind the corporate AV.
- **Slot 46 / J1 has the duplicate "6 Teu 3/8" label** carried over from the source spreadsheet. IDs are `teu-06-38-j1` and `teu-06-38`. Admin can rename or merge later via Articole.
- **All bucketing uses `Europe/Bucharest` timezone** (charts, monthly CSV export) so dev (local TZ) and prod (UTC) produce identical days. Don't change this without aligning with the user.
- **Codes (`code`) and accounting codes (`accountingCode`)** are nullable. New items default to `null`; admin fills them in via Articole.
- **Prisma uses a `pg.Pool`** in `src/lib/prisma.ts` with short idle timeouts and a 5-minute max lifetime to avoid Supabase's `P1017 Server has closed the connection` errors.
- **Audit log is never auto-pruned.** Keep an eye on the table size if usage grows.
- **Factory Reset** sets every item back to `startCount` (currently 0 for all 72). Use the SQL fallback `delete from transactions; delete from sessions; delete from audit_log;` if you want to keep current stock.

---

## TODO / not built

- **Reorder workflow beyond suggestions**: today's "Comenzi" tab shows what to order but doesn't track purchase orders. A `PurchaseOrder` table with status (`draft` / `placed` / `received`) + a "mark as received → auto-restock" flow would close the loop.
- **PWA / offline queue**: kiosk currently requires network for every transaction. Queue in IndexedDB and replay on reconnect would make it resilient.
- **Printable compartment labels**: PDF per slot with QR linking to that compartment in the kiosk.
- **Per-item supplier notes** field (admin only) — currently no place to record reorder URLs / MOQs.
- **Admin email digest** (weekly summary, low-stock alerts) — Supabase has SMTP via Resend integration if needed.
- **Item images per item, not per slot color** — the per-slot color scheme is a stopgap; uploading a real photo per item via Supabase Storage would be more useful long-term.
- **Heartbeat / kiosk status** in admin (write `last_seen_at` from the kiosk every 60 s, render green/red dot) — useful if more than one kiosk is deployed.
- **Per-row supplier links / reduction items**: the 4 Legris reductions (`PG 06-04`, etc.) listed in the source spreadsheet are *not* in the DB — they don't have a sertar. Add as off-grid items if needed.
- **Tests**: there are none. Setting up Playwright for the kiosk flow + a few Prisma integration tests would help future changes.

---

## Repo layout

```
src/
  app/
    page.tsx                    kiosk entry (server)
    actions.ts                  all server actions (kiosk + admin)
    admin/page.tsx              admin shell (server)
    admin/login/page.tsx        admin keypad route
    layout.tsx, globals.css
  components/
    kiosk/
      kiosk-app.tsx             state machine (grid → auth → tx)
      grid-screen.tsx           header + search + 12×6 compartment grid + session banner
      keypad.tsx                PIN entry (touchscreen + keyboard)
      transaction-screen.tsx    +1/−1 + fixed session tape
      compartment.tsx           single tile (color-tinted by tier)
      spinner.tsx               fullscreen spinner used by `loading.tsx` files
    admin/
      admin-shell.tsx           7-tab admin layout
      admin-login.tsx
      tabs/
        dashboard-tab.tsx
        transactions-tab.tsx
        usage-tab.tsx           (also hosts the monthly CSV exporter)
        orders-tab.tsx          reorder suggestions
        users-tab.tsx
        items-tab.tsx
        settings-tab.tsx
  lib/
    prisma.ts                   Prisma client + pg Pool singleton
    pin.ts                      bcrypt hash + HMAC lookup
    admin-session.ts            signed admin cookie utilities
    i18n.ts                     Romanian strings + slotFor()
    items-seed.ts               72 default items + 21 default users
    slot-images.ts              slot → image file mapping
prisma/
  schema.prisma
  seed.ts                       supports `--wipe` for full reseed
prisma.config.ts
next.config.ts                  inlineCss = true (AV workaround)
public/items/<color>.jpeg       compartment thumbnails
```
