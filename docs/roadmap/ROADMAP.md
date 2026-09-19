# Kept backend roadmap

> Generated from `docs/roadmap/roadmap.json` by `node scripts/roadmap.mjs`. Edit the JSON, not this file.

Wire Kept's finished UI (a pixel copy of the kept-ui lab) to Supabase: Postgres, Auth, Storage and two Edge Functions, behind the exact functions the screens already call, so no screen changes.

**Progress:** 2 of 37 issues done.

## How it fits together

```text
Browser · kept.design (Vite SPA, same screens as kept-ui)
│
├── supabase-js  (publishable key, user JWT)
│     ├── Auth      password + TOTP → AAL2; signup off
│     ├── Postgres  RLS on every table: owner_id = auth.uid() AND aal2
│     └── Storage   private bucket kept-assets/<owner>/<ref>/{full,thumb}.jpg
│
├── Edge Function  sign-in   username → email, then password sign-in
└── Edge Function  board     /m/:token → rows + short-lived signed image URLs
                             (the only path that works signed out)
```

## The seam

What each function in `src/kept/session.ts` and `src/kept/repository.ts` becomes.

| Function | Backed by | Issue |
| --- | --- | --- |
| `getSession()` | Cached Supabase session + AAL, read synchronously after boot | KEPT-13 |
| `signInWithPassword(username, password)` | Edge Function `sign-in` → `auth.setSession()` | KEPT-12 |
| `completeMfaForLab()` | Replaced by TOTP enroll / verify | KEPT-15 |
| `signOut()` | `auth.signOut()` | KEPT-13 |
| `listCollections()` · `getCollection(id)` | `collection_summaries` view, slug as the id | KEPT-18 |
| `createCollection(name)` · `updateCollection(id, patch)` | RPC `create_collection` · update on `collections` | KEPT-18 |
| `listReferences(id)` · `listAllReferences()` | One nested select + batched signed URLs | KEPT-19 |
| `updateReference(cid, rid, patch)` | Notes update; RPCs `set_ref_tags`, `set_ref_pins` | KEPT-20 |
| `addUploads(cid, files, onProgress)` | On-device resize → rows → Storage uploads | KEPT-21 |
| `getShare` · `publishCollection` · `rotateShare` · `unpublishCollection` | `collection_shares` + token RPCs | KEPT-23 |
| `getBoard(token)` | Edge Function `board` (no sign-in) | KEPT-24 |
| `requestInvite(request)` | RPC `request_invite` (anon) | KEPT-26 |

## Ground rules

- kept-ui is the source of truth and is never written to from here. New screens (two-factor, later box annotations and renaming) are designed there first, then synced.
- `npm run sync-kept-ui` must never overwrite the real data layer (KEPT-6).
- Same function names and return shapes. If kept-ui changes a shape, the typecheck fails before anything ships.
- Only the publishable key reaches the browser. The service-role key lives in Edge Function secrets and a local seed script, never behind a `VITE_` prefix.
- Without Supabase env vars the app falls back to the mocks (D-4).
- The pixel sweep is re-run once real data flows: the UI must still match kept-ui.

## Decisions

### D-1 · How usernames sign in — Open

Kept signs in by username, but Supabase Auth signs in by email. Something has to turn a username into an email without letting anyone look up whose account is whose.

- **Edge Function `sign-in`** _(recommended)_: The browser sends username + password to a function that looks up the email with the service role and signs in server-side. Emails never leave the server, and an unknown username gives the same error as a wrong password.
- **Synthetic emails**: Each account's email is `username@users.kept.design`. No server code, but no real inbox for recovery or notices.
- **Public lookup function**: An anon-callable `email_for_username()`. Simplest, but it lets anyone enumerate usernames and read their emails. Not recommended.

### D-2 · How board images are served — Open

Library images stay in a private bucket. Boards are opened by people who aren't signed in, so their images need a different path.

- **Signed URLs from the `board` function** _(recommended)_: The function checks the token and returns URLs that expire (about an hour). Unpublish and New link take effect immediately for new visits. One bucket, nothing public.
- **Public copies of published images**: Publishing copies files into a public bucket. Links never expire and CDN caching is simpler, but every publish, rotate and unpublish has to copy or delete files.

### D-3 · Where Supabase is provisioned — Open

Supabase can be created directly on supabase.com or through the Vercel Marketplace integration.

- **Vercel Marketplace integration** _(recommended)_: Billed through Vercel; env vars sync to Production, Preview and Development automatically. Vite only exposes `VITE_`-prefixed vars, so `vite.config` adds the integration's `NEXT_PUBLIC_SUPABASE_` prefix to `envPrefix`.
- **supabase.com directly**: Billed by Supabase; env vars are copied into Vercel by hand. Nothing else changes.

### D-4 · Keep the mocks as a fallback — Open

When Supabase env vars are missing (a fresh clone, a preview without secrets), the app can either fall back to kept-ui's mocks or refuse to start.

- **Fall back to the mocks** _(recommended)_: `repository.ts` picks the Supabase implementation when configured, else the synced mock. The lab account `wade / 1234` keeps working locally. This matches the v0 spec.
- **Require Supabase everywhere**: Simpler code paths, but every preview and fresh clone needs real credentials.

