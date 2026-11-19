import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { copy } from '../i18n/landing.js';
import { breakSegments } from './terminal.js';

const here = dirname(fileURLToPath(import.meta.url));
const landing = readFileSync(join(here, '..', 'components', 'Landing.astro'), 'utf8');

test('a URL breaks after each single / and after ?, not between the two slashes of the scheme', () => {
  assert.deepEqual(breakSegments('  https://auth.openvicloud.com/auth/realms/titan/device?user_code=KDPW-RTMX'), [
    '  https://auth.openvicloud.com/', 'auth/', 'realms/', 'titan/', 'device?', 'user_code=KDPW-RTMX',
  ]);
});

test('a line with no / ? or & is one segment', () => {
  assert.deepEqual(breakSegments('Status:       Running'), ['Status:       Running']);
});

test('an & is a break point too', () => {
  assert.deepEqual(breakSegments('a?b=1&c=2'), ['a?', 'b=1&', 'c=2']);
});

test('the segments of every output line of the CLI panel join back to the line', () => {
  for (const lang of Object.keys(copy)) {
    for (const step of copy[lang].cli.session) {
      for (const line of step.output) assert.equal(breakSegments(line).join(''), line, `${lang}: ${line}`);
    }
  }
});

// No output line may be cut on a wide screen. pre-wrap keeps the spaces that align `vm create`'s values;
// overflow-wrap: anywhere breaks a token only when its line has no other break point.
test('the .term-out rule is pre-wrap with overflow-wrap: anywhere and no word-break', () => {
  const rule = landing.match(/\.terminal \.term-out \{([^}]*)\}/);
  assert.ok(rule, 'Landing.astro has a .terminal .term-out rule');
  assert.match(rule[1], /white-space:\s*pre-wrap/);
  assert.match(rule[1], /overflow-wrap:\s*anywhere/);
  assert.doesNotMatch(rule[1], /word-break/);
});

test('both CLI panels render each output line as its segments with a <wbr> between them', () => {
  const rendered = landing.match(/<span class="term-out">\{breakSegments\(line\)\.map\(\(piece, index\) => index === 0 \? piece : <><wbr \/>\{piece\}<\/>\)\}<\/span>/g) ?? [];
  assert.equal(rendered.length, 2, 'hero tab CLI and #cli');
  assert.doesNotMatch(landing, /<span class="term-out">\{line\}<\/span>/);
});
