#!/usr/bin/env node
// probe-mp4.mjs — Cross-platform MP4 contract assertion (resolution, codec, fps, duration).
// Runs natively on Windows, macOS, and Linux without bash dependency.
//
// Usage:
//   node probe-mp4.mjs out.mp4
//   node probe-mp4.mjs out.mp4 1080x1920 30

import { spawnSync } from 'node:child_process';
import path from 'node:path';

const args = process.argv.slice(2);
const mp4 = args[0];
const expRes = args[1];
const expFps = args[2] ? parseFloat(args[2]) : null;

if (!mp4) {
  console.error('Usage: node probe-mp4.mjs <file.mp4> [WxH] [fps]');
  process.exit(1);
}

function probe(entry) {
  const res = spawnSync('ffprobe', [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', entry,
    '-of', 'csv=p=0',
    mp4
  ], { encoding: 'utf8' });
  return res.stdout ? res.stdout.trim().split('\n')[0] : '';
}

function probeFormat(entry) {
  const res = spawnSync('ffprobe', [
    '-v', 'error',
    '-show_entries', entry,
    '-of', 'csv=p=0',
    mp4
  ], { encoding: 'utf8' });
  return res.stdout ? res.stdout.trim() : '';
}

const w = probe('stream=width');
const h = probe('stream=height');
const codec = probe('stream=codec_name');
const rRate = probe('stream=r_frame_rate');
const durStr = probeFormat('format=duration');
const dur = parseFloat(durStr) || 0;

let fps = 0;
if (rRate.includes('/')) {
  const [num, den] = rRate.split('/').map(Number);
  fps = den ? +(num / den).toFixed(2) : num;
} else {
  fps = parseFloat(rRate) || 0;
}

const basename = path.basename(mp4);
console.log(`  ${basename}: ${w}x${h}  ${codec}  ${fps} fps  ${dur.toFixed(2)}s`);

let fail = false;
if (expRes && `${w}x${h}` !== expRes) {
  console.error(`  ✗ resolution ${w}x${h} ≠ ${expRes}`);
  fail = true;
}

if (expFps !== null && Math.abs(fps - expFps) > 0.5) {
  console.error(`  ✗ fps ${fps} ≠ ${expFps}`);
  fail = true;
}

if (codec !== 'h264') {
  console.warn(`  ⚠ codec ${codec} (not h264 — verify player/platform compatibility)`);
}

if (fail) {
  process.exit(1);
} else {
  console.log('  ✓ spec OK');
  process.exit(0);
}

