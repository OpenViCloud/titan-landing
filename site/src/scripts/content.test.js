import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { copy } from '../i18n/landing.js';

// The docs exist once per language with the same English slugs, and every link inside the site goes to a page
// or a landing anchor that exists (docs/features/public-site/design.md#site-language). Nothing else checks these
// links: docs/check-links.py only follows links to repo markdown files.

const srcDir = fileURLToPath(new URL('..', import.meta.url));
const docsRoot = join(srcDir, 'content', 'docs');
const enDir = join(docsRoot, 'docs');
const viDir = join(docsRoot, 'vi', 'docs');

function walk(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) files.push(...walk(path));
    else files.push(path);
  }
  return files;
}

// docs/guides/vm.md -> /docs/guides/vm/ ; docs/index.md -> /docs/
function pageUrl(prefix, dir, file) {
  const slug = relative(dir, file).replace(/\.mdx?$/, '');
  if (slug === 'index') return `${prefix}docs/`;
  return `${prefix}docs/${slug}/`;
}

function pages() {
  const urls = new Set();
  for (const file of walk(enDir)) urls.add(pageUrl('/', enDir, file));
  for (const file of walk(viDir)) urls.add(pageUrl('/vi/', viDir, file));
  return urls;
}

const landing = readFileSync(join(srcDir, 'components', 'Landing.astro'), 'utf8');
const landingAnchors = new Set([...landing.matchAll(/\sid="([a-z0-9-]+)"/g)].map((match) => match[1]));

// Returns the links that point nowhere: a docs page that does not exist, or a landing anchor that is not there.
export function brokenLinks(links, knownPages, anchors) {
  const broken = [];
  for (const link of links) {
    const [path, anchor] = link.split('#');
    if (path === '/' || path === '/vi/') {
      if (anchor !== undefined && !anchors.has(anchor)) broken.push(link);
      continue;
    }
    if (path.startsWith('/docs/') || path.startsWith('/vi/docs/')) {
      if (!knownPages.has(path)) broken.push(link);
    }
  }
  return broken;
}

function markdownLinks(file) {
  return [...readFileSync(file, 'utf8').matchAll(/\]\((\/[^)\s]*)\)/g)].map((match) => match[1]);
}

function copyLinks(value) {
  if (typeof value === 'string') return value.startsWith('/') ? [value] : [];
  if (Array.isArray(value)) return value.flatMap(copyLinks);
  if (value !== null && typeof value === 'object') return Object.values(value).flatMap(copyLinks);
  return [];
}

test('the docs are not empty in either language', () => {
  assert.ok(walk(enDir).length >= 10);
  assert.ok(walk(viDir).length >= 10);
});

test('every docs page exists in English and in Vietnamese with the same slug', () => {
  const en = walk(enDir).map((file) => relative(enDir, file)).sort();
  const vi = walk(viDir).map((file) => relative(viDir, file)).sort();
  assert.deepEqual(vi, en);
});

test('file names and slugs are lower-case ASCII words', () => {
  const bad = [...walk(enDir), ...walk(viDir)]
    .map((file) => relative(docsRoot, file))
    .filter((path) => !/^(vi\/)?docs\/([a-z0-9]+(-[a-z0-9]+)*\/)*[a-z0-9]+(-[a-z0-9]+)*\.md$/.test(path));
  assert.deepEqual(bad, []);
});

test('the link check finds a planted broken link (the check can fail)', () => {
  const known = new Set(['/docs/', '/docs/guides/vm/']);
  const broken = brokenLinks(['/docs/guides/vm/', '/docs/huong-dan/vm/', '/#pricing', '/#bang-gia'], known, new Set(['pricing']));
  assert.deepEqual(broken, ['/docs/huong-dan/vm/', '/#bang-gia']);
});

test('every link in the docs points to a page or landing anchor that exists', () => {
  const known = pages();
  const links = [...walk(enDir), ...walk(viDir)].flatMap(markdownLinks);
  assert.ok(links.length > 30, `expected the docs to link to each other, found ${links.length} links`);
  assert.deepEqual(brokenLinks(links, known, landingAnchors), []);
});

// The CLI downloads are one set of files for both languages (docs/features/cli/design.md#cli-download).
// The CLI is downloaded from its own repository's latest release (docs/features/cli/design.md#cli-download).
const cliRelease = 'https://github.com/OpenViCloud/cli/releases/latest/download/';

