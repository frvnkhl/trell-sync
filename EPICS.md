# trell-sync — Epics & Tasks

> Rebuilding MinuteCopy Správa zákaziek from a single-file vanilla JS app  
> into a scalable TanStack Start + Supabase + Auth + Zustand stack.

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
| Backend / DB | **Supabase** (Postgres + Auth + Realtime) |
| SMS / Trello proxy | TanStack Start server functions |
| Styling | Tailwind CSS v4 + Radix UI |
| Lint / format | Biome |

---

## Epic 1 — Foundation & Setup

Goal: everything compiles, env is typed, Supabase + Zustand are wired in.

- [x] **1.1** Install Zustand — `pnpm add zustand`
- [x] **1.2** Install Supabase JS client — `pnpm add @supabase/supabase-js`
- [x] **1.3** Extend `src/env.ts` — all Supabase vars go under `server:` (no `VITE_` prefix):
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - `TRELLO_KEY`, `TRELLO_TOKEN`, `SMS_API_KEY`
  - ⚠️ Do **not** use `VITE_` for Supabase keys — `VITE_` vars are bundled into the client JS and readable in DevTools. All DB access goes through TanStack Start server functions, so the browser never needs these keys directly. The anon key is technically safe to expose (RLS enforces access), but there's no reason to in an SSR app. The service role key must never leave the server.
- [x] **1.4** Create `src/lib/supabase.server.ts` — server-only Supabase client using `SUPABASE_URL` + `SUPABASE_ANON_KEY` (or service role key for admin ops); import only inside `createServerFn()` calls
- [x] **1.5** *(Skip a separate browser client)* — no direct Supabase calls from the browser. Auth session is managed via cookies set by the server; Realtime subscriptions are the one exception (see Epic 9).
- [ ] **1.6** Add `.env.local` template (`.env.example`) documenting all required vars
- [ ] **1.7** Verify dev server boots cleanly (`pnpm dev`)

---

## Epic 2 — Database Schema

Goal: Supabase Postgres schema that replaces Google Sheets as the source of truth.

- [ ] **2.1** Create `orders` table migration:
  ```sql
  id          text primary key,          -- e.g. "260524-001"
  name        text not null,
  phone       text,
  email       text,
  type        text not null,             -- velkformat | plocha | textil | darcek | gravir | peciatky | tabulky
  zone        text not null,             -- A–G
  shelf       text,                      -- e.g. "A-01"
  status      text not null default 'prijata',   -- prijata | vyroba | hotovo | vyzdvihnuta
  payment     text,                      -- zaplatene | zaloha | treba-zaplatit
  payment_amount numeric,
  note        text,
  trello_id   text,
  sms_sent    boolean default false,
  source      text,                      -- '' | 'email' | 'import'
  created_at  timestamptz default now()
  ```
- [ ] **2.2** Create `order_id_seq` Postgres function — atomic next-ID generator (replaces Sheets `nextid` action, prevents duplicates across multiple tabs/PCs)
- [ ] **2.3** Generate TypeScript types from Supabase schema (`supabase gen types typescript`)
- [ ] **2.4** Write RLS policies — authenticated users can read/insert/update; no deletes from client
- [ ] **2.5** Create `sms_log` table for dedup (order_id, sent_at, manual) — replaces the Sheets-based `smsSent` flag with proper server-side atomicity

---

## Epic 3 — Authentication

Goal: login wall in front of the whole app. This is an internal tool so simple email+password is fine.

- [ ] **3.1** Enable Supabase Auth (email/password provider, disable email confirmation for internal use)
- [ ] **3.2** Create server functions for auth — `signIn(email, password)` and `signOut()` as `createServerFn()` calls; they call Supabase server-side and set a secure `HttpOnly` session cookie — the browser never touches the Supabase key
- [ ] **3.3** Create `/login` route — TanStack Form posting to the `signIn` server function; on success the server sets the cookie and redirects to `/`
- [ ] **3.4** Add auth route guard — TanStack Router `beforeLoad` on the root route reads the session cookie server-side and redirects to `/login` if missing or expired
- [ ] **3.5** Create Zustand `useAuthStore` — holds only the safe user metadata (id, email) hydrated from the server loader; no keys or tokens stored client-side
- [ ] **3.6** Add logout button in header → calls `signOut` server function → clears cookie → redirect to `/login`
- [ ] **3.7** Handle session expiry — server function checks token validity on every request; expired sessions redirect to login

---

## Epic 4 — Order List & Dashboard

Goal: the main screen — stats, search, filter, sortable table.

- [ ] **4.1** Create `useOrders` TanStack Query hook — fetches from Supabase, sorted newest-first
- [ ] **4.2** Stats grid component — 4 cards: Prijaté / Vo výrobe / Čakajú na vyzdvihnutie / Vyzdvihnuté
- [ ] **4.3** TanStack Table setup for orders — columns: ID, Customer, Type/Zone, Shelf, Created, Status, Actions
- [ ] **4.4** Search input — filter by name, phone, email, order ID (client-side via `@tanstack/match-sorter-utils`)
- [ ] **4.5** Status filter tabs (Všetky / Prijaté / Vo výrobe / Hotové / Vyzdvihnuté)
- [ ] **4.6** Status + payment badges
- [ ] **4.7** Trello-linked indicator (🔗 icon if `trello_id` is set)
- [ ] **4.8** Supabase Realtime subscription — the one place where a thin browser-side Supabase client is justified (Realtime uses a WebSocket, not a REST call). Create a minimal client using only `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` scoped **only** to this Realtime hook; it listens for `INSERT/UPDATE` on `orders` and calls `queryClient.invalidateQueries()` so all open tabs stay in sync. RLS still protects the data — the anon key alone can't bypass it.

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
  - Submit → calls `order_id_seq` server function for ID, inserts to Supabase
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
- [ ] **6.4** Trello polling (30s interval) — server function polls "Výroba", "Hotove zakazky na predajni", "Odovzdané" lists; auto-updates order statuses in Supabase (triggers Realtime → all clients update)
  - Consider: replace with a Trello webhook calling a Supabase Edge Function for true real-time (optional, deferred)
- [ ] **6.5** Import from Trello modal
  - Fetch cards from "Čo treba urobiť" and "ZÁKAZKY PREDAJŇA" lists
  - Filter out already-known `trello_id`s
  - Per-card detail form (name, phone, email, zone) before importing
  - Bulk select + import
- [ ] **6.6** Trello connection status indicator in header (✓ / offline dot)

---

## Epic 7 — SMS Notifications

Goal: safe, dedup-protected SMS when orders go to "hotovo", plus manual send.

- [ ] **7.1** TanStack Start server function `sendSmsSafe(orderId, phone, message, manual)` — checks `sms_log` table atomically before sending; prevents duplicate sends across multiple PCs
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
- [ ] **10.7** Data migration script — one-time import of existing Google Sheets data into Supabase
- [ ] **10.8** Deployment config (Vercel / Netlify / Fly.io) with env vars

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

| Old (proxy.php / localStorage) | New (Supabase) |
|---|---|
| `action=nextid` (Sheets counter) | `order_id_seq` Postgres function |
| `action=get` (read all orders) | `supabase.from('orders').select()` |
| `action=add` | `supabase.from('orders').insert()` |
| `action=update` | `supabase.from('orders').update()` |
| `action=sms_safe` (dedup check) | Server function + `sms_log` table |
| `action=trello` (proxy) | TanStack Start server function |
| 30s `setInterval` polling + localStorage | Supabase Realtime → all tabs sync instantly |
| `localStorage('zakazky')` fallback | TanStack Query offline cache |