### D-5 · Collection images in git — Open

PR #3 already committed the 320 moode-matcha files to main (the repo is public). Once they're in Storage, the copies in `public/collections/` aren't needed.

- **Remove them after the seed** _(recommended)_: Delete `public/collections/` from main once KEPT-28 has moved them into Storage. They stay in git history, but the app stops depending on them.
- **Keep them in the repo**: Useful for the mock fallback on previews. Costs repo size and keeps the images public.

## Phases

### Ground work (2/7)

Get PR #4 onto main, settle the open calls, and protect the data layer from the sync script. _Target: Before any backend code._

- [x] **KEPT-0** Recreate the kept-ui UI in kept-design — Done, High
- [x] **KEPT-1** Merge PR #4 into main — Done, Urgent
- [ ] **KEPT-2** Decide how usernames sign in (D-1) — Todo, High
- [ ] **KEPT-3** Decide how board images are served (D-2) — Todo, High
- [ ] **KEPT-4** Decide where Supabase is provisioned (D-3) — Todo, High
- [ ] **KEPT-5** Decide on the mock fallback (D-4) — Todo, Medium
- [ ] **KEPT-6** Stop the sync script from overwriting the data layer — Todo, High

### Supabase foundation (0/5)

Project, migrations, row-level security enforcing owner + two-factor, a private image bucket, generated types. _Target: Schema, RLS, Storage._

- [ ] **KEPT-7** Create the Supabase project and local setup — Backlog, High
- [ ] **KEPT-8** Schema migration — Backlog, Urgent
- [ ] **KEPT-9** Row-level security: owner and two-factor on every row — Backlog, Urgent
- [ ] **KEPT-10** Private Storage bucket for images — Backlog, High
- [ ] **KEPT-11** Supabase client and generated types — Backlog, Medium

### Sign-in and two-factor (0/5)

Username sign-in through an Edge Function, a real session behind the synchronous getSession(), and TOTP. _Target: Real accounts._

- [ ] **KEPT-12** Username sign-in Edge Function — Backlog, Urgent
- [ ] **KEPT-13** Real session behind the synchronous getSession() — Backlog, Urgent
- [ ] **KEPT-14** Design the two-factor screen in kept-ui — Backlog, Urgent
- [ ] **KEPT-15** Wire TOTP enrollment and challenge — Backlog, Urgent
- [ ] **KEPT-16** Create your account by hand — Backlog, High

### Library data (0/6)

Collections, references, notes, tags, pins and uploads move from browser storage to Postgres and Storage. _Target: Same functions, real rows._

- [ ] **KEPT-17** Repository adapter structure — Backlog, High
- [ ] **KEPT-18** Collections: list, get, create, describe — Backlog, High
- [ ] **KEPT-19** References: list with signed image URLs — Backlog, Urgent
- [ ] **KEPT-20** Save notes, tags and pins — Backlog, High
- [ ] **KEPT-21** Uploads to Storage — Backlog, Urgent
- [ ] **KEPT-22** Keep search client-side for v0 — Backlog, Low

### Boards (0/3)

Publish, rotate and unpublish in Postgres; a signed-out Edge Function serves boards with short-lived image URLs. _Target: /m/:token for real._

- [ ] **KEPT-23** Publish, rotate and unpublish in Postgres — Backlog, High
- [ ] **KEPT-24** Board Edge Function for signed-out visitors — Backlog, Urgent
- [ ] **KEPT-25** Share links use kept.design — Backlog, Medium

### Invites (0/2)

Invite requests stored server-side, deduplicated by email, with a notification to you. _Target: Requests reach you._

- [ ] **KEPT-26** Store invite requests server-side — Backlog, High
- [ ] **KEPT-27** Tell you when someone asks for an invite — Backlog, Medium

### Move in and ship (0/4)

Seed moode-matcha into Storage, set env and secrets, re-verify pixel parity and RLS, deploy. _Target: kept.design._

- [ ] **KEPT-28** Seed moode-matcha into Storage — Backlog, High
- [ ] **KEPT-29** Environment variables and secrets — Backlog, Urgent
- [ ] **KEPT-30** Verify: pixel parity, end-to-end and RLS — Backlog, Urgent
- [ ] **KEPT-31** Ship to kept.design — Backlog, Urgent

### Later (0/5)

Worth doing, not needed for v0: box annotations, renaming, server search, share previews. _Target: After v0._

- [ ] **KEPT-32** Box annotations — Backlog, Low
- [ ] **KEPT-33** Rename references — Backlog, Low
- [ ] **KEPT-34** Server-side search and a command palette — Backlog, Low
- [ ] **KEPT-35** Board link previews — Backlog, Low
- [ ] **KEPT-36** Move images to R2 if Storage costs bite — Backlog, No priority

## Issues

### KEPT-0 · Recreate the kept-ui UI in kept-design

- **Status:** Done · **Priority:** High · **Estimate:** 8 pt · **Phase:** Ground work
- **Labels:** ui

