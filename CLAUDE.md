# trell-sync — Architecture & Conventions

## Stack

| Layer | Tool |
|---|---|
| Framework | TanStack Start (React 19, SSR) |
| Router | TanStack Router (file-based) |
| Server state | TanStack Query |
| Forms | TanStack Form + Zod |
| Tables | TanStack Table |
| Client state | Zustand |
| Database | MongoDB Atlas (M0 free tier) via the official `mongodb` driver |
| Auth | [Better Auth](https://better-auth.com) (email/password + admin plugin, MongoDB adapter) |
| Styling | Tailwind CSS v4 + Radix UI |
| Lint / format | Biome |

---

## Feature-Sliced Architecture

This project follows a lightweight version of [Feature-Sliced Design](https://feature-sliced.design/), inspired by [Bulletproof React](https://github.com/alan2207/bulletproof-react).

### Directory layout

```
src/
  features/          # Self-contained feature slices
    auth/
      api/           # Server functions (createServerFn) — data fetching, mutations
      components/    # UI components owned by this feature
      hooks/         # TanStack Query hooks (useMutation / useQuery) wrapping the api/ functions
      model/         # Zustand stores for this feature
      types/         # Feature-local types and Zod schemas
      index.ts       # Public API — the only import surface for other code
    users/           # Admin-only user management (create login, reset password)
    orders/
    sidebar/

  routes/            # TanStack Router file-based routes (thin — compose features, no logic)
  components/        # Shared UI components (FieldError, etc.)
  components/ui/     # shadcn/radix primitives
  lib/               # Server-only modules (*.server.ts: mongo, auth, session, trello) and utils
  types/             # Shared DB types (hand-written; Order = API shape, OrderDoc = stored shape)
  integrations/      # Third-party wiring (TanStack Query provider, etc.)

scripts/             # One-off CLI scripts (e.g. admin:create)
```

### Feature slice rules

**Cross-feature imports are forbidden.** Features must not import directly from each other's internals.

```ts
// ✅ OK — import through the public barrel
import { useAuthStore } from "#/features/auth";

// ❌ Not OK — reaching into another feature's internals
import { useAuthStore } from "#/features/auth/model/authStore";
```

If two features need to share something, move it to `src/shared/` (types, utils) or `src/components/` (UI).

> Biome does not have a `no-restricted-paths` equivalent, so this rule is enforced by code review, not tooling.

### Routes are thin

Route files (`src/routes/`) should only:
- Call `createFileRoute` with `beforeLoad` / `loader`
- Compose feature components in the `component` prop
- Pass loader data down as props

No business logic in route files.

---

## Code style

- **All functions** are `const` arrow functions — React components, hooks, utilities, server functions, everything.
  Use `function` only when technically required (hoisting, `forwardRef` display names).
- **File naming**: camelCase for `.ts`, PascalCase for `.tsx` components. Routes are the exception (TanStack Router convention: `login.tsx`, `__root.tsx`).
- **No comments** unless the *why* is non-obvious. No JSDoc, no block comments.
- **No default exports** — named exports only.

---

## Forms & mutations

- Validation is Zod: pass the schema to `useForm({ validators: { onSubmit: schema } })` and render errors with `<FieldError errors={field.state.meta.errors} />`. Don't hand-roll `safeParse` or error `useState`.
- Server calls go through a `useMutation` hook in the feature's `hooks/`. Destructure what you need (`const { mutateAsync, error, isPending } = useX()`) and use those for pending/error/success UI instead of local state.

---

## Database (MongoDB Atlas M0)

- Connection: `src/lib/mongo.server.ts` exports a single cached `MongoClient`/`db` and typed collection getters. Import only inside server functions.
- Collections:
  - `orders` — `_id` is the order ID (`YYMMDD-NNN`); `trello_id` has a partial unique index (see `ensureIndexes`). Server functions return `Order` (`id`, ISO `created_at`) via `toOrder`.
  - `sms_log` — dedup log for automatic SMS.
  - `order_id_counters` — one doc per day; `nextOrderId()` uses an atomic `$inc` upsert, so IDs are unique across tabs/PCs.
  - `user`, `session`, `account`, `verification` — owned by Better Auth. Don't write to them directly (except `scripts/createAdmin.ts`).
- There is no row-level security. **Every server function must call `requireUser()` (or `requireAdmin()`) from `src/lib/session.server.ts` first** — server functions are public HTTP endpoints.
- M0 limits: 512 MB storage, shared CPU, no backups. Fine for this app; keep documents small and query by indexed fields.

---

## Auth

Invite-only — sign-up is disabled (`emailAndPassword.disableSignUp`). Users and roles live in MongoDB via Better Auth (`src/lib/auth.server.ts`, plugins: `admin`, `tanstackStartCookies`). Roles: `admin` and `user`.

The browser never talks to Better Auth directly; everything goes through server functions that call `auth.api.*`:

1. `signIn` → `auth.api.signInEmail` → Better Auth sets its session cookie (HttpOnly) via `tanstackStartCookies`.
2. Every navigation → root route `beforeLoad` → `getSession` → redirects to `/login` if there is no session. The user (`id`, `email`, `name`, `role`) is placed in route context and mirrored into `useAuthStore`.
3. `signOut` → `auth.api.signOut` clears the session.
4. `/users` (admin only; guarded in `beforeLoad` and again in each server function via `requireAdmin()`).
5. `/account` — any signed-in user can change their own password (`changePassword` → `auth.api.changePassword`, which verifies the current password and revokes other sessions).

### First admin

Run once after setting `.env`:

```bash
pnpm admin:create admin@example.com 'a-strong-password' 'Admin Name'
```

### Adding a user

Sign in as an admin → **Users** → fill in name, email, initial password, role → **Create user**. Give them the initial password; they change it under **Account**. Admins can also reset a user's password from the same page (no email service is configured, so there is no "forgot password" flow).

### Environment

`MONGODB_URI`, `MONGODB_DB`, `BETTER_AUTH_SECRET` (≥32 chars), `BETTER_AUTH_URL` (public origin of the app), plus Trello/SMS keys — see `.env.example`. None are `VITE_`-prefixed; nothing secret reaches the client bundle.
