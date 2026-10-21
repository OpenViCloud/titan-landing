import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// public/install.sh run by a real `sh` from stdin, as `curl … | sh` runs it, with `uname` and `curl` replaced by
// scripts in PATH: the test picks the machine and serves the CLI's release from a folder
// (docs/features/cli/design.md#install-script).

const scriptPath = fileURLToPath(new URL('../../public/install.sh', import.meta.url));
const release = 'https://github.com/OpenViCloud/cli/releases/latest/download';
const guide = 'https://github.com/OpenViCloud/cli#install';
const downloads = [
  'openvicloud-darwin-amd64', 'openvicloud-darwin-arm64', 'openvicloud-linux-amd64', 'openvicloud-linux-arm64',
  'openvicloud-windows-amd64.exe', 'openvicloud-windows-arm64.exe',
];

function script() {
  return readFileSync(scriptPath, 'utf8');
}

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

// A machine: `uname -s`/`-m` answers, a served downloads folder, a home, and the system bin folder in one of
// three shapes. Returns what a run needs and what it leaves behind.
function machine({ os = 'Linux', arch = 'x86_64', system = 'writable', tamper = null, unlisted = null } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'install-test-'));
  const stubs = join(root, 'stubs');
  const served = join(root, 'served');
  const home = join(root, 'home');
  const systemBin = join(root, 'system-bin');
  const curlLog = join(root, 'curl.log');
  mkdirSync(stubs);
  mkdirSync(served);
  mkdirSync(home);

  const sums = [];
  for (const name of downloads) {
    const body = `#!/bin/sh\necho "${name} 0.0.0-test"\n`;
    writeFileSync(join(served, name), tamper === name ? `${body}# changed\n` : body);
    if (unlisted !== name) sums.push(`${sha256(body)}  ${name}`);
  }
  writeFileSync(join(served, 'SHA256SUMS'), `${sums.join('\n')}\n`);

  writeFileSync(join(stubs, 'uname'), `#!/bin/sh\ncase "$1" in\n  -s) echo '${os}' ;;\n  -m) echo '${arch}' ;;\n  *) echo '${os}' ;;\nesac\n`);
  writeFileSync(join(stubs, 'curl'), [
    '#!/bin/sh',
    `echo "$*" >> '${curlLog}'`,
    'out=""; url=""',
    'while [ $# -gt 0 ]; do',
    '  case "$1" in',
    '    -o) out="$2"; shift 2 ;;',
    '    -*) shift ;;',
    '    *) url="$1"; shift ;;',
    '  esac',
    'done',
    `case "$url" in '${release}/'*) ;; *) exit 22 ;; esac`,
    'name="${url##*/}"',
    `[ -f '${served}'/"$name" ] || exit 22`,
    `cp '${served}'/"$name" "$out"`,
    '',
  ].join('\n'));
  chmodSync(join(stubs, 'uname'), 0o755);
  chmodSync(join(stubs, 'curl'), 0o755);

  if (system === 'writable') mkdirSync(systemBin);
  if (system === 'read-only') {
    mkdirSync(systemBin);
    chmodSync(systemBin, 0o555);
  }

  const env = { PATH: `${stubs}:/usr/bin:/bin`, HOME: home, OPENVICLOUD_SYSTEM_BIN: systemBin };
  return {
    env,
    systemBin,
    localBin: join(home, '.local', 'bin'),
    curlCalls: () => (existsSync(curlLog) ? readFileSync(curlLog, 'utf8').trim().split('\n') : []),
  };
}

function run(m, script, extraPath = null) {
  const env = { ...m.env };
  if (extraPath !== null) env.PATH = `${extraPath}:${env.PATH}`;
  const result = spawnSync('sh', [], { input: script, env, encoding: 'utf8' });
  return { code: result.status, out: `${result.stdout}${result.stderr}` };
}

function installedIn(dir) {
  return join(dir, 'openvicloud');
}

const machines = [
  ['Darwin', 'arm64', 'openvicloud-darwin-arm64'],
  ['Darwin', 'x86_64', 'openvicloud-darwin-amd64'],
  ['Linux', 'x86_64', 'openvicloud-linux-amd64'],
  ['Linux', 'aarch64', 'openvicloud-linux-arm64'],
  ['Linux', 'amd64', 'openvicloud-linux-amd64'],
];

