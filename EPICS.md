# trell-sync — Epics & Tasks

> Rebuilding MinuteCopy Správa zákaziek from a single-file vanilla JS app  
> into a scalable, low-cost TanStack Start + MongoDB Atlas (M0) + Better Auth + Zustand stack.

---

## Stack summary

| Layer | Tool |
|---|---|
| Framework | TanStack Start (React 19, SSR) |
| Router | TanStack Router |
| Server state | TanStack Query |
| Forms | TanStack Form + Zod |
| Tables | TanStack Table |
| Client state / UI | **Zustand** ← still to install |
| Database | **MongoDB Atlas M0** (free tier) |
| Auth | **Better Auth** (email/password + admin plugin, stored in MongoDB) |
| SMS / Trello proxy | TanStack Start server functions |
| Styling | Tailwind CSS v4 + Radix UI |
| Lint / format | Biome |

---

## Epic 1 — Foundation & Setup

Goal: everything compiles, env is typed, MongoDB + Better Auth + Zustand are wired in.

- [x] **1.1** Install Zustand — `pnpm add zustand`
- [x] **1.2** Install the MongoDB driver and Better Auth — `pnpm add mongodb better-auth`
- [x] **1.3** Extend `src/env.ts` — all vars go under `server:` (no `VITE_` prefix):
  - `MONGODB_URI`, `MONGODB_DB`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
  - `TRELLO_KEY`, `TRELLO_TOKEN`, `SMS_API_KEY`
  - ⚠️ Do **not** use `VITE_` for any of these — `VITE_` vars are bundled into the client JS and readable in DevTools. All DB access goes through TanStack Start server functions. The MongoDB URI contains credentials and must never leave the server.
- [x] **1.4** Create `src/lib/mongo.server.ts` — server-only cached `MongoClient`, typed collection getters, index setup, and the atomic order-ID generator; import only inside `createServerFn()` calls
- [x] **1.5** *(No browser DB client)* — the browser never talks to MongoDB or Better Auth directly. Session is a server-set HttpOnly cookie; live updates use TanStack Query refetching (see Epic 4.8).
- [x] **1.6** Add `.env.example` documenting all required vars
- [ ] **1.7** Verify dev server boots cleanly (`pnpm dev`)

---

## Epic 2 — Database Schema

Goal: MongoDB Atlas collections that replace Google Sheets as the source of truth.

- [x] **2.1** `orders` collection — document shape (`OrderDoc` in `src/types/db.ts`):
  ```
  _id            string       // order ID, e.g. "260524-001"
  name           string
  phone          string | null
  email          string | null
  type           string       // velkformat | plocha | textil | darcek | gravir | peciatky | tabulky
  zone           string       // A–G
  shelf          string | null   // e.g. "A-01"
  status         string       // prijata | vyroba | hotovo | vyzdvihnuta
  payment        string | null   // zaplatene | zaloha | treba-zaplatit
  payment_amount number | null
  note           string | null
  trello_id      string | null
  sms_sent       boolean
  source         string | null   // '' | 'email' | 'import'
  created_at     Date
  ```
  Indexes: unique partial on `trello_id` (only when set), `created_at` desc, `status`.
- [x] **2.2** `nextOrderId()` — atomic next-ID generator (`findOneAndUpdate` + `$inc` upsert on `order_id_counters`; replaces Sheets `nextid`, prevents duplicates across multiple tabs/PCs)
- [x] **2.3** Hand-written TypeScript types (`Order` for the API, `OrderDoc` for storage) — no codegen needed
- [x] **2.4** Access control — MongoDB has no RLS, so every server function calls `requireUser()` / `requireAdmin()`; the Atlas user used in `MONGODB_URI` is the only DB credential and stays server-side. No delete endpoint for orders.
- [ ] **2.5** `sms_log` collection for dedup (`order_id`, `sent_at`, `manual`) — collection + index are defined; used by Epic 7
- [ ] **2.6** Atlas setup: create M0 cluster, DB user, and IP allow-list entry for the host (Vercel needs `0.0.0.0/0` on M0 — rely on a strong DB password)

---

## Epic 3 — Authentication

Goal: login wall in front of the whole app, with admin-managed accounts. Invite-only: no public sign-up.

