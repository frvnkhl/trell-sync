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
| Backend / DB | Supabase (Postgres + Auth + Realtime) |
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
      model/         # Zustand stores for this feature
      types/         # Feature-local types and Zod schemas
      index.ts       # Public API — the only import surface for other code
    orders/          # (future)
    sidebar/         # (future)

  routes/            # TanStack Router file-based routes (thin — compose features, no logic)
  components/        # Shared UI components (AppHeader, etc.)
  components/ui/     # shadcn/radix primitives
  lib/               # Shared utilities (supabase clients, utils)
  types/             # Shared DB types (generated + hand-written)
  integrations/      # Third-party wiring (TanStack Query provider, etc.)
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

## Auth (Epic 3)

Invite-only — no signup flow. Users are created manually in the Supabase dashboard (Auth > Users > Invite user).

The browser never holds a Supabase key. Auth flow:

1. `POST /login` → `signIn` server function → Supabase validates credentials → sets `sb-access-token` + `sb-refresh-token` as `HttpOnly` cookies.
2. Every navigation → root route `beforeLoad` → `getSession` server function reads cookies, calls `supabase.auth.setSession()` to validate/refresh → redirects to `/login` if invalid.
3. `signOut` server function clears both cookies and calls `supabase.auth.signOut()`.

Cookie rotation happens automatically in `getSession` when Supabase issues a new access token.

### Adding a user

Go to [Supabase Dashboard](https://supabase.com) → your project → Authentication → Users → **Invite user**. Enter the email; they receive a magic link to set their password.
