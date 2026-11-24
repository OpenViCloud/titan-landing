// The site must never ship the internal docs of OpenViCloud/titan-ops
// (titan-ops features/public-site/user-stories.md#us-site-02 AC-3). Customer pages are written under site/src/content/; a
// stray copy of titan-ops's docs/ would publish internal design notes, and credentials.local.md files hold real test
// passwords.
// Usage: node scripts/check-dist.mjs [--docs-dir <titan-ops docs/>] [--require-docs]
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const pages = ['index.html', 'vi/index.html', 'docs/index.html', 'vi/docs/index.html', '404.html'];
const required = [...pages, 'robots.txt', 'config.json', 'favicon.png', 'apple-touch-icon.png'];

// Every page names the same icon (titan-ops features/public-site/design.md#brand-icon). The landing writes its head by
// hand and Starlight writes the docs' and the 404's, so a change to one leaves the other on the old icon.
const iconLinks = [
  { rels: ['icon', 'shortcut icon'], href: '/favicon.png', name: 'icon' },
  { rels: ['apple-touch-icon'], href: '/apple-touch-icon.png', name: 'apple-touch-icon' },
];

function linksIcon(page, { rels, href }) {
  const tags = page.match(/<link\b[^>]*>/g);
  if (tags === null) return false;
  for (const tag of tags) {
    const rel = tag.match(/\brel="([^"]*)"/);
    const target = tag.match(/\bhref="([^"]*)"/);
    if (rel !== null && target !== null && rels.includes(rel[1]) && target[1] === href) return true;
  }
  return false;
}

function walk(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) files.push(...walk(path));
    else files.push(path);
  }
  return files;
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

export function distProblems({ distDir, docsDir, requireDocs }) {
  const problems = [];
  const distFiles = walk(distDir);
  for (const path of required) {
    if (!existsSync(join(distDir, path))) problems.push(`missing ${path}`);
  }

  for (const path of pages) {
    if (!existsSync(join(distDir, path))) continue;
    const page = readFileSync(join(distDir, path), 'utf8');
    for (const link of iconLinks) {
      if (!linksIcon(page, link)) problems.push(`${path} does not link ${link.href} as its ${link.name}`);
    }
  }

  for (const file of distFiles) {
    if (/credentials/i.test(relative(distDir, file))) problems.push(`credential-like file: ${relative(distDir, file)}`);
  }

  // Only a machine that can read titan-ops (private) passes its docs/; CI and the Docker build have none to compare.
  let docsCompared = 0;
  if (docsDir !== undefined && existsSync(docsDir)) {
    const docHashes = new Map();
    for (const file of walk(docsDir)) {
      if (statSync(file).size === 0) continue;
      docHashes.set(sha256(file), relative(docsDir, file));
      docsCompared += 1;
    }
    for (const file of distFiles) {
      const match = docHashes.get(sha256(file));
      if (match !== undefined) problems.push(`${relative(distDir, file)} is a copy of docs/${match}`);
    }
  }

  // Comparing against zero files would read as a pass while checking nothing.
  if (requireDocs && docsCompared === 0) {
    const where = docsDir === undefined ? 'no --docs-dir' : docsDir;
    problems.push(`compared against 0 files in ${where} — the copy check did not run`);
  }
  return { problems, distCount: distFiles.length, docsCompared };
}

// Node gives argv[1] absolute with symlinks unresolved, and the module URL with them resolved; compare both resolved.
export function isMain(scriptPath, moduleUrl) {
  return realpathSync(scriptPath) === realpathSync(fileURLToPath(moduleUrl));
}

if (isMain(process.argv[1], import.meta.url)) {
  const distDir = fileURLToPath(new URL('../dist', import.meta.url));
  if (!existsSync(distDir)) {
    console.error('check-dist: dist/ does not exist — run the build first');
    process.exit(1);
  }
  const flag = process.argv.indexOf('--docs-dir');
  const docsDir = flag === -1 ? undefined : process.argv[flag + 1];
  const { problems, distCount, docsCompared } = distProblems({
    distDir,
    docsDir,
    requireDocs: process.argv.includes('--require-docs'),
  });
  if (problems.length > 0) {
    console.error(`check-dist: FAIL — ${problems.length} problem(s)`);
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
  console.log(`check-dist: OK — ${distCount} dist files, compared against ${docsCompared} titan-ops docs files`);
}
