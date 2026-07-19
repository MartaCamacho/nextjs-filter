# Range component

A custom dual-handle range slider (`<Range />`), built from scratch (no `<input type="range">`) in two
modes:

- **`/exercise1`** — normal range between a server-provided minimum and maximum, with click-to-edit
  labels.
- **`/exercise2`** — range constrained to a fixed set of allowed values, with static labels.

**Live demo:** https://nextjs-filter-blue.vercel.app — [`/exercise1`](https://nextjs-filter-blue.vercel.app/exercise1)
(normal range) and [`/exercise2`](https://nextjs-filter-blue.vercel.app/exercise2) (fixed values range),
deployed on Vercel.

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

Vitest + React Testing Library (`jsdom` environment). See "Testing scope so far" and "Where this landed"
below for what's covered deliberately vs. skipped, and why.

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
  (exercises)/            — route group (no URL segment): shared layout + loading
    exercise1/, exercise2/ — one route per usage mode (URLs stay /exercise1, /exercise2)
  api/                     — mocked HTTP services backing each exercise

components/
  atoms/       — smallest building blocks (track, handle, static label)
  molecules/   — one atom + local behavior (click-to-edit label)
  organisms/   — feature-complete pieces (the generic Range engine,
                 and the two exercise-specific compositions)

lib/           — adapters, mock data functions, format/utils helpers
types/         — shared TypeScript types
```

The `<Range />` the exercise asks for is `components/organisms/Range` — the custom, domain-agnostic
dual-handle range primitive. Its "two usage modes" are the two adapters it accepts:
`NumberRange`/`FixedValuesRange` are thin per-mode compositions that hand `Range` a continuous or a
discrete adapter plus the matching labels.

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

### The Range engine: one adapter interface, two domains

`/exercise1` and `/exercise2` are the same interaction — drag two handles, keyboard-step them, don't let
them cross — over two different domains: a continuous range and a fixed list of values. Rather than build
two ranges, `components/organisms/Range` implements the interaction once (drag, keyboard, ARIA,
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
and are exactly the same regardless of domain, so they get written and tested once. `Range` itself has no
idea whether it's continuous or discrete.

Collision (handles can't cross) is deliberately **not** part of the adapter — it's resolved once in
`useRange` via a plain clamp against the sibling handle's current value. Home/End reuse that same
clamp by always passing the domain bound (`adapter.min`/`adapter.max`); since the clamp is already
sibling-aware, "jump to the domain edge" and "jump to the sibling" fall out of the same code path instead
of needing a special case.

### Testing scope so far

Adapter math and `Range`'s keyboard/ARIA/collision behavior are covered thoroughly (both domains). Drag
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

Each exercise's Server Component calls the `lib/data` functions **directly**, not through
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

### State: plain `useState`, not Zustand — and how that conclusion was reached

`Range` and `EditableRangeLabel` stay controlled (`value`/`onChange` props) regardless of what manages
state above them — the reusable, domain-agnostic pieces, proven against plain `useState` since chunk 2's
tests. The question was only ever about `NumberRange`/`FixedValuesRange`'s own `{minValue, maxValue}`.

This went through three iterations, worth documenting because each one was wrong for a concrete, checkable
reason, not a style preference:

1. **A Zustand store created once per component instance** (`useState(() => createRangeStore(...))`).
   Correct and matches Zustand's own documented pattern for "initialize a store with props from a
   component" (see `React context` in Zustand's README) — but unfamiliar enough on sight to warrant a
   second look, which led to trying something that looked simpler.
2. **A single module-level Zustand store**, seeded from props via `useLayoutEffect`. This is the version
   that looked simpler but wasn't: a module-level store can't know a page's server-fetched `min`/`max` at
   the time the module is evaluated, so its initial state is whatever's hardcoded — and that's what
   `next build` actually emits into the static HTML. Confirmed by reading the generated output directly:
   `grep aria-valuenow .next/server/app/exercise1.html` showed `"0"` and `"0"` instead of `"1"` and `"100"`
   — a real, measurable defect (visible to no-JS clients, slow connections, and crawlers), not a
   theoretical one, and exactly the failure mode Zustand's docs point at when they recommend a scoped
   store over a singleton for this case.
3. **Plain `useState<SelectedRange>` seeded directly from props, no store at all.** `useState`'s initial
   value is correct from the very first render — server-rendered HTML included — with no effect required
   to correct it after the fact. Clamping stays centralized as two small calls to the existing `clamp`
   utility (`lib/utils.ts`), inline in each organism, reached by both the slider's drag/keyboard path
   (already clamped by `useRange` before it gets here) and the editable label's typed commits.
   Re-verified against the built output: `aria-valuenow` now reads `"1"`/`"100"` in the static HTML.

The state here is fully scoped to one component's lifetime and derived from its own props — not
cross-page or cross-component shared state, which is the problem Zustand (or Redux, or Context) actually
solves. Reaching for a state library because "we're using it elsewhere in the project" rather than because
this specific state needs it is exactly how the module-level-singleton version happened.

### Deliberately not unit-tested: `page.tsx`

`app/exercise1/page.tsx` has no test file. Both Vitest's and Jest's official docs for this Next.js version
say async Server Components aren't supported by either — recommended path is E2E, out of scope here (the
exercise asks for unit/integration tests). The actual risk this leaves uncovered is small on purpose: the
page is intentionally just an `await` plus a prop-pass to an already-tested component, with `next build`
itself (not a unit test) verifying it renders correctly as static output.

### Exercise 2: how much of exercise 1 actually gets reused

`FixedValuesRange` is `Range` (discrete adapter instead of continuous) + two static `RangeLabel` + its own
`useState<SelectedRange>` — no new interaction logic at all. `RangeLabel` itself only exists as its own component
because exercise 2 gave it a second, genuinely different caller: it was extracted out of
`EditableRangeLabel` at that point, not before, since a shared component with exactly one caller is just
indirection. `EditableRangeLabel` now renders `RangeLabel` for its non-editing state (passing an `onClick`
turns the value into a button; omitting it — exercise 2's case — renders a plain span), instead of the two
components duplicating the same caption+value markup.

The two pages' shared shell (back link, wrapper, heading) lives once in a `(exercises)` **route group**
layout — the parentheses keep it out of the URL, so the routes are still `/exercise1` and `/exercise2`.
Each `page.tsx` is now just its `metadata`, the `await`, and the component. The single
`(exercises)/loading.tsx` replaces the two identical per-route ones; because `loading.tsx` wraps the page
but not the layout, the shell (back link + heading) stays on screen and only the range area shows a
skeleton while the page's data streams in — and keeping the data fetch in `page.tsx` (not the layout) is
what lets that loading state appear at all.

### Final pass: accessibility audit and leftover boilerplate

A few things only show up once you actually check, not just by reading the code:

- The editable label's `<input>` had `focus:outline-none` with nothing replacing it — a keyboard user
  tabbing into edit mode would see no focus indicator at all. Fixed with `focus-visible:outline` matching
  the rest of the app's convention (suppress the default ring on mouse focus, keep a visible one for
  keyboard focus).
- Contrast, checked by computing actual ratios rather than eyeballing them (Tailwind v4's neutral palette
  is defined in OKLCH, so "looks about right" isn't the same as passing): the caption micro-labels
  ("FROM"/"TO") at `text-neutral-500` measured 4.74:1 at 12px bold — technically passes WCAG AA's 4.5:1,
  but with too little margin for text that small, so bumped to `neutral-600` (7.81:1). The slider track's
  unselected segment at `neutral-300` measured 1.48:1 against the white background — fails the 3:1 WCAG
  1.4.11 non-text contrast requirement for UI components outright, not just a margin problem. Bumped to
  `neutral-500` (4.74:1).
- `prefers-reduced-motion`: both hover animations (the slider handle's scale-up, the landing page's arrow
  nudge) now include `motion-reduce:transition-none` — the hover *state* still applies, just without the
  animated transition.
- Leftover from `create-next-app` that never got cleaned up until now: `globals.css`'s dark-mode color
  override doesn't apply to anything real (no component in this app reads `bg-background`/`text-foreground`
  or uses a `dark:` variant — checked directly with `grep`), and the `body` had a hardcoded
  `font-family: Arial, Helvetica, sans-serif` that was silently overriding the Geist font loaded via
  `next/font` in `layout.tsx` — the font was being downloaded but never actually displayed. Removed the
  unused dark-mode block, removed the hardcoded font-family, and added `font-sans` to `<body>` so the
  already-loaded Geist font is the one that actually renders.

### Where this landed

Both routes are prerendered as static output (confirmed in `next build`'s route summary), fully operable
by keyboard alone (Tab between handles and labels, arrow keys/Home/End to move a handle, Enter/Escape to
commit/cancel a label edit), and pass `lint`/`tsc`/`test`/`build` clean. 54 tests across adapters, the
Range engine, both exercise organisms, and the mock API routes — deliberately not covering: trivial
presentational atoms, CSS-only hover states, and the async Server Component pages (unsupported by this
version's Vitest/Jest per their own docs, and low-risk here since those pages do nothing but `await` and
pass props to already-tested components).
