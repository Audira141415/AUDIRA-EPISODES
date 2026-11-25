#!/usr/bin/env node
// seek-shot.mjs — Cross-platform deterministic freeze frame capture via Playwright harness (?t=N).
// Runs natively on Windows, macOS, and Linux.
//
// Usage:
//   node seek-shot.mjs anim.html 0 1.5 3
//   node seek-shot.mjs anim.html               # defaults to 0, 1.5, 3 seconds

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const args = process.argv.slice(2);
const html = args[0];
const times = args.length > 1 ? args.slice(1).map(Number) : [0, 1.5, 3];

if (!html) {
  console.error('Usage: node seek-shot.mjs <file.html> [t1 t2 ...]');
  process.exit(1);
}

const abs = path.resolve(html);
if (!fs.existsSync(abs)) {
  console.error(`HTML file not found: ${abs}`);
  process.exit(1);
}

const fileUrl = 'file://' + abs.replace(/\\/g, '/');

for (const t of times) {
  const out = `frame-${t}.png`;
  const targetUrl = `${fileUrl}?t=${t}`;
  
  // Use npx playwright screenshot
  const isWin = process.platform === 'win32';
  const npxCmd = isWin ? 'npx.cmd' : 'npx';
  
  const res = spawnSync(npxCmd, [
    '-y',
    'playwright',
    'screenshot',
    '--wait-for-timeout=600',
    targetUrl,
    out
  ], { stdio: 'ignore' });
  
  if (res.status === 0) {
    console.log(`  ✓ t=${t}s → ${out}`);
  } else {
    console.warn(`  ! failed to capture t=${t}s via playwright. Ensure playwright is available.`);
  }
}

console.log('  → tile them: node scripts/contact-sheet.mjs sheet.png frame-*.png');

