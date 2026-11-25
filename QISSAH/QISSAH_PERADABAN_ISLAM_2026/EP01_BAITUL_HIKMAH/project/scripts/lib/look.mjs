// Objective look metrics for 9:16 frames. They do not judge taste; they catch the measurable
// faults behind a weak score (blown highlights, flat planes, no subject separation, frames that
// all look alike, a camera that stops) and cap the score a human/AI judge may give.

import { spawnSync } from "node:child_process";

// Every frame is measured at this size. 9:16 by default; setFormat("wide") switches to 16:9 for
// long-form films (ES module bindings are live, so importers see the new values).
export let W = 270, H = 480;
let TILE = 9 / 16, BAND_TOP = 180 / 1920, BAND_BOTTOM = 380 / 1920, MOTION_W = 64, MOTION_H = 114;

/** "short" (9:16, platform UI bands 180/380 px) or "wide" (16:9, title-safe 60 px, player controls 120 px). */
export function setFormat(kind) {
  const wide = kind === "wide";
  [W, H] = wide ? [480, 270] : [270, 480];
  TILE = wide ? 16 / 9 : 9 / 16;
  [BAND_TOP, BAND_BOTTOM] = wide ? [60 / 1080, 120 / 1080] : [180 / 1920, 380 / 1920];
  [MOTION_W, MOTION_H] = wide ? [114, 64] : [64, 114];
}

const ff = (args) => {
  const r = spawnSync("ffmpeg", ["-v", "error", ...args], { encoding: "buffer", maxBuffer: 1 << 30 });
  if (r.error) throw new Error("ffmpeg not found: install ffmpeg and put it on PATH");
  if (r.status !== 0) throw new Error(r.stderr.toString().split("\n")[0]);
  return r.stdout;
};

/**
 * Guess how a contact sheet is tiled: the cols × rows split whose tiles are closest to 9:16.
 * A single 9:16 frame is 1 × 1. Pass grid "4x2" to override.
 */
export function guessGrid(w, h, grid) {
  if (grid) { const [c, r] = grid.split("x").map(Number); return { cols: c, rows: r }; }
  let best = { cols: 1, rows: 1, err: Infinity };
  for (let rows = 1; rows <= 4; rows++) for (let cols = 1; cols <= 10; cols++) {
    const err = Math.abs(Math.log((w / cols) / (h / rows) / TILE));
    // prefer fewer tiles on a near tie so a 9:16 still is never split
    if (err < best.err - 0.03) best = { cols, rows, err };
  }
  return best;
}

/**
 * Find tile boundaries from gutters: full-length columns/rows of one flat colour between content.
 * Returns content spans in source pixels, or null when the image has no interior gutters.
 */
function gutterSpans(file, w, h) {
  // full resolution up to 2400 px wide: a 4 px gutter disappears when the sheet is shrunk
  const sw = Math.min(2400, w), sh = Math.round(h * sw / w);
  const g = ff(["-i", file, "-vf", `scale=${sw}:${sh}:flags=area,format=gray`, "-frames:v", "1", "-f", "rawvideo", "-"]);
  const flatLine = (len, at) => { let m = 0, m2 = 0; for (let k = 0; k < len; k++) { const v = at(k); m += v; m2 += v * v; } return Math.sqrt(Math.max(0, m2 / len - (m / len) ** 2)) < 3; };
  const colFlat = Array.from({ length: sw }, (_, x) => flatLine(sh, (y) => g[y * sw + x]));
  const rowFlat = Array.from({ length: sh }, (_, y) => flatLine(sw, (x) => g[y * sw + x]));
  const spans = (flat, n, scale) => {
    const out = []; let s = -1;
    for (let i = 0; i <= n; i++) {
      const content = i < n && !flat[i];
      if (content && s < 0) s = i;
      if (!content && s >= 0) { if (i - s > n * 0.08) out.push([Math.round(s * scale), Math.round(i * scale)]); s = -1; }
    }
    return out;
  };
  const cs = spans(colFlat, sw, w / sw), rs = spans(rowFlat, sh, h / sh);
  if (cs.length * rs.length <= 1) return null;
  // a real grid of 9:16 frames: every tile near 9:16 (a flat column inside one frame is not a gutter)
  const ok = cs.every(([a, b]) => rs.every(([c, d]) => Math.abs(Math.log((b - a) / (d - c) / TILE)) < 0.25));
  return ok ? { cs, rs } : null;
}

