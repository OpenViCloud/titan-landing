// Read once at start: the persona file, the customer docs (docs/ is English, vi/ is Vietnamese, as in
// site/src/content/docs/), and the READMEs that scripts/sync-readmes.sh copied. A missing piece stops the start.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const LANG_DIRS = { en: 'docs', vi: 'vi' };

function pages(dir) {
  const found = [];
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) found.push(...pages(path));
    else if (name.endsWith('.md') || name.endsWith('.mdx')) found.push(path);
  }
  return found;
}

function joinPages(dir) {
  const files = pages(dir);
  if (files.length === 0) throw new Error(`no doc page in ${dir}`);
  return files.map((f) => `===== ${relative(dir, f)} =====\n${readFileSync(f, 'utf8')}`).join('\n\n');
}

export function loadKnowledge({ docsDir, readmesDir, personaPath }) {
  const docs = {};
  for (const [lang, sub] of Object.entries(LANG_DIRS)) docs[lang] = joinPages(join(docsDir, sub));
  const readmeFiles = readdirSync(readmesDir).filter((n) => n.endsWith('.md')).sort();
  if (readmeFiles.length === 0) throw new Error(`no README in ${readmesDir}`);
  const readmes = readmeFiles
    .map((n) => `===== README of ${n.replace(/\.md$/, '')} =====\n${readFileSync(join(readmesDir, n), 'utf8')}`)
    .join('\n\n');
  return { persona: readFileSync(personaPath, 'utf8'), docs, readmes };
}