**Why.** Every screen and state from the kept-ui lab now runs on real paths in kept-design, pixel-identical at 1440px and 390px in light and dark.

**Approach**

1. Synced `src/kept` with `scripts/sync-kept-ui.mjs`, which rewrites `#/kept/...` routes into paths.
2. Added `navigate.ts` and a `useSyncExternalStore` router so links don't reload and redirects aren't missed.
3. Removed the legacy home and map pages; matched kept-ui's dependency versions; added a typecheck to the build.

**Done when**

- [x] All 16 routes identical to kept-ui.vercel.app
- [x] Interactive states identical (dialogs, menus, search, lightbox, keyboard stepping, sign-in redirects)

**Notes.** Commits `969134d` and `7e9ddba` on `cursor/snapshot-kept-ui-a2a8`, open as PR #4.

### KEPT-1 · Merge PR #4 into main

- **Status:** Done · **Priority:** Urgent · **Estimate:** 1 pt · **Phase:** Ground work
- **Labels:** ops
- **Blocks:** KEPT-31

**Why.** The UI work lives on a branch. Main still has PR #3, an older snapshot of the same screens with the legacy home and map pages. Everything else builds on main.

**Approach**

1. Merge PR #4, resolving conflicts in favour of #4 (it's a superset of #3 and verified).
2. Keep #3's committed `public/collections/` images and drop #4's `.gitignore` line for them, so production has images until Storage takes over.
3. Build, then check the Vercel preview renders `/`, `/library`, and `/m/mm7q2x9kfa`.

**Done when**

- [x] main contains `7e9ddba`'s tree plus the images
- [x] `npm run build` passes on main
- [x] Vercel production shows the kept-ui landing

**Notes.** An automated merge was blocked by the permission check last session, so this needs your go-ahead or a merge on GitHub. Merged 2026-09-19 as 4248833; Vercel deploy succeeded and kept.design serves the new UI.

### KEPT-2 · Decide how usernames sign in (D-1)

- **Status:** Todo · **Priority:** High · **Estimate:** 1 pt · **Phase:** Ground work
- **Labels:** decision, auth
- **Blocks:** KEPT-12

**Why.** Blocks the whole sign-in phase. See Decisions → D-1; the recommendation is an Edge Function so emails never reach the browser.

**Done when**

- [ ] D-1 marked decided

### KEPT-3 · Decide how board images are served (D-2)

- **Status:** Todo · **Priority:** High · **Estimate:** 1 pt · **Phase:** Ground work
- **Labels:** decision, storage
- **Blocks:** KEPT-10, KEPT-24

**Why.** Shapes the storage policies and the board function. See Decisions → D-2.

**Done when**

- [ ] D-2 marked decided

### KEPT-4 · Decide where Supabase is provisioned (D-3)

- **Status:** Todo · **Priority:** High · **Estimate:** 1 pt · **Phase:** Ground work
- **Labels:** decision, infra
- **Blocks:** KEPT-7

**Why.** Needed before the project exists. See Decisions → D-3.

**Done when**

- [ ] D-3 marked decided

### KEPT-5 · Decide on the mock fallback (D-4)

- **Status:** Todo · **Priority:** Medium · **Estimate:** 1 pt · **Phase:** Ground work
- **Labels:** decision
- **Blocks:** KEPT-6

**Why.** Decides how `repository.ts` is structured. See Decisions → D-4.

**Done when**

- [ ] D-4 marked decided

### KEPT-6 · Stop the sync script from overwriting the data layer

- **Status:** Todo · **Priority:** High · **Estimate:** 2 pt · **Phase:** Ground work
- **Labels:** data, ops
- **Blocked by:** KEPT-5
- **Blocks:** KEPT-17

**Why.** `npm run sync-kept-ui` copies every file in kept-ui's `src/kept`, including the mock `repository.ts`, `session.ts` and `uploads.ts`. Once those are real, one sync would silently put the mocks back.

**Approach**

1. Sync kept-ui's `repository.ts` to `repository.mock.ts`, `session.ts` to `session.mock.ts`, and `uploads.ts` to `uploads.mock.ts` (rename on write), rewriting their relative imports.
2. kept-design owns `repository.ts` and `session.ts`: they re-export the types from the mocks and pick an implementation (D-4).
3. Screens keep importing `./repository.ts`; nothing in the synced screens changes.
4. Keep `prepareUpload()` from the mock uploads module: the on-device resize is shared by both implementations.

**Done when**

- [ ] Running the sync twice leaves `repository.ts` and `session.ts` untouched
- [ ] If kept-ui changes a function or type the screens use, `npm run build` fails on the typecheck
- [ ] README documents which files are synced, renamed, or owned here

### KEPT-7 · Create the Supabase project and local setup

- **Status:** Backlog · **Priority:** High · **Estimate:** 2 pt · **Phase:** Supabase foundation
- **Labels:** infra
- **Blocked by:** KEPT-4
- **Blocks:** KEPT-8, KEPT-10, KEPT-29

**Why.** Everything else needs a project, the CLI, and migrations in the repo so the schema is reviewable.

**Approach**

