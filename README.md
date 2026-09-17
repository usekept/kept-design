# Kept design

Marketing landing for Kept: a lightweight, local-first visual working surface for references.

Positioning follows the Kept Linear project — **Kept is where references land.** V0 is canvas-first (`open → paste/drop → arrange → annotate → close → reopen → continue`), not a searchable library or AI workspace.

The UI is based on `tool-site-base`, customized with KEPT branding, black text,
pink selection highlights, SF Mono typography (with monospace fallbacks), a product summary,
an early-development pill, and project context.
This repository retains React + Vite rather than adopting the template's Next.js runtime.

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

## Edit the UI

- `src/config/site.js`: name, description, status, accent, and home link.
- `src/components/SiteMasthead.jsx`: reusable header.
- `src/App.jsx`: page shell, product summary, status pill, and project context.
- `src/index.css`: site styles, including the 672px mobile breakpoint.
- `vite.config.js`: generates page title and description from site configuration.

Vercel continues to use the existing Vite configuration and `dist` output.
The old Kept assets in `public/` are retained but are not used by this UI.