test('English docs link to English pages and Vietnamese docs to Vietnamese pages', () => {
  const wrong = [];
  for (const file of walk(enDir)) for (const link of markdownLinks(file)) if (link.startsWith('/vi/')) wrong.push(`${relative(docsRoot, file)} -> ${link}`);
  for (const file of walk(viDir)) for (const link of markdownLinks(file)) if (!link.startsWith('/vi/')) wrong.push(`${relative(docsRoot, file)} -> ${link}`);
  assert.deepEqual(wrong, []);
});

// What each CLI page links to, and every asset a CLI release carries (.goreleaser.yaml of OpenViCloud/cli): a link
// to any other name is a 404.
const linkedFiles = ['SHA256SUMS', 'openvicloud-darwin-amd64', 'openvicloud-darwin-arm64', 'openvicloud-linux-amd64',
  'openvicloud-linux-arm64', 'openvicloud-windows-amd64.exe', 'openvicloud-windows-arm64.exe'];
const releaseAssets = [...linkedFiles, 'SHA256SUMS.sig'].map((name) => `${cliRelease}${name}`);

function releaseLinks(file) {
  return [...readFileSync(file, 'utf8').matchAll(/\]\((https:\/\/github\.com\/OpenViCloud\/cli\/releases\/latest\/download\/[^)\s]*)\)/g)].map((match) => match[1]);
}

test('every download link in the docs names an asset of the CLI release', () => {
  const links = [...walk(enDir), ...walk(viDir)].flatMap(releaseLinks);
  assert.ok(links.length >= linkedFiles.length * 2, `expected both CLI pages to link every download, found ${links.length}`);
  assert.deepEqual(links.filter((link) => !releaseAssets.includes(link)), []);
});

test('every link of the landing dictionary points to a page or anchor that exists', () => {
  const links = [...copyLinks(copy.en), ...copyLinks(copy.vi)];
  assert.ok(links.length > 10);
  assert.deepEqual(brokenLinks(links, pages(), landingAnchors), []);
});

test('every page in the sidebar exists', () => {
  const config = readFileSync(join(srcDir, '..', 'astro.config.mjs'), 'utf8');
  const slugs = [...config.matchAll(/slug: '([^']+)'/g)].map((match) => `/${match[1]}/`);
  assert.ok(slugs.length >= 12);
  assert.deepEqual(brokenLinks(slugs, pages(), landingAnchors), []);
});

test('the landing has the anchors its links use', () => {
  for (const anchor of ['pricing', 'features', 'cli', 'get-started', 'limitations', 'faq']) assert.ok(landingAnchors.has(anchor), anchor);
});

// The lines inside the fenced code blocks of a markdown page.
export function codeLines(markdown) {
  const lines = [];
  let inside = false;
  for (const line of markdown.split('\n')) {
    if (line.trimStart().startsWith('```')) inside = !inside;
    else if (inside) lines.push(line.trim());
  }
  return lines;
}

const cliPage = { en: join(enDir, 'guides', 'cli.md'), vi: join(viDir, 'guides', 'cli.md') };

test('the command check finds a command the CLI page does not show (the check can fail)', () => {
  const lines = codeLines('Text\n\n```bash\nopenvicloud auth login\n```\n\nopenvicloud network create x\n');
  const missing = ['openvicloud auth login', 'openvicloud network create x'].filter((command) => !lines.includes(command));
  assert.deepEqual(missing, ['openvicloud network create x']);
});

// The landing's CLI panel copies commands from the CLI page, which lists only what main has
// (docs/features/cli/design.md#cli-download).
test('every command on the landing CLI panel is a line of a code block of the CLI page in the same language', () => {
  for (const lang of ['en', 'vi']) {
    const commands = copy[lang].cli.commands;
    assert.ok(commands.length >= 3, lang);
    const lines = codeLines(readFileSync(cliPage[lang], 'utf8'));
    assert.deepEqual(commands.filter((command) => !lines.includes(command)), [], lang);
  }
});

test('the CLI page shows the one-line install the landing shows, on the staging site', () => {
  for (const lang of ['en', 'vi']) {
    const line = copy[lang].cli.installCommand.replace('{site}', 'https://site-staging.openvicloud.com');
    assert.ok(codeLines(readFileSync(cliPage[lang], 'utf8')).includes(line), `${lang}: ${line}`);
  }
});
