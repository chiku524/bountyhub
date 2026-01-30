# BountyHub Tech Stack Review

Review date: January 2025. This document summarizes current stack usage and recommendations for a cleaner, more modern setup.

---

## Optimizations applied (latest pass)

- **Build fixed**: Updated `autoprefixer`, `postcss`, `tailwindcss`, `browserslist`; added `overrides.caniuse-lite` so PostCSS/Tailwind build succeeds.
- **Vite**: Switched to `@vitejs/plugin-react-swc` for faster HMR; config uses `loadEnv()` for env vars and supports `.env` / `.env.local`.
- **Route-level code splitting**: All non-critical routes use `React.lazy()` with a single `<Suspense>` and `LoadingSpinner` fallback; Home stays eager for fast LCP.
- **ESLint 9 + flat config**: Added `eslint.config.js` with TypeScript, React hooks, and react-refresh; `functions/` allowed `any` for Hono context; `scripts/` ignored; empty catch fixed in `confirm-deposit.ts`.
- **prebuild**: Only runs Linux Rollup install on Linux so `npm run build` works on Windows.
- **.env.example**: Added for optional `VITE_*` vars.

### Follow-up (optional next steps) applied

- **Browserslist**: Bumped `caniuse-lite` override to `^1.0.30001766` (running `npx update-browserslist-db@latest` conflicts with the override; remove override temporarily to run it).
- **Lint**: Fixed `no-case-declarations` in `functions/api/governance/index.ts` and `functions/api/integrity/report.ts` (wrapped case bodies in `{}`). Renamed unused catch bindings to `_error` / `_err` / `_e`; added `varsIgnorePattern: '^_'` in ESLint so those are not reported. Fixed empty catch in `confirm-deposit.ts` and no-case-declarations in `src/pages/Community.tsx` and `src/pages/Chat.tsx`.
- **Tailwind v4**: Ran `npx @tailwindcss/upgrade --force`. Migrated to Tailwind CSS v4 (`@import 'tailwindcss'`, `@theme`, `@tailwindcss/postcss`), removed `autoprefixer`, config moved into `src/index.css`. Build verified.
- **React 19**: Not applied; recommend upgrading to React 18.3 first, then running `npx codemod@latest react/19/migration-recipe` and testing (e.g. wallet adapters) before moving to React 19.

---

## Current Stack Summary

| Layer | Technology | Version | Status |
|-------|------------|---------|--------|
| **Frontend** | React | 18.2 | ✅ Solid; React 19 optional |
| **Build** | Vite | 5.1 | ✅ Current |
| **Routing** | react-router-dom | 6.22 | ✅ Current |
| **Styling** | Tailwind CSS | 3.4 | ✅ Solid; Tailwind v4 optional |
| **API** | Hono on Cloudflare Workers | 4.8 | ✅ Current |
| **Database** | Drizzle ORM + Cloudflare D1 (SQLite) | 0.44 | ✅ Correct (drizzle-orm/d1) |
| **Validation** | Zod | 3.25 | ✅ Current |
| **Wallet** | @solana/wallet-adapter-* | Various | ✅ In use |
| **TypeScript** | TS | 5.3 | ✅ Solid; 5.6+ optional |

---

## What’s Already in Good Shape

1. **Vite 5 + ESM** – Modern build, `type: "module"`, path alias `@/`.
2. **Hono + Cloudflare Workers** – Lightweight API, good fit for Workers.
3. **Drizzle + D1** – Single data layer: `drizzle-orm/d1` and SQLite schema; no MongoDB or better-sqlite3 in use.
4. **Strict TypeScript** – `strict: true`, path mapping, separate `tsconfig` for `functions`.
5. **Tailwind** – `darkMode: 'class'`, `@layer` usage in `index.css`.
6. **PWA** – Service worker, manifest, install prompt.

---

## Issues and Cleanups

### 1. Dead Dependencies (recommended: remove)

- **`mongodb`** – Not imported anywhere. All persistence is D1 + Drizzle.
- **`better-sqlite3`** – Not used. D1 is used at runtime; Drizzle Kit uses config for migrations.

**Action:** Remove from `package.json` and run `npm install`.

### 2. Redundant / Confusing Wallet Provider Setup

