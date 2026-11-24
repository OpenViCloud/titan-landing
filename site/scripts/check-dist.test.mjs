import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { distProblems, isMain } from './check-dist.mjs';

const pages = ['index.html', 'vi/index.html', 'docs/index.html', 'vi/docs/index.html', '404.html'];
const required = [...pages, 'robots.txt', 'config.json', 'favicon.png', 'apple-touch-icon.png'];
// The head links as the landing and Starlight write them: attribute order and quoting differ between the two.
const iconHead = '<link rel="shortcut icon" href="/favicon.png" type="image/png"/><link rel="apple-touch-icon" href="/apple-touch-icon.png">';

function tree(files) {
  const root = mkdtempSync(join(tmpdir(), 'check-dist-'));
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  return root;
}

function dist(extra = {}) {
  const files = Object.fromEntries(required.map((path) => [path, pages.includes(path) ? `<head>${iconHead}</head> ${path}` : `file ${path}`]));
  return tree({ ...files, ...extra });
}

test('a dist that holds no doc passes, and the docs were compared', () => {
  const result = distProblems({ distDir: dist(), docsDir: tree({ 'features/vm/design.md': '# VM design' }), requireDocs: true });
  assert.deepEqual(result.problems, []);
  assert.equal(result.docsCompared, 1);
});

test('a dist file with the content of a doc is named', () => {
  const docsDir = tree({ 'features/vm/design.md': '# VM design' });
  const result = distProblems({ distDir: dist({ 'notes/design.txt': '# VM design' }), docsDir, requireDocs: true });
  assert.deepEqual(result.problems, ['notes/design.txt is a copy of docs/features/vm/design.md']);
});

test('a missing required page and a credential-like file fail without any docs', () => {
  const distDir = dist({ 'docs/credentials.local.md': 'password' });
  rmSync(join(distDir, '404.html'));
  const result = distProblems({ distDir, docsDir: undefined, requireDocs: false });
  assert.deepEqual(result.problems, ['missing 404.html', 'credential-like file: docs/credentials.local.md']);
  assert.equal(result.docsCompared, 0);
});

test('requiring docs with nothing to compare against fails (the check can fail)', () => {
  const docsDir = tree({});
  const result = distProblems({ distDir: dist(), docsDir, requireDocs: true });
  assert.deepEqual(result.problems, [`compared against 0 files in ${docsDir} — the copy check did not run`]);
});

// macOS /tmp is a symlink: a script run through it must still run its checks, not exit 0 having checked nothing.
test('the script run through a symlinked directory is still the main module', () => {
  const real = tree({ 'check.mjs': '', 'other.mjs': '' });
  const link = join(mkdtempSync(join(tmpdir(), 'check-dist-link-')), 'linked');
  symlinkSync(real, link);
  assert.equal(isMain(join(link, 'check.mjs'), pathToFileURL(join(real, 'check.mjs')).href), true);
  assert.equal(isMain(join(real, 'other.mjs'), pathToFileURL(join(real, 'check.mjs')).href), false);
});

// titan-ops features/public-site/design.md#brand-icon
test('a missing icon file is named', () => {
  const distDir = dist();
  rmSync(join(distDir, 'apple-touch-icon.png'));
  const result = distProblems({ distDir, docsDir: undefined, requireDocs: false });
  assert.deepEqual(result.problems, ['missing apple-touch-icon.png']);
});

test('a page whose head does not link the icons is named, once per missing link', () => {
  const distDir = dist({
    'docs/index.html': '<head><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png"></head>',
    '404.html': '<head><link rel="icon" href="/favicon.png"></head>',
  });
  const result = distProblems({ distDir, docsDir: undefined, requireDocs: false });
  assert.deepEqual(result.problems, [
    'docs/index.html does not link /favicon.png as its icon',
    '404.html does not link /apple-touch-icon.png as its apple-touch-icon',
  ]);
});

test('an icon link with the right file under another rel is not the icon (the check can fail)', () => {
  const distDir = dist({ 'vi/index.html': '<head><link rel="preload" href="/favicon.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png"></head>' });
  const result = distProblems({ distDir, docsDir: undefined, requireDocs: false });
  assert.deepEqual(result.problems, ['vi/index.html does not link /favicon.png as its icon']);
});