/** Load an image as one or more W×H RGB frames; contact sheets are split into their tiles. */
export function loadFrames(file, grid) {
  const pr = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", file], { encoding: "utf8" });
  const [w, h] = pr.stdout.trim().split(",").map(Number);
  if (!w || !h) throw new Error(`${file}: not a readable image`);
  let boxes;
  const gs = !grid && gutterSpans(file, w, h);
  if (gs) boxes = gs.rs.flatMap(([y0, y1]) => gs.cs.map(([x0, x1]) => [x0, y0, x1 - x0, y1 - y0]));
  else {
    const { cols, rows } = guessGrid(w, h, grid), tw = Math.floor(w / cols), th = Math.floor(h / rows);
    boxes = Array.from({ length: cols * rows }, (_, i) => [(i % cols) * tw, Math.floor(i / cols) * th, tw, th]);
  }
  const out = [];
  for (const [x, y, bw, bh] of boxes) {
    const crop = boxes.length > 1 ? `crop=${bw}:${bh}:${x}:${y},` : "";
    const rgb = ff(["-i", file, "-vf", `${crop}scale=${W}:${H}:flags=area,format=rgb24`, "-frames:v", "1", "-f", "rawvideo", "-"]);
    // skip empty padding tiles (one flat colour) at the end of a sheet
    let lo = 255, hi = 0; for (let i = 0; i < rgb.length; i += 97) { lo = Math.min(lo, rgb[i]); hi = Math.max(hi, rgb[i]); }
    if (boxes.length > 1 && hi - lo < 4) continue;
    out.push({ label: boxes.length > 1 ? `${file.split(/[\\/]/).pop()}#${out.length + 1}` : file.split(/[\\/]/).pop(), rgb });
  }
  return out;
}

/** Grab frames from a video at the given seconds. */
export function videoFrames(file, times) {
  return times.map((t) => ({ label: `${file}@${t}s`, t, rgb: ff(["-ss", String(t), "-i", file, "-vf", `scale=${W}:${H}:flags=area,format=rgb24`, "-frames:v", "1", "-f", "rawvideo", "-"]) }));
}

const pct = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];

/** Per-frame metrics. All values are plain numbers so they can be stored in motion memory. */
export function measure(rgb) {
  const n = W * H, L = new Float32Array(n);
  let satSum = 0, satN = 0, clipHi = 0, crushLo = 0;
  for (let i = 0; i < n; i++) {
    const r = rgb[i * 3], g = rgb[i * 3 + 1], b = rgb[i * 3 + 2];
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    L[i] = l;
    if (l >= 250) clipHi++;
    if (l <= 6) crushLo++;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (mx > 20) { satSum += (mx - mn) / mx; satN++; }
  }
  const sorted = Float32Array.from(L).sort();
  let mean = 0; for (const v of L) mean += v; mean /= n;
  let vs = 0; for (const v of L) vs += (v - mean) ** 2;

  // gradient energy = fine detail/texture; region helpers
  const grad = new Float32Array(n);
  for (let y = 0; y < H - 1; y++) for (let x = 0; x < W - 1; x++) {
    const i = y * W + x;
    grad[i] = Math.abs(L[i + 1] - L[i]) + Math.abs(L[i + W] - L[i]);
  }
  const region = (x0, y0, x1, y1) => {
    let gl = 0, ll = 0, c = 0;
    for (let y = Math.floor(y0 * H); y < Math.floor(y1 * H); y++) for (let x = Math.floor(x0 * W); x < Math.floor(x1 * W); x++) { gl += grad[y * W + x]; ll += L[y * W + x]; c++; }
    return { detail: gl / c, lum: ll / c, n: c };
  };
  const all = region(0, 0, 1, 1);

  // flat planes: 10×10 blocks with almost no tonal or colour variation
  let flat = 0, blocks = 0;
  for (let by = 0; by + 10 <= H; by += 10) for (let bx = 0; bx + 10 <= W; bx += 10) {
    let m = 0, m2 = 0, cm = 0, cm2 = 0;
    for (let y = by; y < by + 10; y++) for (let x = bx; x < bx + 10; x++) {
      const i = y * W + x, v = L[i], c = rgb[i * 3] - rgb[i * 3 + 2];
      m += v; m2 += v * v; cm += c; cm2 += c * c;
    }
    const sd = Math.sqrt(Math.max(0, m2 / 100 - (m / 100) ** 2)), csd = Math.sqrt(Math.max(0, cm2 / 100 - (cm / 100) ** 2));
    if (sd < 2.5 && csd < 2.5) flat++;
    blocks++;
  }

  // subject vs surroundings: centre window against the outer ring (excluding UI bands)
  const centre = region(0.22, 0.25, 0.78, 0.68);
  const ring = (() => {
    const t = region(0, 0.094, 1, 0.8), c = centre;
    const nRing = t.n - c.n;
    return { detail: (t.detail * t.n - c.detail * c.n) / nRing, lum: (t.lum * t.n - c.lum * c.n) / nRing };
  })();

  // bands: platform UI (short: top 180 / bottom 380 px of 1920; wide: 60 / 120 px of 1080) vs the middle
  const top = region(0, 0, 1, BAND_TOP), bottom = region(0, 1 - BAND_BOTTOM, 1, 1), mid = region(0, 0.2, 1, 0.75);

  return {
    lumMean: +mean.toFixed(1),
    p2: +pct(sorted, 0.02).toFixed(1),
    p98: +pct(sorted, 0.98).toFixed(1),
    range: +(pct(sorted, 0.98) - pct(sorted, 0.02)).toFixed(1),
    clipHi: +(clipHi / n * 100).toFixed(1),
    crushLo: +(crushLo / n * 100).toFixed(1),
    contrast: +(Math.sqrt(vs / n) / 255).toFixed(3),
    saturation: +(satN ? satSum / satN : 0).toFixed(3),
    detail: +all.detail.toFixed(2),
    flat: +(flat / blocks * 100).toFixed(1),
    sepLum: +Math.abs(centre.lum - ring.lum).toFixed(1),
    // floor the ring detail so a flat card (outro, title on solid colour) cannot explode the ratio
    sepDetail: +Math.min(20, centre.detail / Math.max(0.3, ring.detail)).toFixed(2),
    topBusy: +(top.detail / Math.max(0.01, mid.detail)).toFixed(2),
    bottomBusy: +(bottom.detail / Math.max(0.01, mid.detail)).toFixed(2),
  };
}

