#!/usr/bin/env node
// contact-sheet.mjs — Cross-platform 3-up / N-up horizontal frame tiling into one contact sheet.
// Runs natively on Windows, macOS, and Linux without bash dependency.
//
// Usage:
//   node contact-sheet.mjs sheet.png frame-0.png frame-1.5.png frame-3.png

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const args = process.argv.slice(2);
const out = args[0];
const frames = args.slice(1);

if (!out || frames.length === 0) {
  console.error('Usage: node contact-sheet.mjs <out.png> <frame1.png> [frame2.png ...]');
  process.exit(1);
}

for (const f of frames) {
  if (!fs.existsSync(f)) {
    console.error(`Frame not found: ${f}`);
    process.exit(1);
  }
}

if (frames.length === 1) {
  fs.copyFileSync(frames[0], out);
  console.log(`  ✓ contact sheet (1 frame) → ${out}`);
  process.exit(0);
}

const inputs = [];
for (const f of frames) {
  inputs.push('-i', f);
}

const ffmpegArgs = [
  '-y',
  ...inputs,
  '-filter_complex', `hstack=inputs=${frames.length}`,
  '-loglevel', 'error',
  out
];

const res = spawnSync('ffmpeg', ffmpegArgs, { stdio: 'inherit' });
if (res.status === 0) {
  console.log(`  ✓ contact sheet (${frames.length} frame(s)) → ${out}`);
  process.exit(0);
} else {
  console.error('  ✗ ffmpeg failed to assemble contact sheet');
  process.exit(res.status || 1);
}

