// Builds the readable copies of the backend roadmap from its data.
//
//   node scripts/roadmap.mjs
//
// Source:    docs/roadmap/roadmap.json   (edit this: statuses, decisions, new issues)
// Generated: docs/roadmap/ROADMAP.md     (for agents and GitHub)
//            docs/roadmap/index.html     (the tracker page, read-only, data embedded)
//
// The live, editable tracker is a claude.ai artifact; this repo copy is synced from it and back.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(resolve(dirname(fileURLToPath(import.meta.url)), '..'), 'docs/roadmap');
const data = JSON.parse(readFileSync(join(dir, 'roadmap.json'), 'utf8'));
const { projects, decisions, issues } = data;

const STATUS = {
  in_progress: 'In progress', in_review: 'In review', todo: 'Todo',
  backlog: 'Backlog', done: 'Done', canceled: 'Canceled',
};
const PRIORITY = { 1: 'Urgent', 2: 'High', 3: 'Medium', 4: 'Low', 0: 'No priority' };

// Catch typos before they reach either copy.
const keys = new Set(issues.map((i) => i.key));
for (const i of issues) {
  if (!STATUS[i.status]) throw new Error(`${i.key}: unknown status "${i.status}"`);
  if (!(i.priority in PRIORITY)) throw new Error(`${i.key}: unknown priority "${i.priority}"`);
  if (!projects.some((p) => p.id === i.project)) throw new Error(`${i.key}: unknown phase "${i.project}"`);
  for (const b of i.blockedBy ?? []) if (!keys.has(b)) throw new Error(`${i.key}: blocked by unknown ${b}`);
}
for (const d of decisions) {
  if (d.chosen && !d.options.some((o) => o.id === d.chosen)) throw new Error(`${d.key}: unknown choice "${d.chosen}"`);
}

const blocks = (key) => issues.filter((i) => (i.blockedBy ?? []).includes(key)).map((i) => i.key);
const live = issues.filter((i) => i.status !== 'canceled');
const doneCount = live.filter((i) => i.status === 'done').length;

// ── Markdown ──
const md = [];
md.push('# Kept backend roadmap', '');
md.push('> Generated from `docs/roadmap/roadmap.json` by `node scripts/roadmap.mjs`. Edit the JSON, not this file.', '');
md.push('Wire Kept\'s finished UI (a pixel copy of the kept-ui lab) to Supabase: Postgres, Auth, Storage and two Edge Functions, behind the exact functions the screens already call, so no screen changes.', '');
md.push(`**Progress:** ${doneCount} of ${live.length} issues done.`, '');

md.push('## How it fits together', '', '```text',
  'Browser · kept.design (Vite SPA, same screens as kept-ui)',
  '│',
  '├── supabase-js  (publishable key, user JWT)',
  '│     ├── Auth      password + TOTP → AAL2; signup off',
  '│     ├── Postgres  RLS on every table: owner_id = auth.uid() AND aal2',
  '│     └── Storage   private bucket kept-assets/<owner>/<ref>/{full,thumb}.jpg',
  '│',
  '├── Edge Function  sign-in   username → email, then password sign-in',
  '└── Edge Function  board     /m/:token → rows + short-lived signed image URLs',
  '                             (the only path that works signed out)',
  '```', '');

md.push('## The seam', '', 'What each function in `src/kept/session.ts` and `src/kept/repository.ts` becomes.', '',
  '| Function | Backed by | Issue |', '| --- | --- | --- |',
  '| `getSession()` | Cached Supabase session + AAL, read synchronously after boot | KEPT-13 |',
  '| `signInWithPassword(username, password)` | Edge Function `sign-in` → `auth.setSession()` | KEPT-12 |',
  '| `completeMfaForLab()` | Replaced by TOTP enroll / verify | KEPT-15 |',
  '| `signOut()` | `auth.signOut()` | KEPT-13 |',
  '| `listCollections()` · `getCollection(id)` | `collection_summaries` view, slug as the id | KEPT-18 |',
  '| `createCollection(name)` · `updateCollection(id, patch)` | RPC `create_collection` · update on `collections` | KEPT-18 |',
  '| `listReferences(id)` · `listAllReferences()` | One nested select + batched signed URLs | KEPT-19 |',
  '| `updateReference(cid, rid, patch)` | Notes update; RPCs `set_ref_tags`, `set_ref_pins` | KEPT-20 |',
  '| `addUploads(cid, files, onProgress)` | On-device resize → rows → Storage uploads | KEPT-21 |',
  '| `getShare` · `publishCollection` · `rotateShare` · `unpublishCollection` | `collection_shares` + token RPCs | KEPT-23 |',
  '| `getBoard(token)` | Edge Function `board` (no sign-in) | KEPT-24 |',
  '| `requestInvite(request)` | RPC `request_invite` (anon) | KEPT-26 |', '');

