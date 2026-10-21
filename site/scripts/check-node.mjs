// Runs before `npm test`: the site suite must run on the Node major of .nvmrc, the one the Dockerfile and CI build
// with. engines (>=22.12.0) lets a newer major through, so a suite run on the agent's machine could pass on a Node the
// image never uses.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function major(version) {
  return version.trim().replace(/^v/, '').split('.')[0];
}

export function mismatches({ running, nvmrc, dockerfile, workflow }) {
  const wanted = major(nvmrc);
  const found = [];
  if (major(running) !== wanted) {
    found.push(`running Node ${running}, .nvmrc says ${wanted}`);
  }
  const fromNode = dockerfile.match(/^FROM\s+(?:--platform=\S+\s+)?node:(\d+)/m);
  if (fromNode === null) {
    found.push('Dockerfile has no FROM node:<major>');
  } else if (fromNode[1] !== wanted) {
    found.push(`Dockerfile builds on node:${fromNode[1]}, .nvmrc says ${wanted}`);
  }
  if (workflow !== null) {
    const setup = workflow.match(/node-version:\s*'?(\d+)/);
    if (setup === null) {
      found.push('.github/workflows/ci-site.yml has no node-version');
    } else if (setup[1] !== wanted) {
      found.push(`.github/workflows/ci-site.yml sets node-version ${setup[1]}, .nvmrc says ${wanted}`);
    }
  }
  return found;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const site = join(dirname(fileURLToPath(import.meta.url)), '..');
  const workflowPath = join(site, '..', '.github', 'workflows', 'ci-site.yml');
  let workflow = null;
  if (existsSync(workflowPath)) {
    workflow = readFileSync(workflowPath, 'utf8');
  }
  const found = mismatches({
    running: process.versions.node,
    nvmrc: readFileSync(join(site, '.nvmrc'), 'utf8'),
    dockerfile: readFileSync(join(site, 'Dockerfile'), 'utf8'),
    workflow,
  });
  if (found.length > 0) {
    for (const line of found) {
      console.error(`NODE_MISMATCH: ${line}`);
    }
    process.exit(1);
  }
}
