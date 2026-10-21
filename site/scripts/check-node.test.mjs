import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mismatches } from './check-node.mjs';

const dockerfile = 'FROM --platform=$BUILDPLATFORM node:22-alpine AS builder\nWORKDIR /app\n';
const workflow = "      - uses: actions/setup-node@v4\n        with:\n          node-version: '22'\n";

test('the Node of .nvmrc everywhere is no mismatch', () => {
  assert.deepEqual(mismatches({ running: '22.12.0', nvmrc: '22\n', dockerfile, workflow }), []);
});

test('running another major is a mismatch', () => {
  assert.deepEqual(mismatches({ running: '26.1.0', nvmrc: '22\n', dockerfile, workflow }), [
    'running Node 26.1.0, .nvmrc says 22',
  ]);
});

test('a Dockerfile or workflow on another major is a mismatch', () => {
  const result = mismatches({
    running: '22.12.0',
    nvmrc: '22',
    dockerfile: dockerfile.replace('node:22', 'node:24'),
    workflow: workflow.replace("'22'", "'20'"),
  });
  assert.deepEqual(result, [
    'Dockerfile builds on node:24, .nvmrc says 22',
    '.github/workflows/ci-site.yml sets node-version 20, .nvmrc says 22',
  ]);
});

test('a workflow absent (Docker build context) is not checked', () => {
  assert.deepEqual(mismatches({ running: '22.1.0', nvmrc: '22', dockerfile, workflow: null }), []);
});

test('a Dockerfile without a node image is a mismatch, not a silent pass', () => {
  assert.deepEqual(mismatches({ running: '22.1.0', nvmrc: '22', dockerfile: 'FROM nginx:alpine\n', workflow }), [
    'Dockerfile has no FROM node:<major>',
  ]);
});
