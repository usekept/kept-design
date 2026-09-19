// Copies Kept's screens from the kept-ui lab into this repo, rewriting its `#/kept/...` hash
// routes into real paths. kept-ui is the source of truth and is only ever read, never written.
//
//   node scripts/sync-kept-ui.mjs [path/to/kept-ui]    (default: ../../Labs/kept-ui)
//
// Files that exist only here (tokens.css, inputs.css, navigate.ts) are left alone.

import { cpSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const lab = resolve(process.argv[2] ?? join(root, '../../Labs/kept-ui'));
const from = join(lab, 'src/kept');
const to = join(root, 'src/kept');
if (!existsSync(from)) throw new Error(`kept-ui not found at ${lab}`);

function rewrite(source, file) {
  let s = source
    // Share links: the board lives at /m/:token on this origin.
    .replace(
      '`${window.location.origin}${window.location.pathname}#/kept/m/${token}`',
      '`${window.location.origin}/m/${token}`',
    )
    .replace(/(['"`])#\/kept\//g, '$1/')
    .replace(/(['"`])#\/kept(['"`])/g, '$1/$2');

  // Hash assignments and redirects become history navigation.
  const before = s;
  s = s
    .replace(/window\.location\.hash = ([^;]+);/g, 'navigate($1);')
    .replace(/window\.location\.replace\(([^)]+)\);/g, "navigate($1, 'replace');");
  if (s !== before) s = addImport(s, "import { navigate } from './navigate.ts';");

  if (file === 'KeptApp.tsx') s = s.replace(/^\/\/ Kept v0 recreation, lab-only\..*\n/m, '// Kept, synced from the kept-ui lab (scripts/sync-kept-ui.mjs). Routes are real paths.\n');

  const leftover = s.match(/.*#\/kept.*/g);
  if (leftover) throw new Error(`${file}: unrewritten hash route:\n${leftover.join('\n')}`);
  return s;
}

function addImport(s, line) {
  if (s.includes(line)) return s;
  const imports = [...s.matchAll(/^import [^;]+;\n/gm)];
  const last = imports.at(-1);
  const at = last ? last.index + last[0].length : 0;
  return s.slice(0, at) + line + '\n' + s.slice(at);
}

for (const file of readdirSync(from)) {
  const src = join(from, file);
  if (/\.(tsx?|css)$/.test(file)) {
    const text = readFileSync(src, 'utf8');
    writeFileSync(join(to, file), /\.tsx?$/.test(file) ? rewrite(text, file) : text);
  } else {
    cpSync(src, join(to, file), { recursive: true });
  }
  console.log(`synced ${file}`);
}

// Imported collection images (served from /collections/...).
cpSync(join(lab, 'public/collections'), join(root, 'public/collections'), { recursive: true });
console.log('synced public/collections');