- [x] **3.1** Configure Better Auth (`src/lib/auth.server.ts`) — MongoDB adapter, email/password, `disableSignUp`, `admin` plugin, `tanstackStartCookies` plugin
- [x] **3.2** Server functions `signIn`, `signOut`, `getSession` wrapping `auth.api.*`; the browser never calls Better Auth directly
- [x] **3.3** `/login` route — TanStack Form posting to `signIn`
- [x] **3.4** Auth route guard — root `beforeLoad` calls `getSession` and redirects to `/login` if there is no valid session
- [x] **3.5** Zustand `useAuthStore` — holds only safe user metadata (id, email, name, role); no tokens client-side
- [x] **3.6** Sign-out button in the sidebar → `signOut` → redirect to `/login`
- [ ] **3.7** Session expiry — Better Auth handles expiry/refresh; verify the redirect to `/login` end-to-end against a live Atlas cluster
- [x] **3.8** `pnpm admin:create` script — bootstraps the first admin (no UI can exist before one admin does)
- [x] **3.9** Roles — `admin` / `user`; `requireUser()` / `requireAdmin()` helpers guard every server function
- [x] **3.10** `/users` (admin only) — list users, create a login (name, email, initial password, role), reset a user's password
- [x] **3.11** `/account` — any signed-in user can change their own password (current password required; other sessions are revoked)
- [ ] **3.12** Nice-to-have: force a password change on first login; disable/delete users; email-based password reset (needs an email provider, so deferred to keep costs at zero)

---

## Epic 4 — Order List & Dashboard

Goal: the main screen — stats, search, filter, sortable table.

- [x] **4.1** Create `useOrders` TanStack Query hook — fetches from MongoDB via `getOrders`, sorted newest-first
- [ ] **4.2** Stats grid component — 4 cards: Prijaté / Vo výrobe / Čakajú na vyzdvihnutie / Vyzdvihnuté
- [ ] **4.3** TanStack Table setup for orders — columns: ID, Customer, Type/Zone, Shelf, Created, Status, Actions
- [ ] **4.4** Search input — filter by name, phone, email, order ID (client-side via `@tanstack/match-sorter-utils`)
- [ ] **4.5** Status filter tabs (Všetky / Prijaté / Vo výrobe / Hotové / Vyzdvihnuté)
- [ ] **4.6** Status + payment badges
- [ ] **4.7** Trello-linked indicator (🔗 icon if `trello_id` is set)
- [ ] **4.8** Keep open tabs in sync — MongoDB has no browser-facing realtime channel, and we don't expose the DB to the client. Use TanStack Query `refetchInterval` (e.g. 15–30s) + `refetchOnWindowFocus` on `orders` / `order-stats`. (If true push is ever needed: a server-sent-events route backed by a MongoDB change stream — Atlas M0 supports change streams — but polling is cheaper and simpler on serverless.)

---

## Epic 5 — Order CRUD

Goal: create, view, edit, and mark orders — the core workflow.

- [ ] **5.1** New order route/view (`/orders/new`)
  - TanStack Form + Zod schema
  - Customer fields (name, phone, email)
  - Zone selector (7 zones with color coding)
  - Shelf field (manual or auto-assigned via `nextShelf()` logic)
  - Notes textarea
  - Payment selector (Zaplatené / Záloha + amount / Treba zaplatiť)
  - Trello card name preview + SMS preview (live)
  - Submit → server function calls `nextOrderId()` for the ID, inserts into the `orders` collection
- [ ] **5.2** Auto shelf assignment — `nextShelf(zone)` logic: find lowest unused shelf number in zone among non-vyzdvihnuta orders
- [ ] **5.3** Order detail page (`/orders/$id`)
  - Full info card + zone color panel + shelf panel
  - Trello link if connected
  - Action buttons: Edit, Print, Send SMS, Pickup
- [ ] **5.4** Edit order modal (inline or sheet)
  - All fields editable incl. status
  - On status → `hotovo`: move Trello card + trigger SMS
  - On status → `vyzdvihnuta`: move Trello card to "Odovzdané"
- [ ] **5.5** Pickup confirmation modal — confirm → set `status = 'vyzdvihnuta'` + move Trello card
- [ ] **5.6** Optimistic updates via TanStack Query `useMutation` (UI updates instantly, rolls back on error)

---

## Epic 6 — Trello Integration

Goal: bidirectional sync — create cards from orders, detect card moves, import existing cards.

- [ ] **6.1** TanStack Start server function `trelloApi(path, method, body)` — wraps Trello REST API with key+token from env, replaces `proxy.php?action=trello`
- [ ] **6.2** Trello board init — server function that fetches all lists for the board and returns a `listId` map (cached in TanStack Query)
- [ ] **6.3** Create Trello card on new order — called after DB insert; on success, write `trello_id` back to `orders` row
- [ ] **6.4** Trello polling (30s interval) — server function polls "Výroba", "Hotove zakazky na predajni", "Odovzdané" lists; auto-updates order statuses in MongoDB (other clients pick the change up via Epic 4.8 refetching)
  - Consider: replace with a Trello webhook hitting a TanStack Start server route for true real-time (optional, deferred)
