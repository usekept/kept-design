# Kept

Kept is a personal reference database: a structured system for collecting,
organizing, contextualizing, and retrieving visual references.

> A library you can actually operate.

The durable product is the reference system — not a moodboard, not a canvas,
and not a generic file locker. The first operable slice is `/library`: a
creator-focused library with Drive-like operability (sidebar, grid/list,
search, bulk actions, details) over Kept objects (References, Assets,
collections, tags, notes, relationships).

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

Index-later fields on a reference (`keywords`, `description`, `ocrText`,
`embedding`) exist in the model and stay empty. There is no AI pipeline yet.

## Current state

- `/` — product landing.
- `/library` — collections index (stacked buckets) then operate chrome
  inside a collection: sidebar, grid/list browser, search/filters,
  multi-select bulk filing, inspector.
- `/map` — system map (architecture diagram, not the running stack).

Persistence is a single boundary: `src/data/repository.js`. Today it reads
`src/data/fixtures.js` (a personal visual-reference library). UI code must not
import fixtures directly. Swap the repository internals for local JSON or
hosted storage later.

Domain types live in `src/domain/types.js` (JSDoc). The app stays JavaScript
on Vite + React 19.

## Run locally

```sh
npm install
npm run dev
```

Open the URL Vite prints (default http://localhost:5173). Routes: `/`,
`/library`, `/map`. For a phone on the same network, run
`npm run dev -- --host 0.0.0.0`.

```sh
npm run build
npm run preview
```

## Edit the current UI

- `src/config/site.js`: name, description, status, accent, and home link.
- `src/components/SiteMasthead.jsx`: header + landing / library / map nav.
- `src/pages/Library.jsx`: operate surface.
- `src/data/repository.js`: persistence boundary.
- `src/domain/types.js`: Reference, Asset, Collection, Tag, Note, Relationship, User.
- `src/App.jsx`: landing copy and pathname routing.
- `src/index.css`: site styles, including the 672px mobile breakpoint.

Vercel continues to use the existing Vite configuration and `dist` output.
