// Generate kebab-case slugs for each nominee in app/public/data/episode.json.
// Rules (CONTRACTS.md §2 + brief): drop honorifics/titles, ASCII-fold apostrophes,
// strip OCR annotations. Idempotent — safe to re-run.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, '..', 'app', 'public', 'data', 'episode.json');

const HONORIFICS = [
  /^hon\.?\s*/i,
  /^dr\.?\s*/i,
  /^mr\.?\s*/i,
  /^ms\.?\s*/i,
  /^mrs\.?\s*/i,
  /^prof\.?\s*/i,
  /^eng\.?\s*/i,
  /^sen\.?\s*/i,
];

// Trailing/inline titles and OCR annotations to drop entirely.
const STRIP_PATTERNS = [
  /\((?:prof|dr)\.?\)/gi,           // (Prof), (Dr.)
  /\(OCR:[^)]*\)/gi,                // (OCR: 'Miongo Barasa')
  /\bEGH\b/gi,                      // order of merit post-nominal
  /\bCBS\b/gi,
  /\bMGH\b/gi,
];

export function slugifyName(name) {
  let s = name;
  for (const p of STRIP_PATTERNS) s = s.replace(p, ' ');
  let changed = true;
  while (changed) {
    changed = false;
    for (const h of HONORIFICS) {
      const before = s;
      s = s.replace(h, '');
      if (s !== before) changed = true;
    }
  }
  // ASCII-fold apostrophes (Lang'at -> langat, Ng'ongo -> ngongo)
  s = s
    .replace(/['\u2018\u2019\u02BC]/g, '')
    .replace(/[\u00C0-\u00FF]/g, (c) => c.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const ep = JSON.parse(readFileSync(FILE, 'utf8'));
const used = new Map();
for (const n of ep.nominees) {
  let slug = slugifyName(n.name);
  if (!slug) throw new Error(`empty slug for ${n.id}`);
  const seen = used.get(slug);
  if (seen) throw new Error(`slug collision: "${slug}" for ${n.id} and ${seen}`);
  used.set(slug, n.id);
  n.slug = slug;
  console.log(`${n.id}  ${n.name}  ->  ${slug}`);
}
writeFileSync(FILE, JSON.stringify(ep, null, 2) + '\n');
console.log(`\nWrote slugs for ${ep.nominees.length} nominees to ${FILE}`);
