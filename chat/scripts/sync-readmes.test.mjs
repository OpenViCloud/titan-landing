import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const REPOS = ['titan-cli', 'terraform-provider-openvicloud', 'titan-control-plane', 'titan-incus-worker', 'titan-cloud-console'];

// A gh that answers from a folder: <repo>.sha holds the head of main, <repo>.md its README.
const FAKE_GH = `#!/bin/bash
repo=$(echo "$2" | sed -E 's#repos/OpenViCloud/([^/]+)/.*#\\1#')
case "$2" in
  */commits/main) cat "$FAKE_GH_DIR/$repo.sha" ;;
  */contents/README.md*) [ -f "$FAKE_GH_DIR/$repo.md" ] && cat "$FAKE_GH_DIR/$repo.md" || exit 1 ;;
  *) exit 1 ;;
esac
`;

function workspace() {
  const root = mkdtempSync(join(tmpdir(), 'sync-readmes-'));
  mkdirSync(join(root, 'scripts'));
  copyFileSync(join(here, 'sync-readmes.sh'), join(root, 'scripts', 'sync-readmes.sh'));
  const bin = join(root, 'bin');
  mkdirSync(bin);
  writeFileSync(join(bin, 'gh'), FAKE_GH);
  chmodSync(join(bin, 'gh'), 0o755);
  const remote = join(root, 'remote');
  mkdirSync(remote);
  for (const [i, repo] of REPOS.entries()) {
    writeFileSync(join(remote, `${repo}.sha`), `${String(i).repeat(40)}\n`);
    writeFileSync(join(remote, `${repo}.md`), `# ${repo}\n`);
  }
  const run = (...args) => spawnSync('bash', [join(root, 'scripts', 'sync-readmes.sh'), ...args], {
    env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, FAKE_GH_DIR: remote },
    encoding: 'utf8',
  });
  return { root, remote, run };
}

test('a sync copies the README of exactly the five repositories and names each commit', () => {
  const { root, run } = workspace();
  assert.equal(run().status, 0);
  assert.deepEqual(readdirSync(join(root, 'knowledge', 'readmes')).sort(), REPOS.map((r) => `${r}.md`).sort());
  const source = readFileSync(join(root, 'knowledge', 'SOURCE'), 'utf8').trim().split('\n');
  assert.deepEqual(source.map((line) => line.split(' ')[0]), REPOS);
  assert.match(source[0], /^titan-cli 0{40}$/);
});

test('--check passes on a fresh copy and exits 1 once a README changed', () => {
  const { remote, run } = workspace();
  run();
  const same = run('--check');
  assert.equal(same.status, 0, same.stderr);
  assert.match(same.stdout, /READMES_CHECK=MATCH/);
  writeFileSync(join(remote, 'titan-cli.md'), '# titan-cli\nnew line\n');
  const changed = run('--check');
  assert.equal(changed.status, 1);
  assert.match(changed.stdout, /READMES_CHECK=DIFFER/);
});

test('a repository without a README exits 2 and leaves the copy as it was', () => {
  const { root, remote, run } = workspace();
  run();
  const before = readFileSync(join(root, 'knowledge', 'SOURCE'), 'utf8');
  writeFileSync(join(remote, 'titan-incus-worker.sha'), `${'f'.repeat(40)}\n`);
  spawnSync('rm', [join(remote, 'titan-incus-worker.md')]);
  assert.equal(run().status, 2);
  assert.equal(readFileSync(join(root, 'knowledge', 'SOURCE'), 'utf8'), before);
});