1. Create the project (per D-3) in the region closest to you.
2. Auth settings: disable signups, keep email confirmations on, set Site URL to `https://kept.design` and add `http://localhost:5173` to redirect URLs.
3. `npx supabase init`, `supabase link`, migrations under `supabase/migrations/`.
4. Add `.env.example` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; real values in `.env.local` (git-ignored) and Vercel.

**Done when**

- [ ] `supabase db push` applies cleanly to an empty project
- [ ] Signups are off (a sign-up call is rejected)
- [ ] No keys are committed

### KEPT-8 · Schema migration

- **Status:** Backlog · **Priority:** Urgent · **Estimate:** 5 pt · **Phase:** Supabase foundation
- **Labels:** db
- **Blocked by:** KEPT-7
- **Blocks:** KEPT-9, KEPT-11

**Why.** Turns the shapes in `repository.ts` into tables. A Reference is the unit of meaning; its Asset carries the file facts; v0 has one asset and one collection per reference.

**Approach**

1. Write `0001_schema.sql` with the tables below; UUID primary keys, `owner_id` on every row for RLS.
2. Collections keep a `slug` because the UI uses it as the collection id in URLs (`/library/moode-matcha`). References keep a short `public_id` for `/library/:c/:r`.
3. `references` is a reserved word in SQL, so the table is `refs`.
4. Add `updated_at` triggers, and a generated `search` tsvector on refs for later server search (KEPT-34).

**Sketch**

```text
profiles      id uuid pk → auth.users · username citext unique (2–32 [a-z0-9._-])
collections   id uuid pk · owner_id · slug text · name text (≤80) · description text
              created_at · updated_at · unique (owner_id, slug)
refs          id uuid pk · public_id text unique · owner_id · collection_id → collections
              title · notes · capture_url (null = uploaded) · added_at · updated_at
              search tsvector generated
assets        id uuid pk · ref_id → refs (cascade) · owner_id · path_full · path_thumb
              file_name · file_type · width · height · bytes
tags          id uuid pk · owner_id · name citext · unique (owner_id, name)
ref_tags      ref_id → refs · tag_id → tags · pk (ref_id, tag_id)
annotations   id uuid pk · ref_id → refs (cascade) · owner_id · kind ('pin'|'box')
              x · y · w · h (null for pins) · caption · position int
collection_shares  collection_id pk → collections (cascade) · token text unique
                   published_at · rotated_at
invite_requests    id uuid pk · name · email citext unique · note (≤500)
                   requested_at · status ('waiting'|'invited'|'declined')
```

**Done when**

- [ ] Every field the UI reads maps to a column (see the seam table)
- [ ] Slugs unique per owner; tokens and public ids unique globally
- [ ] Migration is idempotent against a fresh project

### KEPT-9 · Row-level security: owner and two-factor on every row

- **Status:** Backlog · **Priority:** Urgent · **Estimate:** 3 pt · **Phase:** Supabase foundation
- **Labels:** db, security
- **Blocked by:** KEPT-8
- **Blocks:** KEPT-12, KEPT-26

**Why.** The browser talks straight to Postgres, so RLS is the whole security model. Checking `aal2` in the policies means a stolen password without the second factor reads nothing.

**Approach**

1. Enable RLS on every table. No policies on `invite_requests` or `collection_shares` for anon.
2. One permissive policy per table for select/insert/update/delete: `owner_id = auth.uid()`.
3. One restrictive policy per table: `(auth.jwt() ->> 'aal') = 'aal2'`.
4. `profiles`: a user reads and updates only their own row; usernames are set by you, not the user.
5. Signed-out access goes only through SECURITY DEFINER functions with narrow return shapes (board, invite).

**Sketch**

```text
create policy "own rows" on refs for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "require mfa" on refs as restrictive for all to authenticated
  using ((auth.jwt() ->> 'aal') = 'aal2');
```

**Done when**

- [ ] pgTAP (or SQL) tests: user B can't select, update or delete user A's rows in any table
- [ ] An aal1 session reads zero rows
- [ ] anon reads zero rows from every table

### KEPT-10 · Private Storage bucket for images

- **Status:** Backlog · **Priority:** High · **Estimate:** 2 pt · **Phase:** Supabase foundation
- **Labels:** storage, security
- **Blocked by:** KEPT-7, KEPT-3
- **Blocks:** KEPT-19

**Why.** Images replace IndexedDB blobs and `public/collections/`. The upload path already makes a 1600px full and a 480px thumb on the device, so no server-side transforms are needed.

**Approach**

1. Bucket `kept-assets`, private, 10 MB limit, allowed types `image/jpeg`, `image/png`, `image/webp`.
2. Object paths `<owner_id>/<ref_id>/full.jpg` and `thumb.jpg`.
3. Policies on `storage.objects`: `(storage.foldername(name))[1] = auth.uid()::text` plus aal2, for select, insert, update and delete.

**Done when**

- [ ] A signed-in user can upload and sign URLs only under their own folder
- [ ] Unsigned object URLs return 400/404
- [ ] Another user's paths can't be signed

### KEPT-11 · Supabase client and generated types