for (const [os, arch, file] of machines) {
  test(`${os} ${arch} installs ${file} from the CLI's latest release and runs it`, () => {
    const m = machine({ os, arch });
    const result = run(m, script());
    assert.equal(result.code, 0, result.out);
    const target = installedIn(m.systemBin);
    assert.equal(readFileSync(target, 'utf8'), `#!/bin/sh\necho "${file} 0.0.0-test"\n`);
    assert.match(result.out, new RegExp(`Installed .*${target.replaceAll('/', '\\/')}`));
    assert.match(result.out, new RegExp(`${file} 0\\.0\\.0-test`), 'prints the version of what it installed');
    assert.ok(m.curlCalls().some((call) => call.endsWith(`${release}/${file}`)), m.curlCalls().join('\n'));
    assert.ok(m.curlCalls().some((call) => call.endsWith(`${release}/SHA256SUMS`)), m.curlCalls().join('\n'));
  });
}

test('a download that does not match SHA256SUMS installs nothing', () => {
  const m = machine({ tamper: 'openvicloud-linux-amd64' });
  const result = run(m, script());
  assert.notEqual(result.code, 0);
  assert.match(result.out, /checksum/i);
  assert.ok(!existsSync(installedIn(m.systemBin)));
  assert.ok(!existsSync(installedIn(m.localBin)));
});

test('a download with no line in SHA256SUMS installs nothing', () => {
  const m = machine({ unlisted: 'openvicloud-linux-amd64' });
  const result = run(m, script());
  assert.notEqual(result.code, 0);
  assert.match(result.out, /checksum/i);
  assert.ok(!existsSync(installedIn(m.systemBin)));
});

test('a failed download installs nothing', () => {
  const m = machine({ arch: 'x86_64' });
  const result = run(m, script().replaceAll('/releases/latest/download', '/releases/latest/missing'));
  assert.notEqual(result.code, 0);
  assert.ok(!existsSync(installedIn(m.systemBin)));
});

for (const [os, arch] of [['MINGW64_NT-10.0-19045', 'x86_64'], ['MSYS_NT-10.0', 'x86_64'], ['FreeBSD', 'amd64'], ['Linux', 'i686'], ['Darwin', 'ppc']]) {
  test(`${os} ${arch} is refused before any download, pointing at the CLI guide`, () => {
    const m = machine({ os, arch });
    const result = run(m, script());
    assert.notEqual(result.code, 0);
    assert.ok(result.out.includes(guide), result.out);
    assert.deepEqual(m.curlCalls(), []);
  });
}

test('the script downloads from the CLI\'s GitHub release only, the same on every site', () => {
  const m = machine();
  const result = run(m, script());
  assert.equal(result.code, 0, result.out);
  const urls = m.curlCalls().map((call) => call.split(' ').at(-1));
  assert.equal(urls.length, 2, urls.join('\n'));
  assert.deepEqual(urls.filter((url) => !url.startsWith(`${release}/`)), []);
  assert.doesNotMatch(script(), /SITE_ORIGIN/);
});

test('a script cut at any byte before its last line runs nothing', () => {
  const full = script();
  const lastLine = full.lastIndexOf('\nmain') + 1;
  assert.ok(lastLine > 100, 'the script ends with a line that calls main');
  // Up to "mai": the call itself is not complete yet.
  for (let cut = 0; cut <= lastLine + 3; cut += 1) {
    const m = machine();
    run(m, full.slice(0, cut));
    assert.deepEqual(m.curlCalls(), [], `cut at byte ${cut}`);
    assert.ok(!existsSync(installedIn(m.systemBin)), `cut at byte ${cut}`);
  }
});

test('the whole script does download: the cut check can see a run', () => {
  const m = machine();
  run(m, script());
  assert.ok(m.curlCalls().length >= 2);
});

for (const system of ['missing', 'read-only']) {
  test(`a ${system} system bin folder installs into ~/.local/bin and says how to add it to PATH`, () => {
    const m = machine({ system });
    const result = run(m, script());
    assert.equal(result.code, 0, result.out);
    assert.ok(existsSync(installedIn(m.localBin)));
    assert.ok(!existsSync(installedIn(m.systemBin)));
    assert.ok(!existsSync(m.systemBin) || system === 'read-only', 'does not create the system bin folder');
    assert.match(result.out, /PATH/);
    assert.ok(result.out.includes(m.localBin), result.out);
  });
}

test('~/.local/bin already on PATH needs no PATH hint', () => {
  const m = machine({ system: 'missing' });
  mkdirSync(m.localBin, { recursive: true });
  const result = run(m, script(), m.localBin);
  assert.equal(result.code, 0, result.out);
  assert.ok(existsSync(installedIn(m.localBin)));
  assert.doesNotMatch(result.out, /PATH/);
});

test('the script never calls sudo', () => {
  assert.doesNotMatch(readFileSync(scriptPath, 'utf8'), /\bsudo\b/);
});