- **`SolanaWalletProvider`** (custom) wraps `ConnectionProvider` → `WalletProvider` → `WalletModalProvider` and exposes `useSolanaWallet`.
- **`WalletProvider`** (custom) does the same wrap (ConnectionProvider → WalletProvider → WalletModalProvider) with no extra context.
- **`main.tsx`** wraps the app in `SolanaWalletProvider`.
- **`App.tsx`** wraps again in `SolanaWalletProvider` and then `WalletProvider`.

So the Solana adapter stack is mounted twice, and `useSolanaWallet` is only used inside `SolanaWalletProvider`; `TopNav` and `Wallet` use `useWallet` / `useWalletModal` from the adapter directly.

**Action:** Use a single wallet provider tree (e.g. keep `SolanaWalletProvider` only once, inside `App`), and remove the duplicate from `main.tsx` and the redundant `WalletProvider` wrapper so the stack is clear and consistent.

### 3. No ESLint Config

- `package.json` has a `lint` script that runs ESLint, but there is no `.eslintrc.*` or `eslint.config.js`.
- ESLint 9 uses flat config (`eslint.config.js`) by default.

**Action:** Add `eslint.config.js` (or migrate to it) so `npm run lint` applies the intended rules. Prefer flat config if upgrading to ESLint 9.

### 4. Tailwind `line-clamp` Utilities

- `index.css` defines custom `.line-clamp-1`, `.line-clamp-2`, `.line-clamp-3` with `-webkit-line-clamp`.
- Tailwind 3.3+ ships `line-clamp-1`, `line-clamp-2`, `line-clamp-3` out of the box.

**Action:** Prefer Tailwind’s utilities (`line-clamp-1`, etc.) in markup and remove the custom `@layer utilities` line-clamp block from `index.css` to avoid duplication.

### 5. No Route-Level Code Splitting

- All routes are imported synchronously in `App.tsx`; no `React.lazy` or `Suspense`.
- Larger bundles for initial load.

**Action (optional):** Use `React.lazy()` for heavy or secondary routes and wrap with `<Suspense>` for a smaller initial bundle and faster first load.

### 6. Vite Env Handling

- `vite.config.ts` uses `define` to inject `import.meta.env.VITE_*` from `process.env` with fallbacks.
- Works, but `.env` / `.env.local` with `VITE_*` is the standard approach and avoids hardcoding defaults in config.

**Action (optional):** Prefer `.env` and `import.meta.env`; use `define` only where you need build-time overrides or non-env defaults.

### 7. Wrangler Secrets in Repo

- `wrangler.workers.toml` contains `SESSION_SECRET`, API keys, and other sensitive values.
- These should be set via `wrangler secret put` (or env vars) and not committed.

**Action:** Move secrets out of the file; use placeholders or env references and document required secrets in README or DEPLOYMENT.md.

---

## Optional Upgrades (Not Required for “Clean”)

| Item | Current | Optional Upgrade | Notes |
|------|---------|------------------|--------|
| **React** | 18.2 | 19.x | New features (e.g. actions, `use()`); test thoroughly. |
| **Tailwind** | 3.4 | 4.x | Faster builds, CSS-first config; use `npx @tailwindcss/upgrade` if migrating. |
| **ESLint** | 8.x | 9.x | Flat config default; migrate when adding config. |
| **TypeScript** | 5.3 | 5.6+ | Stay on 5.x for better inference and perf. |
| **Vite React plugin** | `@vitejs/plugin-react` | `@vitejs/plugin-react-swc` | Faster refresh; optional. |

---

## Recommended Immediate Actions

1. Remove **mongodb** and **better-sqlite3** from `package.json`.
2. Consolidate to **one wallet provider** and remove duplicate wrapping in `main.tsx` and `App.tsx`.
3. Add **ESLint** config (e.g. `eslint.config.js` with flat config) so `npm run lint` is meaningful.
4. Replace custom **line-clamp** CSS with Tailwind’s **line-clamp-*** utilities and remove the duplicate from `index.css`.
5. Move **secrets** out of `wrangler.workers.toml` into environment/secrets and document them.

After these, the stack is already modern and consistent; the optional upgrades can be done when you’re ready to adopt React 19, Tailwind v4, or ESLint 9.
