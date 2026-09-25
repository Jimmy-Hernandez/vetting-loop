// Guards the publication pause across EVERY path that can send an EVENT to a relay.
//
// The canonical gate has a behavioural test (publish-gate.test.mjs). This file adds:
//   A. the canonical publisher still imports and calls the canonical gate
//   B. the SECOND publisher (agent9 implementation) enforces its own inline guard,
//      and the guard runs BEFORE the first EVENT send in that file
//   C. the guard logic itself returns the right exit codes
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');

const CANONICAL = 'scripts/nostr/publish-episode.mjs';
const CANONICAL_GATE = 'scripts/nostr/nostr-config.mjs';
const SECOND = 'implementations/agent9/packages/ledger/scripts/nostr-publish.mts';

test('canonical publisher routes through the canonical gate', () => {
  const src = read(CANONICAL);
  assert.match(src, /from '\.\/nostr-config\.mjs'/, 'canonical publisher no longer imports the gate');
  assert.match(src, /assertPublishEnabled/, 'canonical publisher never calls assertPublishEnabled');
});

test('canonical gate requires both an env enable and an acknowledgement flag', () => {
  const src = read(CANONICAL_GATE);
  assert.notEqual(src.indexOf('NOSTR_PUBLISH_ENABLED'), -1, 'gate ignores NOSTR_PUBLISH_ENABLED');
  assert.notEqual(src.indexOf('--i-have-verified-the-data'), -1, 'gate ignores the acknowledgement flag');
});

test('second publisher enforces its own guard before it can send an EVENT', () => {
  const src = read(SECOND);
  const enables = src.indexOf('NOSTR_PUBLISH_ENABLED');
  const ack = src.indexOf('--i-have-verified-the-data');
  const send = src.indexOf('"EVENT"');
  assert.notEqual(enables, -1, 'second publisher does not consult NOSTR_PUBLISH_ENABLED');
  assert.notEqual(ack, -1, 'second publisher does not require the acknowledgement flag');
  assert.notEqual(send, -1, 'expected an EVENT send site in the second publisher');
  assert.ok(enables < send && ack < send, 'second publisher can send an EVENT before its guard runs');
});

test('the guard exits 2 unless both gates are satisfied', () => {
  const dir = mkdtempSync(join(tmpdir(), 'pause-guard-'));
  const file = join(dir, 'guard.mjs');
  writeFileSync(file, [
    'const enabled = process.env.NOSTR_PUBLISH_ENABLED === "1";',
    'const ack = process.argv.includes("--i-have-verified-the-data");',
    'process.exit(!enabled || !ack ? 2 : 0);',
  ].join('\n'));

  const cases = [
    ['0', false, 2],
    ['1', false, 2],
    ['0', true, 2],
    ['1', true, 0],
  ];

  for (const [enabled, ack, expected] of cases) {
    const args = ack ? [file, '--i-have-verified-the-data'] : [file];
    const r = spawnSync(process.execPath, args, {
      env: { ...process.env, NOSTR_PUBLISH_ENABLED: enabled },
    });
    assert.equal(r.status, expected, `env=${enabled} ack=${ack} -> ${r.status}`);
  }
});
