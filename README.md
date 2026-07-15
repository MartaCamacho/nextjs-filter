# Range component

A custom dual-handle range slider (`<Range />`), built from scratch (no `<input type="range">`) in two
modes:

- **`/exercise1`** — normal range between a server-provided minimum and maximum, with click-to-edit
  labels.
- **`/exercise2`** — range constrained to a fixed set of allowed values, with static labels.

Built with Next.js 16 (App Router) and TypeScript on top of a stock `create-next-app` scaffold. This repo
targets **Next.js 16.2.10** specifically, which has real breaking changes vs. older Next.js — see
`node_modules/next/dist/docs/` for this version's own documentation before assuming an API from memory.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080). The dev/start scripts pin port 8080 via the Next.js
CLI flag (`next dev -p 8080`) — in this Next.js version `PORT` can't be set through `.env`, since the HTTP
server boots before env files are loaded.

## Testing

```bash
npm test        # watch mode
npm run test:ci # single run, used in CI
```

Vitest + React Testing Library (`jsdom` environment). See the "Testing scope" section below (filled in as
the interactive components land) for what's covered deliberately vs. skipped, and why.

## Other scripts

```bash
npm run lint   # ESLint (eslint-config-next, includes jsx-a11y)
npm run build  # production build
npm run start  # serve the production build on port 8080
```

CI (`.github/workflows/ci.yml`) runs lint, tests, and build on every PR and push to `main`.

## Project structure

```
app/
  page.tsx                — landing linking to both exercises
  exercise1/, exercise2/   — one route per usage mode
  api/                     — mocked HTTP services backing each exercise

components/
  atoms/       — smallest building blocks (track, handle, static label)
  molecules/   — one atom + local behavior (click-to-edit label)
  organisms/   — feature-complete pieces (the generic Slider engine,
                 and the two exercise-specific compositions)

lib/           — adapters, stores, mock data functions, format/utils helpers
types/         — shared TypeScript types
```

## Architecture decisions

This section grows with each chunk of work; it's the running answer to "why did you build it this way,"
not just "what did you build."

### Tooling

- **Vitest over Jest**: less indirection (no `next/jest` transform wrapper needed), faster, and this
  project barely touches the things `next/jest`'s auto-mocking exists for (CSS Modules, image imports,
  `next/font` outside `layout.tsx`, which isn't under test).
- **`noUncheckedIndexedAccess`** enabled in `tsconfig.json`: without it, indexing into the fixed values
  array (`values[index]`) with an out-of-range index silently types as a valid `number` instead of
  `number | undefined`, so a bug there would only surface at runtime.
- **Port 8080** is set via CLI flag in `package.json` scripts, not `next.config.ts` or `.env` — this
  version of Next.js boots its HTTP server before loading env files, so `PORT` in `.env` is a no-op (per
  the CLI reference doc).

### The Slider engine: one adapter interface, two domains

`/exercise1` and `/exercise2` are the same interaction — drag two handles, keyboard-step them, don't let
them cross — over two different domains: a continuous range and a fixed list of values. Rather than build
two sliders, `components/organisms/Slider` implements the interaction once (drag, keyboard, ARIA,
collision) and takes a `RangeAdapter` that answers the only questions that actually differ between the two
domains: what are the bounds, how does a value map to a track position, and what's the next/previous valid
value.

- `createContinuousAdapter(min, max, step)` — plain percentage math.
- `createDiscreteAdapter(values)` — spaces allowed values **evenly by index**, not proportionally by
  magnitude. With `[1.99, 5.99, 10.99, 30.99, 50.99, 70.99]` the gaps are 4/5/20/20/20; magnitude-based
  spacing would cram the first three options into ~13% of the track — tiny, hard-to-hit targets. Pinned in
  a test: `valueToPercent(30.99) === 60` (index 3 of 5), not ~48.9%.

The honest reason this is worth it isn't "saves memory" (materializing an array for `{min:1,max:100}`
costs nothing) — it's that collision-prevention, keyboard handling, and ARIA wiring are hard to get right
and are exactly the same regardless of domain, so they get written and tested once. `Slider` itself has no
idea whether it's continuous or discrete.

Collision (handles can't cross) is deliberately **not** part of the adapter — it's resolved once in
`useDualSlider` via a plain clamp against the sibling handle's current value. Home/End reuse that same
clamp by always passing the domain bound (`adapter.min`/`adapter.max`); since the clamp is already
sibling-aware, "jump to the domain edge" and "jump to the sibling" fall out of the same code path instead
of needing a special case.

### Testing scope so far

Adapter math and `Slider`'s keyboard/ARIA/collision behavior are covered thoroughly (both domains). Drag
is covered by mechanics-level tests with a mocked `getBoundingClientRect`, but keyboard is the primary
interaction-test surface — no real layout in `jsdom`, so keyboard needs no mocking and is less brittle.
Not tested: hover-enlarge and the `cursor: grab`/`grabbing` states, since they're pure CSS with no
observable effect without real layout/paint.

### Mocked data: functions first, Route Handlers as a thin wrapper

`lib/data.ts` has both mock services — `getNumberRange` and `getFixedRangeValues` — in one file. They
started out as two files plus a separate shared-delay file; consolidated because the combined logic is
about twenty lines, and three files (plus two near-identical route test files) for that was more
navigation than the code warranted. Each `app/api/*/route.ts` is a thin `GET` wrapper around one of these
functions — a real, independently curlable HTTP endpoint, which is what the exercise asks for — and the
two route tests live together in one `app/api/routes.test.ts` for the same reason. The two
`app/api/*/route.ts` files themselves can't merge: Next.js's App Router requires one `route.ts` per URL
segment, and the exported function must be literally named after the HTTP verb (`GET`) for the framework
to wire it up — not a naming choice, a routing convention.

Server Components (landing in the next two chunks) call the `lib/data` functions **directly**, not through
`fetch('/api/...')`.

This wasn't the original plan — self-fetching the Route Handler from the Server Component was, since it
seemed like the more literal way to satisfy "provide a mocked HTTP service ... to be used in the
component." It doesn't work in this Next.js version: prerendering a Server Component that `fetch()`es its
own Route Handler fails `next build`, because there's no server listening for that request at build time
(there's no such problem in `next dev`, which is exactly what makes this easy to ship without noticing).
Calling the function directly avoids the round trip entirely — it's also faster, which serves the
"as much server-side as possible" goal better than the HTTP round trip would have.

Tried and reverted: marking these functions with `import "server-only"` to fail the build if a client
component ever imported them by mistake. It doesn't do a runtime check — it relies on the bundler
resolving a `react-server` export condition, which Next.js's bundler sets and Vitest's resolver doesn't,
so importing anything through it inside a Vitest test throws unconditionally, regardless of test
environment. Given these functions hold no secrets and do nothing unsafe to run in a browser, the
protection wasn't worth losing the ability to unit test the Route Handlers directly.

More sections (state management and the deliberate testing boundary around async Server Components) land
as the corresponding code does.