md.push('## Ground rules', '',
  '- kept-ui is the source of truth and is never written to from here. New screens (two-factor, later box annotations and renaming) are designed there first, then synced.',
  '- `npm run sync-kept-ui` must never overwrite the real data layer (KEPT-6).',
  '- Same function names and return shapes. If kept-ui changes a shape, the typecheck fails before anything ships.',
  '- Only the publishable key reaches the browser. The service-role key lives in Edge Function secrets and a local seed script, never behind a `VITE_` prefix.',
  '- Without Supabase env vars the app falls back to the mocks (D-4).',
  '- The pixel sweep is re-run once real data flows: the UI must still match kept-ui.', '');

md.push('## Decisions', '');
for (const d of decisions) {
  const chosen = d.options.find((o) => o.id === d.chosen);
  md.push(`### ${d.key} · ${d.title} — ${chosen ? `**Decided: ${chosen.label}**` : 'Open'}`, '', d.question, '');
  for (const o of d.options) {
    const tags = [o.id === d.recommended ? 'recommended' : '', o.id === d.chosen ? 'chosen' : ''].filter(Boolean);
    md.push(`- **${o.label}**${tags.length ? ` _(${tags.join(', ')})_` : ''}: ${o.detail}`);
  }
  md.push('');
}

md.push('## Phases', '');
for (const p of projects) {
  const list = issues.filter((i) => i.project === p.id);
  const pd = list.filter((i) => i.status === 'done').length;
  md.push(`### ${p.name} (${pd}/${list.filter((i) => i.status !== 'canceled').length})`, '', `${p.summary} _Target: ${p.target}._`, '');
  for (const i of list) md.push(`- ${i.status === 'done' ? '[x]' : '[ ]'} **${i.key}** ${i.title} — ${STATUS[i.status]}, ${PRIORITY[i.priority]}`);
  md.push('');
}

md.push('## Issues', '');
for (const i of issues) {
  const p = projects.find((x) => x.id === i.project);
  md.push(`### ${i.key} · ${i.title}`, '');
  md.push(`- **Status:** ${STATUS[i.status]} · **Priority:** ${PRIORITY[i.priority]} · **Estimate:** ${i.estimate ? `${i.estimate} pt` : '—'} · **Phase:** ${p.name}`);
  if (i.labels?.length) md.push(`- **Labels:** ${i.labels.join(', ')}`);
  if (i.blockedBy?.length) md.push(`- **Blocked by:** ${i.blockedBy.join(', ')}`);
  const b = blocks(i.key);
  if (b.length) md.push(`- **Blocks:** ${b.join(', ')}`);
  md.push('');
  if (i.summary) md.push('**Why.** ' + i.summary, '');
  if (i.steps?.length) md.push('**Approach**', '', ...i.steps.map((s, n) => `${n + 1}. ${s}`), '');
  if (i.code) md.push('**Sketch**', '', '```text', i.code, '```', '');
  if (i.acceptance?.length) md.push('**Done when**', '', ...i.acceptance.map((s) => `- [${i.status === 'done' ? 'x' : ' '}] ${s}`), '');
  if (i.notes) md.push('**Notes.** ' + i.notes, '');
}
writeFileSync(join(dir, 'ROADMAP.md'), md.join('\n'));

// ── Tracker page (read-only copy with the data embedded) ──
const tracker = readFileSync(join(dir, 'tracker.html'), 'utf8');
const json = JSON.stringify(data).replace(/</g, '\\u003c');
const html = `<!doctype html>
<!-- Generated by scripts/roadmap.mjs from tracker.html + roadmap.json. Edit those, not this file. -->
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${tracker.replace(/<script>/, `<script type="application/json" id="roadmap-data">${json}</script>\n<script>`).replace('<div class="app">', '</head>\n<body>\n<div class="app">')}
</body>
</html>
`;
writeFileSync(join(dir, 'index.html'), html);

console.log(`roadmap: ${issues.length} issues, ${decisions.length} decisions, ${doneCount}/${live.length} done`);
