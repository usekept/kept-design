# Kept

Kept is a personal reference database: a structured system for collecting,
organizing, contextualizing, and retrieving visual references.

> A library you can actually operate.

The durable product is the reference system — not a moodboard, not a canvas,
and not a generic file locker. Operate UI is a snapshot of
[w-ade/kept-ui](https://github.com/w-ade/kept-ui) at `d250e558` (`src/kept/`),
wired to real SPA paths. The lab Base UI docs playground (`src/demos/`) is
not in this repo.

## Product model

The central object is a **Reference**, not a File. A reference can hold one or
more **Assets** (stored files), source information, notes, collections, tags,
and typed directional relationships to other references.

The fundamental actions are:

- **Capture** — Create a record.
- **Index** — Give it structure through metadata, tags, and attributes.
- **Annotate** — Add personal meaning and context.
- **Organize** — Collections and tags.
- **Query** — Search and filter the database.
- **Retrieve** — Actually find a reference again and understand why it matters.
- **Connect** — Relate one reference to another.

## Current state

- `/` — product landing (kept.design chrome, not the lab landing).
- `/login` — mock username + password.
- `/login/mfa` — TOTP stand-in (continue without a code).
- `/library` — collections index (app home). Signed in.
- `/library/:collectionId` — operate a collection. Inspector is the same
  route with `?r=` for the selected reference.
- `/m/:token` — unlisted read-only moodboard. No chrome, no login.
- `/map` — system map (architecture diagram, not the running stack).

Persistence is the mock in `src/kept/repository.ts`. Session is mocked in
`src/kept/session.ts` (lab account `wade` / `1234`). Swap those for Supabase
later; do not block the UI on it.

Stack: Vite + React 19 + `@base-ui/react` + Geist on the operate screens.
Landing and `/map` keep the existing product typeface.

## Run locally

```sh
npm install
npm run dev
```

Open the URL Vite prints (default http://localhost:5173). For a phone on the
same network, run `npm run dev -- --host 0.0.0.0`.

```sh
npm run build
npm run preview
```

Vercel continues to use the existing Vite configuration and `dist` output,
with a SPA rewrite so operate routes load `index.html`.
