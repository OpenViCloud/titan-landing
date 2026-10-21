import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { distProblems, isMain } from './check-dist.mjs';

const required = ['index.html', 'vi/index.html', 'docs/index.html', 'vi/docs/index.html', '404.html', 'robots.txt', 'config.json'];

function tree(files) {
  const root = mkdtempSync(join(tmpdir(), 'check-dist-'));
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  return root;
}

function dist(extra = {}) {
  return tree({ ...Object.fromEntries(required.map((path) => [path, `page ${path}`])), ...extra });
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