- **Status:** Backlog · **Priority:** Medium · **Estimate:** 1 pt · **Phase:** Supabase foundation
- **Labels:** data
- **Blocked by:** KEPT-8
- **Blocks:** KEPT-13, KEPT-17

**Why.** One client module the data layer shares, and types generated from the schema so column typos fail the build.

**Approach**

1. `src/kept/supabase.ts` creates the client from `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`, or exports `null` when they're missing (D-4).
2. `npm run db:types` runs `supabase gen types typescript` into `src/kept/db.types.ts`.
3. Add `@supabase/supabase-js` as the only new runtime dependency.

**Done when**

- [ ] Typecheck passes with generated types
- [ ] App still runs on mocks with no env vars

### KEPT-12 · Username sign-in Edge Function

- **Status:** Backlog · **Priority:** Urgent · **Estimate:** 3 pt · **Phase:** Sign-in and two-factor
- **Labels:** auth, edge function, security
- **Blocked by:** KEPT-2, KEPT-9
- **Blocks:** KEPT-16

**Why.** Implements D-1. The login screen stays exactly as it is: username, password, the same four error messages.

**Approach**

1. `supabase/functions/sign-in`: POST `{ username, password }`.
2. With the service role, find `profiles.username` → user id → `auth.admin.getUserById()` → email.
3. Call `signInWithPassword({ email, password })` with an anon client inside the function and return `{ access_token, refresh_token }`.
4. Unknown username and wrong password return the same 400 and the same message: “Username or password is incorrect.”
5. Basic rate limit per IP and per username (a small table with timestamps is enough for v0).
6. Client: `signInWithPassword()` in `session.ts` calls the function, then `supabase.auth.setSession()`.

**Done when**

- [ ] The existing login error states still render identically
- [ ] No response ever contains an email
- [ ] 10 bad attempts in a minute are refused

### KEPT-13 · Real session behind the synchronous getSession()

- **Status:** Backlog · **Priority:** Urgent · **Estimate:** 3 pt · **Phase:** Sign-in and two-factor
- **Labels:** auth
- **Blocked by:** KEPT-11
- **Blocks:** KEPT-15

**Why.** Screens and the auth gate call `getSession()` synchronously and expect `{ username, aal }`. Supabase's session API is async, so the app has to load the session once before the first render and keep a cache.

**Approach**

1. In `main.tsx`, before `createRoot().render`, await `session.init()`: `auth.getSession()`, `auth.mfa.getAuthenticatorAssuranceLevel()` (both read the local JWT, so this is fast), and the user's `profiles.username`.
2. Keep a module-level cache; update it from `onAuthStateChange` (sign-in, token refresh, sign-out) and notify the router so the gate re-evaluates.
3. `getSession()` returns the cache synchronously: `{ username, aal: currentLevel }`.
4. `signOut()` calls `auth.signOut()` and clears the cache.

**Done when**

- [ ] Reloading `/library` while signed in never flashes the sign-in page
- [ ] Signing out in one tab signs out other tabs
- [ ] Token refresh happens without a visible change

### KEPT-14 · Design the two-factor screen in kept-ui

- **Status:** Backlog · **Priority:** Urgent · **Estimate:** 3 pt · **Phase:** Sign-in and two-factor
- **Labels:** kept-ui first, ui
- **Blocks:** KEPT-15

**Why.** `/login/mfa` is a placeholder in both projects. kept-ui is the source of truth, so the real screen is designed and approved there (with a mock) before kept-design wires it.

**Approach**

1. In kept-ui, add two states to `/login/mfa`: **Set up** (QR code, the secret as text for manual entry, a six-digit field) and **Verify** (a six-digit field only).
2. Add mock functions to kept-ui's `session.ts` that the screen calls, e.g. `getMfaStatus()`, `startTotpEnrollment()`, `verifyTotp(code)`. These become the seam.
3. Errors in the existing style: “Enter the six-digit code.”, “That code didn’t work. Try the newest one.”
4. Approve it in the lab, then `npm run sync-kept-ui`.

**Done when**

- [ ] kept-ui has the approved screen and mock functions
- [ ] kept-design matches it pixel for pixel after the sync

**Notes.** This is the one issue that touches kept-ui. It's lab work done with your approval, like the other screens, not a change pushed from kept-design.

### KEPT-15 · Wire TOTP enrollment and challenge

- **Status:** Backlog · **Priority:** Urgent · **Estimate:** 3 pt · **Phase:** Sign-in and two-factor
- **Labels:** auth, security
- **Blocked by:** KEPT-13, KEPT-14
- **Blocks:** KEPT-16

**Why.** Makes the aal2 requirement real. Supabase's MFA API does enroll → challenge → verify and upgrades the session to aal2.

**Approach**

1. `startTotpEnrollment()` → `auth.mfa.enroll({ factorType: 'totp' })`, returning the QR SVG and secret.
2. `verifyTotp(code)` → `auth.mfa.challenge()` then `auth.mfa.verify()`; on success refresh the session cache to aal2.
3. The gate already sends aal1 sessions to `/login/mfa`; the screen shows Set up when no factor is verified, else Verify.
4. Recovery: Supabase has no backup codes. Enroll a second TOTP factor (another device or a password manager) and document the dashboard reset as the last resort.

