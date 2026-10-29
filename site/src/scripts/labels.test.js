import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// Bold text in the customer docs names what the customer sees on screen, so it must be text the portal shows
// (titan-ops features/public-site/design.md#docs-labels). A portal label renamed without the docs is caught here.
// The portal lives in OpenViCloud/titan-cloud-console; portal-labels/ is a copy of its words at the commit in
// portal-labels/SOURCE (scripts/sync-portal-labels.sh).

const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));
const docsRoot = join(repoRoot, 'site', 'src', 'content', 'docs');
const docsDir = { en: join(docsRoot, 'docs'), vi: join(docsRoot, 'vi', 'docs') };

// Bold text that is not a portal label, by language. Each group says why; a new entry needs the same kind of reason.
const notLabels = {
  en: {
    // Operating systems and catalog names (data from the API, not portal text).
    names: ['Linux', 'macOS', 'Windows', 'macOS and Linux', 'Standard', 'Standard — Custom size', 'Ubuntu-22.04-Standard'],
    // The Keycloak sign-in and sign-up pages, not the portal.
    keycloak: ['Sign in with GitHub.', 'Signed in with GitHub:', 'Sign up with email and password', 'Signed up with email and password:'],
    // Built by the portal from several strings (legal.agreeBefore + agreeLink + agreeAfter).
    composed: ['I have read and agree to the Terms of Service.'],
    // A step or list item that starts with its topic in bold.
    topics: ['Create a snapshot.', 'Delete a snapshot.', 'Restore.', 'Revert.', 'Snapshot', 'VM and network', 'Volume and VM',
      'VMs, networks, firewall rules, load balancers', 'Every port is open by default.'],
    // Emphasis inside a sentence.
    emphasis: ['allow', 'networks', 'new', 'not', 'paying invoices', 'size', 'template', 'whole',
      'you cannot create any', '×'],
  },
  vi: {
    names: ['Linux', 'macOS', 'Windows', 'macOS và Linux', 'Standard', 'Standard — Dung lượng tuỳ chọn', 'Ubuntu-22.04-Standard'],
    keycloak: ['Đăng nhập bằng GitHub.', 'Đăng nhập bằng GitHub:', 'Đăng ký bằng email và mật khẩu', 'Đăng ký bằng email và mật khẩu:'],
    composed: ['Tôi đã đọc và đồng ý với Điều khoản dịch vụ.'],
    topics: ['Tạo snapshot.', 'Xoá snapshot.', 'Restore.', 'Revert.', 'Volume', 'VM và network', 'Volume và VM',
      'VM, network, firewall rule, load balancer', 'Mọi cổng đều mở theo mặc định.'],
    emphasis: ['cho phép', 'cho phép (allow)', 'chưa', 'không được tạo cái nào', 'mới', 'network', 'size', 'template',
      'trả hoá đơn', 'trọn', '×'],
  },
};

function walk(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) files.push(...walk(path));
    else files.push(path);
  }
  return files;
}

// Every string literal of a TypeScript file, comments skipped (an apostrophe in a comment would pair the quotes
// wrongly). Template literals count as one string with their ${} parts left in.
export function stringsOf(source) {
  const strings = new Set();
  let i = 0;
  while (i < source.length) {
    if (source.startsWith('//', i)) {
      const end = source.indexOf('\n', i);
      i = end < 0 ? source.length : end;
      continue;
    }
    if (source.startsWith('/*', i)) {
      i = source.indexOf('*/', i) + 2;
      continue;
    }
    const quote = source[i];
    if (quote === "'" || quote === '"' || quote === '`') {
      let text = '';
      let j = i + 1;
      while (j < source.length && source[j] !== quote) {
        if (source[j] === '\\') {
          text += source[j + 1];
          j += 2;
          continue;
        }
        text += source[j];
        j += 1;
      }
      strings.add(text);
      i = j + 1;
      continue;
    }
    i += 1;
  }
  return strings;
}

function portalLabels(lang) {
  return stringsOf(readFileSync(join(repoRoot, 'portal-labels', 'i18n', `${lang}.ts`), 'utf8'));
}

// The state words the portal shows as the API sends them: its state modules, and the enums of the public spec.
function stateWords() {
  const words = new Set();
  const lib = join(repoRoot, 'portal-labels', 'lib');
  for (const name of readdirSync(lib)) {
    if (name.endsWith('State.ts')) {
      for (const text of stringsOf(readFileSync(join(lib, name), 'utf8'))) words.add(text);
    }
  }
  const spec = JSON.parse(readFileSync(join(repoRoot, 'api', 'openapi-v1.json'), 'utf8'));
  for (const schema of Object.values(spec.components.schemas)) {
    for (const value of schema.enum ?? []) words.add(String(value));
  }
  return words;
}

// Returns the bold texts of docs that are none of: a portal label, a state word (alone or followed by …, as the
// VM action cell shows a transition), a menu path whose every part is a label, a listed non-label.
export function unknownBold(docs, labels, states, allowed) {
  const unknown = [];
  for (const { file, text } of docs) {
    for (const match of text.matchAll(/\*\*([^*]+)\*\*/g)) {
      const bold = match[1];
      if (labels.has(bold) || states.has(bold) || allowed.has(bold)) continue;
      if (bold.endsWith('…') && states.has(bold.slice(0, -1))) continue;
      if (bold.includes('→') && bold.split('→').every((part) => labels.has(part.trim()))) continue;
      unknown.push(`${file}: **${bold}**`);
    }
  }
  return unknown;
}

function docsOf(lang) {
  return walk(docsDir[lang]).map((path) => ({ file: relative(docsRoot, path), text: readFileSync(path, 'utf8') }));
}

function allowedOf(lang) {
  return new Set(Object.values(notLabels[lang]).flat());
}

for (const lang of ['en', 'vi']) {
  test(`every bold text of the ${lang} docs is text the portal shows`, () => {
    const docs = docsOf(lang);
    assert.ok(docs.length > 10, `only ${docs.length} ${lang} docs found`);
    assert.deepEqual(unknownBold(docs, portalLabels(lang), stateWords(), allowedOf(lang)), []);
  });
}

test('the check finds a label the portal no longer has (the check can fail)', () => {
  const labels = portalLabels('en');
  assert.ok(labels.has('Create VM'), 'the label reader lost a known label');
  assert.ok(!labels.has('Enable Public IPv6'), 'the planted label is a real one again');
  const planted = [{ file: 'planted.md', text: 'Tick **Enable Public IPv6** and **Create VM**, under **Account → SSH keys**.' }];
  assert.deepEqual(unknownBold(planted, labels, stateWords(), allowedOf('en')), ['planted.md: **Enable Public IPv6**']);
});

test('every listed non-label is still bold somewhere in the docs', () => {
  for (const lang of ['en', 'vi']) {
    const text = docsOf(lang).map((doc) => doc.text).join('\n');
    const stale = [...allowedOf(lang)].filter((entry) => !text.includes(`**${entry}**`));
    assert.deepEqual(stale, [], `${lang}: listed but no longer bold in any doc`);
  }
});
