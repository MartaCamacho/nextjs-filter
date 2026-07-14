# Range component — Mango technical test

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

More sections (state management, the adapter pattern behind both exercises, styling approach, and the
deliberate testing boundaries) land as the corresponding code does.