**Done when**

- [ ] Fresh account: sign in → set up → library
- [ ] Next sign-in asks only for the code
- [ ] An aal1 session can't read data even by calling the API directly (KEPT-9)

### KEPT-16 · Create your account by hand

- **Status:** Backlog · **Priority:** High · **Estimate:** 1 pt · **Phase:** Sign-in and two-factor
- **Labels:** auth, ops
- **Blocked by:** KEPT-12, KEPT-15
- **Blocks:** KEPT-28

**Why.** Signups are off and Kept is invite-only, so accounts are made in the dashboard. This is also the procedure for approving invites.

**Approach**

1. Dashboard → Authentication → Add user: your real email, a strong password, auto-confirm.
2. Insert the profile: `insert into profiles (id, username) values ('<user id>', 'wade');`
3. Sign in, enroll TOTP, and confirm the library loads (empty until KEPT-28).

**Done when**

- [ ] You can sign in as `wade` with a real password and TOTP
- [ ] The lab password `1234` no longer works outside the mock fallback

### KEPT-17 · Repository adapter structure

- **Status:** Backlog · **Priority:** High · **Estimate:** 2 pt · **Phase:** Library data
- **Labels:** data
- **Blocked by:** KEPT-6, KEPT-11
- **Blocks:** KEPT-18, KEPT-19, KEPT-23

**Why.** Implements D-4 and KEPT-6's split. Screens import one module; it routes each call to Supabase or the mock.

**Approach**

1. `repository.ts`: `export * from types`, then each function delegates to `supabaseRepository` when the client exists, else to `repository.mock.ts`.
2. `repository.supabase.ts` holds the real implementations, one per exported function, with identical signatures.
3. Shared helpers: slug ↔ uuid map for collections, public_id ↔ uuid for refs, signed-URL cache.

**Done when**

- [ ] With no env vars the app behaves exactly like today
- [ ] With env vars every function hits Supabase
- [ ] No screen file changes

### KEPT-18 · Collections: list, get, create, describe

- **Status:** Backlog · **Priority:** High · **Estimate:** 3 pt · **Phase:** Library data
- **Labels:** data, db
- **Blocked by:** KEPT-17

**Why.** The library home needs names, counts, updated dates, descriptions and up to four cover thumbnails per collection.

**Approach**

1. View `collection_summaries`: collection columns + `count(refs)` + the four newest thumb paths.
2. `listCollections()` selects the view, signs cover paths in one batch, maps `slug` to `id`.
3. `getCollection(id)` by slug.
4. `createCollection(name)` calls RPC `create_collection(name)`, which makes a unique slug per owner in SQL (no race between two tabs).
5. `updateCollection(id, { description })` updates by slug.

**Done when**

- [ ] Library count line and tiles match the mock for the same data
- [ ] Creating “Type specimens” twice gives `type-specimens` and `type-specimens-2`

### KEPT-19 · References: list with signed image URLs

- **Status:** Backlog · **Priority:** Urgent · **Estimate:** 5 pt · **Phase:** Library data
- **Labels:** data, storage
- **Blocked by:** KEPT-17, KEPT-10
- **Blocks:** KEPT-20, KEPT-21

**Why.** The collection grid, list, reference page and All references all read `listReferences()`. It must return complete `Reference` objects, image URLs included, fast enough for 160+ items.

**Approach**

1. One query: `refs` with nested `assets`, `ref_tags(tags(name))` and `annotations`, ordered newest first.
2. Map rows to `Reference`: `id` = public_id, `collectionId` = slug, pins from annotations of kind pin (normalized x/y + caption).
3. Sign thumbs and fulls with `storage.createSignedUrls()` in one call per 100 paths; cache by path until 5 minutes before expiry.
4. `listAllReferences()` runs the same query without the collection filter.

**Done when**

- [ ] The moode-matcha grid loads with images in one round trip plus two signing calls
- [ ] Reference page ← → still steps through the same order
- [ ] Search still finds titles, tags, notes, source, file names and pin captions (it runs on the loaded list)

### KEPT-20 · Save notes, tags and pins

- **Status:** Backlog · **Priority:** High · **Estimate:** 3 pt · **Phase:** Library data
- **Labels:** data, db
- **Blocked by:** KEPT-19

**Why.** `updateReference()` takes a partial `{ notes, tags, pins }` and returns the updated reference. Tags and pins are lists that should be replaced atomically.

**Approach**

