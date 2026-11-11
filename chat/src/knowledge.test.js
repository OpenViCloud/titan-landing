import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadKnowledge } from './knowledge.js';

function tree() {
  const root = mkdtempSync(join(tmpdir(), 'knowledge-'));
  mkdirSync(join(root, 'docs', 'docs', 'guides'), { recursive: true });
  mkdirSync(join(root, 'docs', 'vi', 'guides'), { recursive: true });
  mkdirSync(join(root, 'readmes'));
  writeFileSync(join(root, 'docs', 'docs', 'index.md'), '---\ntitle: Start\n---\nEN start');
  writeFileSync(join(root, 'docs', 'docs', 'guides', 'vm.mdx'), 'EN vm guide');
  writeFileSync(join(root, 'docs', 'docs', 'guides', 'notes.txt'), 'not a doc');
  writeFileSync(join(root, 'docs', 'vi', 'index.md'), 'VI bắt đầu');
  writeFileSync(join(root, 'readmes', 'titan-cli.md'), '# titan-cli');
  writeFileSync(join(root, 'readmes', 'titan-control-plane.md'), '# control plane');
  writeFileSync(join(root, 'persona.md'), 'You are the OpenViCloud assistant.');
  return root;
}

test('the knowledge holds the persona, every doc page of each language and every README', () => {
  const root = tree();
  const k = loadKnowledge({ docsDir: join(root, 'docs'), readmesDir: join(root, 'readmes'), personaPath: join(root, 'persona.md') });
  assert.equal(k.persona, 'You are the OpenViCloud assistant.');
  assert.ok(k.docs.en.includes('EN start') && k.docs.en.includes('EN vm guide'));
  assert.ok(!k.docs.en.includes('not a doc'));
  assert.ok(!k.docs.en.includes('VI bắt đầu'));
  assert.ok(k.docs.vi.includes('VI bắt đầu'));
  assert.ok(k.readmes.includes('# titan-cli') && k.readmes.includes('# control plane'));
});

test('each page is headed by its path, so the model can tell pages apart', () => {
  const root = tree();
  const k = loadKnowledge({ docsDir: join(root, 'docs'), readmesDir: join(root, 'readmes'), personaPath: join(root, 'persona.md') });
  assert.match(k.docs.en, /===== guides\/vm\.mdx =====/);
  assert.match(k.readmes, /===== README of titan-cli =====/);
});

test('a missing folder or an empty language stops the service at start, not at the first question', () => {
  const root = tree();
  assert.throws(() => loadKnowledge({ docsDir: join(root, 'nope'), readmesDir: join(root, 'readmes'), personaPath: join(root, 'persona.md') }));
  mkdirSync(join(root, 'empty', 'docs'), { recursive: true });
  mkdirSync(join(root, 'empty', 'vi'), { recursive: true });
  assert.throws(() => loadKnowledge({ docsDir: join(root, 'empty'), readmesDir: join(root, 'readmes'), personaPath: join(root, 'persona.md') }), /no doc page/);
});
