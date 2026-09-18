# Kept

Kept is a personal reference database: a structured system for collecting,
organizing, contextualizing, and retrieving visual references.

The product is being developed as a robust web application. It is not primarily
a desktop or mobile app, and it is not just a canvas for temporarily arranging
images. A canvas may be one useful way to work with references, but the durable
product is the reference system underneath it.

> Collect visual references once, structure and contextualize them, then
> reliably find and use them again.

## Product model

The central object is a reference record. A record can contain a visual asset or
external reference, source information, metadata, personal notes, collections,
and relationships to other references.

The fundamental actions are:

- **Capture** — Create a record.
- **Index** — Give it structure through metadata, tags, and attributes.
- **Annotate** — Add personal meaning and context.
- **Organize** — Put references into collections and broader systems.
- **Query** — Search and filter the database.
- **Retrieve** — Actually find a reference again and understand why it matters.
- **Connect** — Relate one reference to another.

Collections and connections are distinct concepts. Collections are intentional
groups assembled by the user; connections express relationships between
individual references, such as similarity, influence, contrast, source lineage,
or a personal association.

## Product principles

1. **Capture should be effortless.** Add structure progressively rather than
   blocking intake.
2. **Context is personal.** The user's interpretation is as valuable as source
   metadata.
3. **Structure should be layered.** Tags, fields, collections, and relationships
   should complement rather than compete.
4. **Retrieval is the measure of success.** Every feature should make future
   discovery more reliable.
5. **Relationships should be explicit.** References should form a network, not
   only a set of folders.
6. **Local ownership matters.** The product should prioritize user control,
   speed, and dependable access to personal references.
7. **The interface can be spatial without the product being canvas-first.** A
   canvas, grid, list, detail view, graph, and search view should expose the
   same underlying reference system.

## Current state

This repository currently contains the early product landing page and brand
foundation. The reference database itself is the next major stage of
development: a web-first application for capturing references, building
structure and context around them, and retrieving them later.

The current landing page is intentionally minimal and communicates the early
development status of the product. The working product name and public-facing
language may continue to evolve as the system takes shape.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:5173. For a phone on the same network, run
`npm run dev -- --host 0.0.0.0` and open the network URL printed by Vite.

```sh
npm run build
npm run preview
```

## Technical direction

The application is a React + Vite web app. The primary product focus is a
robust browser experience rather than separate desktop and mobile applications.
The web app should support a dependable, responsive workflow across screen
sizes without treating mobile as a separate product surface.

Local-first behavior remains an important direction: references and their
context should feel fast, owned by the user, and available without unnecessary
dependence on a remote service. The implementation details for persistence,
sync, and search will be established as the application develops.

## Edit the current UI

- `src/config/site.js`: name, description, status, accent, and home link.
- `src/components/SiteMasthead.jsx`: reusable header.
- `src/App.jsx`: page shell, product summary, status pill, and project context.
- `src/index.css`: site styles, including the 672px mobile breakpoint.
- `vite.config.js`: generates page title and description from site configuration.

Vercel continues to use the existing Vite configuration and `dist` output.
The existing assets in `public/` are retained while the web application and
brand direction continue to develop.