- [ ] **6.5** Import from Trello modal
  - Fetch cards from "Čo treba urobiť" and "ZÁKAZKY PREDAJŇA" lists
  - Filter out already-known `trello_id`s
  - Per-card detail form (name, phone, email, zone) before importing
  - Bulk select + import
- [ ] **6.6** Trello connection status indicator in header (✓ / offline dot)

---

## Epic 7 — SMS Notifications

Goal: safe, dedup-protected SMS when orders go to "hotovo", plus manual send.

- [ ] **7.1** TanStack Start server function `sendSmsSafe(orderId, phone, message, manual)` — checks the `sms_log` collection atomically before sending (e.g. insert guarded by a unique index on `{ order_id, manual: false }`); prevents duplicate sends across multiple PCs
- [ ] **7.2** Auto-SMS trigger — called inside the Trello poll (Epic 6.4) and on manual status change to "hotovo"
- [ ] **7.3** Manual SMS button on order detail — 60s cooldown enforced client-side via Zustand + server-enforced via `sms_log` timestamp check
- [ ] **7.4** SMS message template — `getSMSMessage(order)` pure function, easy to localize

---

## Epic 8 — Print Labels

Goal: same label printing as the old app, as a proper React component.

- [ ] **8.1** Print modal component — opens from list or detail view
- [ ] **8.2** A5 format — 2 labels per page (customer copy + shop copy), with order ID QR or barcode (nice-to-have), name, shelf, zone, type
- [ ] **8.3** Thermal format — 62mm label (Brother/Dymo compatible)
- [ ] **8.4** Live label preview inside modal (switches on format radio)
- [ ] **8.5** Print action — `window.print()` with scoped `@media print` CSS; non-print UI hidden

---

## Epic 9 — Zustand UI State

Goal: all ephemeral UI state lives in Zustand stores so components stay clean.

- [ ] **9.1** `useUIStore` — active filter, search query, current view (list/new/detail)
- [ ] **9.2** `useToastStore` — queue of toasts with type (ok/warn/error) and auto-dismiss
- [ ] **9.3** `useModalStore` — which modal is open + which order it targets (edit, print, pickup, import)
- [ ] **9.4** `useSmsCooldownStore` — per-order cooldown timestamps for manual SMS

---

## Epic 10 — Polish & Production Readiness

Goal: the app is solid, tested, and ready for real shop use.

- [ ] **10.1** Toast notification component (replaces `showToast()` DOM manipulation)
- [ ] **10.2** Loading skeletons on order table + stats
- [ ] **10.3** Error boundaries + empty states ("Žiadne zákazky")
- [ ] **10.4** MinuteCopy design tokens in Tailwind config — `--green: #7AC224`, `--yellow: #F5D000`, `--black: #1a1a1a`, `--cream: #F0EDE4`; DM Sans + Barlow + DM Mono fonts
- [ ] **10.5** Responsive layout (the table needs a mobile-friendly card view for small screens)
- [ ] **10.6** Vitest unit tests — `nextShelf()`, `getSMSMessage()`, order ID format, status badge logic
- [ ] **10.7** Data migration script — one-time import of existing Google Sheets data into MongoDB
- [ ] **10.8** Deployment config (Vercel / Netlify / Fly.io) with env vars (`MONGODB_URI`, `MONGODB_DB`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` = the deployed origin, Trello + SMS keys)
- [ ] **10.9** Atlas M0 housekeeping — M0 has no automated backups; schedule a periodic `mongodump`/export of `orders` and `user`/`account` collections

---

## Suggested order of work

```
Epic 1 (Foundation) 
  → Epic 2 (DB Schema) 
    → Epic 3 (Auth) 
      → Epic 4 (Order List) ← start seeing real data here
        → Epic 5 (CRUD)
          → Epic 6 (Trello) + Epic 7 (SMS) [can run in parallel]
            → Epic 8 (Print) + Epic 9 (Zustand cleanup) [can run in parallel]
              → Epic 10 (Polish)
```

Epics 6 and 7 depend on Epic 5 being done (you need orders in the DB first).  
Epics 8 and 9 are largely independent after Epic 5.

---

## What the old app does that maps 1:1

| Old (proxy.php / localStorage) | New (MongoDB Atlas) |
|---|---|
| `action=nextid` (Sheets counter) | `nextOrderId()` (atomic `$inc` on `order_id_counters`) |
| `action=get` (read all orders) | `ordersCollection().find()` |
| `action=add` | `ordersCollection().insertOne()` |
| `action=update` | `ordersCollection().updateOne()` |
| `action=sms_safe` (dedup check) | Server function + `sms_log` collection |
| `action=trello` (proxy) | TanStack Start server function |
| 30s `setInterval` polling + localStorage | TanStack Query `refetchInterval` → all tabs stay in sync |
| `localStorage('zakazky')` fallback | TanStack Query offline cache |
