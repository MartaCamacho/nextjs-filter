<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# What this project is

A custom dual-handle `<Range />` component (never `<input type="range">`) with two modes: a continuous
numeric range (`/exercise1`) and a fixed set of allowed values (`/exercise2`). Next.js 16 (App Router) +
TypeScript + Tailwind v4, Vitest for tests. `README.md` holds the full rationale ("why") behind every rule
below — this file is the short, imperative version ("what to do").

# Commands

- `npm run dev` — dev server on **port 8080** (required by the exercise). The port is a CLI flag in
  `package.json`, not `.env`: this Next version boots the HTTP server before env files load, so `PORT` in
  `.env` is a no-op.
- `npm test` (watch) / `npm run test:ci` (single run) — Vitest.
- `npm run lint` — ESLint. `next lint` was removed in this version; call `eslint` directly.
- `npm run build` — production build. **Run it before assuming a change works**: some failures surface
  only at build time, not in `dev` (see data fetching below).
- Get lint + tests + build green before every commit.
- After any `npm install`/`uninstall` (**including `--no-save`**), fully regenerate the lockfile
  (`rm -rf node_modules package-lock.json && npm install`, then verify `rm -rf node_modules && npm ci`) —
  incremental installs on this dep tree can pass locally yet fail `npm ci` in CI.

# Architecture

- **One engine, two domains.** `components/organisms/Range` is the domain-agnostic primitive (drag,
  keyboard, ARIA, collision). It takes a `RangeAdapter` from `lib/adapters.ts`
  (`createContinuousAdapter` / `createDiscreteAdapter`). `NumberRange` / `FixedValuesRange` are thin
  per-mode compositions. New domain behavior goes in an adapter, never inside `Range`.
- **Atomic structure**: `atoms/` (RangeTrack, RangeHandle, RangeLabel) → `molecules/`
  (EditableRangeLabel) → `organisms/` (Range, NumberRange, FixedValuesRange).
- **Collision** (handles can't cross) lives once in `useRange`, clamped against the sibling handle — not
  in the adapter.
- **Mock data**: `lib/data.ts` functions are the source of truth. Server Components call them **directly**
  — never `fetch('/api/...')` your own route handler (self-fetching fails `next build`). The
  `app/api/*/route.ts` handlers are thin `GET` wrappers so the mocked HTTP endpoint stays independently
  curlable.

# Code conventions

- **Arrow functions everywhere**, components included. Assign to a named `const`, then `export default`
  separately — never `export default () => {}` (it loses the display name in DevTools/stack traces).
- **No comments that restate the code.** Comment only a non-obvious *why* (an external gotcha, a subtle
  decision). Well-named code needs no narration.
- **No ecosystem-jargon abbreviations** in names (`cn`, etc.) — name for behavior (`joinClassNames`).
- **TypeScript strict** + `noUncheckedIndexedAccess`: array indexing is `T | undefined`, handle it.
- **Styling: Tailwind utility classes only.** No `style` objects except for genuinely runtime-dynamic
  values that can't be a static class (handle position `%`, fill width).
- **State: plain `useState`** by default. Reach for a store library only when state is genuinely shared
  across unrelated components or must survive navigation — not just because it's available. Keep shared
  rules (e.g. clamping) as plain exported functions, testable without React.
- **Prefer one file** over splitting. Split only for a framework constraint, real multi-consumer reuse, or
  genuine size / mixed concerns.
- A **hook returns ready-to-use values** (spreadable prop objects), not raw pieces the component must
  recompute.

# Testing

Vitest + React Testing Library (`jsdom`). Test where it matters; lean toward too few over too many.

- **Cover thoroughly**: adapter math, `Range` keyboard/ARIA/collision behavior, shared business rules
  (clamping), route handlers (status + JSON shape).
- **Skip deliberately**: trivial presentational atoms, CSS-only hover/cursor states (no real layout in
  `jsdom`), and async Server Component `page.tsx` files — unsupported by Vitest/Jest in this Next version
  (per their own docs), and low-risk here since those pages only `await` data and pass props to
  already-tested components. `next build` is their check.
