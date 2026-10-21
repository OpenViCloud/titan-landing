// The site must never ship the internal docs of OpenViCloud/titan (docs/features/public-site/user-stories.md#us-site-02 AC-3).
// Customer pages are written under site/src/content/; a stray copy of titan's docs/ would publish internal design
// notes, and credentials.local.md files hold real test passwords.
// Usage: node scripts/check-dist.mjs [--docs-dir <titan docs/>] [--require-docs]
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const required = ['index.html', 'vi/index.html', 'docs/index.html', 'vi/docs/index.html', '404.html', 'robots.txt', 'config.json'];

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

  for (const file of distFiles) {
    if (/credentials/i.test(relative(distDir, file))) problems.push(`credential-like file: ${relative(distDir, file)}`);
  }

  // The Docker build has only site/ in its context and no docs to compare against; CI passes the docs it downloaded.
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
  console.log(`check-dist: OK — ${distCount} dist files, compared against ${docsCompared} titan docs files`);
}