/**
 * Motion per second, measured between frames 0.25 s apart (slow dolly moves are invisible
 * frame-to-frame at 60 fps). Returns mean absolute luma change (0–255) for each second.
 */
export function motionProfile(file) {
  const tw = MOTION_W, th = MOTION_H, raw = ff(["-i", file, "-vf", `fps=4,scale=${tw}:${th},format=gray`, "-f", "rawvideo", "-"]);
  // skip the HUD/signature strip (top 10 %) and the karaoke caption band (62–82 %):
  // changing words there would hide a camera that has stopped
  const rows = Array.from({ length: th }, (_, y) => y).filter((y) => y >= th * 0.1 && (y < th * 0.62 || y >= th * 0.82));
  const n = raw.length / (tw * th), d = [];
  for (let i = 1; i < n; i++) {
    let s = 0; const a = raw.subarray((i - 1) * tw * th, i * tw * th), b = raw.subarray(i * tw * th, (i + 1) * tw * th);
    for (const y of rows) for (let x = 0; x < tw; x++) s += Math.abs(a[y * tw + x] - b[y * tw + x]);
    d.push(s / (rows.length * tw));
  }
  const secs = [];
  for (let s = 0; s * 4 < d.length; s++) { const w = d.slice(s * 4, s * 4 + 4); secs.push(+(w.reduce((x, y) => x + y, 0) / w.length).toFixed(2)); }
  return secs;
}

/** 32×57 gray thumbnail for frame-to-frame similarity. */
export function thumb(rgb) {
  const tw = 32, th = 57, out = new Float32Array(tw * th);
  for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) {
    let s = 0, c = 0;
    for (let yy = Math.floor(y * H / th); yy < Math.floor((y + 1) * H / th); yy++) for (let xx = Math.floor(x * W / tw); xx < Math.floor((x + 1) * W / tw); xx++) {
      const i = (yy * W + xx) * 3; s += 0.2126 * rgb[i] + 0.7152 * rgb[i + 1] + 0.0722 * rgb[i + 2]; c++;
    }
    out[y * tw + x] = s / c;
  }
  return out;
}

/** Mean absolute difference between two thumbnails (0–255). */
export const thumbDiff = (a, b) => { let d = 0; for (let i = 0; i < a.length; i++) d += Math.abs(a[i] - b[i]); return d / a.length; };