1. `notes`: update `refs.notes`.
2. `tags`: RPC `set_ref_tags(ref, names text[])` upserts tag names (case-insensitive, like the UI's duplicate rule) and replaces `ref_tags` in one transaction.
3. `pins`: RPC `set_ref_pins(ref, pins jsonb)` replaces the ref's pin annotations in one transaction, keeping order.
4. Coalesce rapid edits (typing notes, dragging a caption) into one write per pause, as the mock's localStorage writes never had to.

**Done when**

- [ ] Edits survive reload and show up on another device
- [ ] Two quick tag edits never leave a half-applied state

### KEPT-21 · Uploads to Storage

- **Status:** Backlog · **Priority:** Urgent · **Estimate:** 5 pt · **Phase:** Library data
- **Labels:** data, storage
- **Blocked by:** KEPT-19
- **Blocks:** KEPT-28

**Why.** The upload dialog's rows (Waiting, Adding…, Added, “Couldn’t read this file”) and its running count stay the same; only where the files go changes.

**Approach**

1. Keep `prepareUpload()` (on-device decode, 1600px full, 480px thumb, metadata stripped).
2. Per file: RPC `create_ref(collection, title, file facts)` returns ids and paths → upload full and thumb → mark added.
3. On failure, delete the rows and any uploaded object, then report `failed` for that file only.
4. Bump the collection's `updated_at` once at the end, as the mock does.

**Done when**

- [ ] Uploading 12 phone photos shows the same progress UI and lands them first in the grid
- [ ] A corrupt file fails alone without leaving an orphan row or object
- [ ] Nothing is written to IndexedDB any more

### KEPT-22 · Keep search client-side for v0

- **Status:** Backlog · **Priority:** Low · **Estimate:** 1 pt · **Phase:** Library data
- **Labels:** data

**Why.** `ReferenceBrowser` filters the loaded list, which is instant at this size. No backend work until a library outgrows it; the tsvector column is already there for KEPT-34.

**Done when**

- [ ] Search behaves identically on real data

### KEPT-23 · Publish, rotate and unpublish in Postgres

- **Status:** Backlog · **Priority:** High · **Estimate:** 2 pt · **Phase:** Boards
- **Labels:** data, db
- **Blocked by:** KEPT-17
- **Blocks:** KEPT-24, KEPT-25, KEPT-28

**Why.** The share dialog's states (not shared, shared with a link, new link, unpublished) move from localStorage to `collection_shares`.

**Approach**

1. `getShare(id)` selects the share by collection.
2. RPC `publish_collection(collection)` makes a 10-character base36 token with `gen_random_bytes` (same format as the mock) and returns the share; idempotent.
3. RPC `rotate_share(collection)` replaces the token; the old one stops resolving at once.
4. `unpublishCollection` deletes the row.
5. `Share.owner` comes from the owner's `profiles.username`.

**Done when**

- [ ] The share dialog's copy, New link and Unpublish states render as today
- [ ] A rotated token 404s on the next board load

### KEPT-24 · Board Edge Function for signed-out visitors

- **Status:** Backlog · **Priority:** Urgent · **Estimate:** 3 pt · **Phase:** Boards
- **Labels:** edge function, storage, security
- **Blocked by:** KEPT-23, KEPT-3
- **Blocks:** KEPT-30

**Why.** Implements D-2. `/m/:token` has to work with no session, so it can't go through RLS as a user.

**Approach**

1. `supabase/functions/board`: GET `?token=`; with the service role, find the share → collection → refs with assets, tags and pins.
2. Return the `Board` shape (`collection`, `references`, `share`) with signed URLs (about an hour).
3. Unknown, rotated or unpublished tokens: 404 → the existing “This board isn't available” state.
4. Short `Cache-Control` (a minute) so unpublish takes effect quickly; never cache 404s long.
5. `getBoard(token)` calls the function without an auth header.

**Done when**

- [ ] The board and lightbox render identically, signed out, on another device
- [ ] Unpublish → the next load shows the unavailable state
- [ ] The response contains no owner email or ids beyond what the board shows

### KEPT-25 · Share links use kept.design

- **Status:** Backlog · **Priority:** Medium · **Estimate:** 1 pt · **Phase:** Boards
- **Labels:** ui
- **Blocked by:** KEPT-23

**Why.** `boardAbsoluteUrl()` builds links from the current origin, so preview deployments hand out preview URLs.

**Approach**

1. Add `VITE_PUBLIC_ORIGIN` (`https://kept.design` in production) and fall back to `window.location.origin`.
2. This is a kept-design-only helper; the sync rewrite keeps pointing kept-ui's share URL at it.

**Done when**

- [ ] Links copied from production are `https://kept.design/m/…`

### KEPT-26 · Store invite requests server-side

- **Status:** Backlog · **Priority:** High · **Estimate:** 2 pt · **Phase:** Invites
- **Labels:** db, security
- **Blocked by:** KEPT-9
- **Blocks:** KEPT-27, KEPT-30

**Why.** Today requests live only in the requester's browser, so you never see them. The form, its errors and the two confirmation states stay the same.

**Approach**

1. RPC `request_invite(name, email, note)`, SECURITY DEFINER, executable by anon: validate lengths and email shape, `insert … on conflict (email) do nothing`, return `{ alreadyRequested }`.
2. Honeypot field + a per-IP rate limit to keep bots out; add Turnstile later only if spam shows up.
3. `requestInvite()` in the repository calls the RPC.

**Done when**

- [ ] “You’re on the list.” and “You’re already on the list.” work across devices
- [ ] anon still can't select from `invite_requests`

### KEPT-27 · Tell you when someone asks for an invite

- **Status:** Backlog · **Priority:** Medium · **Estimate:** 2 pt · **Phase:** Invites
- **Labels:** edge function, ops
- **Blocked by:** KEPT-26

**Why.** A request nobody sees is the same as no request.

**Approach**

1. Database webhook on `invite_requests` insert → Edge Function `notify-invite` → email to you via Resend (or a Slack webhook).
2. Approving = KEPT-16's steps for their account, then set `status = 'invited'`.

**Done when**

- [ ] A test request reaches your inbox within a minute

### KEPT-28 · Seed moode-matcha into Storage

- **Status:** Backlog · **Priority:** High · **Estimate:** 3 pt · **Phase:** Move in and ship
- **Labels:** data, ops
- **Blocked by:** KEPT-21, KEPT-23, KEPT-16
- **Blocks:** KEPT-30

**Why.** Your real collection has to move from `public/collections/` and `data/moode-matcha.json` into your account.

**Approach**

1. `scripts/seed-moode-matcha.mjs`, run locally with the service-role key from `.env.local` (never committed).
2. Create the collection `moode-matcha` for `wade`, upload all 160 full and thumb files, insert refs and assets with the file facts from the JSON.
3. Publish it with the existing token `mm7q2x9kfa` so the board link you've already shared keeps working.
4. Idempotent: re-running skips what exists.

**Done when**

- [ ] Library shows 1 collection, 160 references with images
- [ ] `/m/mm7q2x9kfa` works signed out

### KEPT-29 · Environment variables and secrets

- **Status:** Backlog · **Priority:** Urgent · **Estimate:** 1 pt · **Phase:** Move in and ship
- **Labels:** infra, security
- **Blocked by:** KEPT-7
- **Blocks:** KEPT-31

**Why.** Only the publishable key may reach the browser.

**Approach**

1. Vercel (Production + Preview): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_PUBLIC_ORIGIN`.
2. Edge Function secrets: service-role key, Resend key.
3. Local: `.env.local` for the app and the seed script; `.env.example` committed without values.
4. Check the production bundle for anything that looks like a service key before the first deploy.

**Done when**

- [ ] `grep` of `dist/` finds no service-role key
- [ ] Previews without secrets fall back to the mocks (D-4)

### KEPT-30 · Verify: pixel parity, end-to-end and RLS

- **Status:** Backlog · **Priority:** Urgent · **Estimate:** 3 pt · **Phase:** Move in and ship
- **Labels:** security, ui
- **Blocked by:** KEPT-28, KEPT-24, KEPT-26
- **Blocks:** KEPT-31

**Why.** Real data mustn't change how anything looks, and the security model needs proof, not assumption.

**Approach**

1. Re-run the pixel sweep against kept-ui with the same collection seeded: every route and state identical (share URLs excepted).
2. End to end: sign in → TOTP → create collection → upload → pin → tag → notes → publish → open board signed out → New link → Unpublish → invite request.
3. RLS tests from KEPT-9 pass against the deployed project.
4. Log a health run (`health/log.csv`) for the release.

**Done when**

- [ ] All three pass on the production project before the domain switch

### KEPT-31 · Ship to kept.design

- **Status:** Backlog · **Priority:** Urgent · **Estimate:** 1 pt · **Phase:** Move in and ship
- **Labels:** ops
- **Blocked by:** KEPT-30, KEPT-29, KEPT-1

**Why.** The finish line for v0.

**Approach**

1. Merge to main → Vercel production deploy.
2. Point `kept.design` at the project; check `/`, `/library` (signed in), and a board signed out.
3. Tick “Ship to kept.design” in Kept's own To do page.

**Done when**

- [ ] kept.design serves the real app with real data

### KEPT-32 · Box annotations

- **Status:** Backlog · **Priority:** Low · **Estimate:** 5 pt · **Phase:** Later
- **Labels:** kept-ui first, ui

**Why.** Pins only today. The schema already allows `kind = 'box'` with `w`/`h`. Design the drag-to-draw interaction in kept-ui first.

### KEPT-33 · Rename references

- **Status:** Backlog · **Priority:** Low · **Estimate:** 2 pt · **Phase:** Later
- **Labels:** kept-ui first, ui

**Why.** Uploads take the file name as the title. Needs an editable title in kept-ui, then `updateReference` accepts `title`.

### KEPT-34 · Server-side search and a command palette

- **Status:** Backlog · **Priority:** Low · **Estimate:** 5 pt · **Phase:** Later
- **Labels:** db, ui

**Why.** When the library outgrows client filtering: an RPC over the `search` tsvector (titles, notes, tags, pin captions), and a Base UI Combobox palette designed in kept-ui.

### KEPT-35 · Board link previews

- **Status:** Backlog · **Priority:** Low · **Estimate:** 3 pt · **Phase:** Later
- **Labels:** edge function

**Why.** A preview card when a board link is pasted into a chat. A tiny OG endpoint for `/m/:token`, without moving the app to Next.js.

### KEPT-36 · Move images to R2 if Storage costs bite

- **Status:** Backlog · **Priority:** No priority · **Estimate:** 3 pt · **Phase:** Later
- **Labels:** storage, infra

**Why.** Out of scope for v0 by design. Revisit only if egress or storage costs become real.
