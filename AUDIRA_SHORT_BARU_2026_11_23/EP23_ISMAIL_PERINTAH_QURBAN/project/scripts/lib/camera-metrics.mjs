// Camera motion measured from the rendered video, so the "motion" score is evidence, not a guess.
//
// ffmpeg vidstabdetect gives local motion vectors between consecutive analysis frames; a robust
// similarity fit per step turns them into the camera's pan (x, y), zoom and roll. Scene cuts (scdet)
// are excluded, so a hard cut is not read as a jerk. Works on any render (Remotion, HyperFrames).
//
// Units: pan in frame widths per second (1.0 = the image slides one full width in a second), zoom in
// scale change per second (0.10 = 10 % bigger per second), roll in degrees per second.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const FPS = 10; // big enough steps that slow dollies are not lost to 1-pixel quantisation
const WIDTH = 640;

const ff = (args) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...args], { encoding: "utf8", maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${(r.stderr || "").trim().split("\n").slice(-3).join(" ")}`);
  return r.stderr;
};

const median = (a) => {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y), m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/** Seconds (from the clip start) where the picture changes completely: hard cuts. */
function cuts(file, from, dur) {
  const log = ff([...(from ? ["-ss", String(from)] : []), ...(dur ? ["-t", String(dur)] : []), "-i", file,
    "-vf", `fps=${FPS},scale=${WIDTH}:-2,scdet=threshold=14,metadata=print`, "-an", "-f", "null", "-"]);
  return [...log.matchAll(/lavfi\.scd\.time=([\d.]+)/g)].map((m) => Number(m[1]));
}

/** Per analysis step: { t, tx, ty, zoom, roll } in pixels/scale/radians per step, plus the frame size. */
function steps(file, from, dur) {
  const trf = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "camaudit-")), "motion.trf");
  ff([...(from ? ["-ss", String(from)] : []), ...(dur ? ["-t", String(dur)] : []), "-i", file,
    "-vf", `fps=${FPS},scale=${WIDTH}:-2,vidstabdetect=shakiness=5:accuracy=9:stepsize=6:mincontrast=0.2:result='${trf.replace(/\\/g, "/").replace(/:/g, "\\:")}':fileformat=ascii`, "-an", "-f", "null", "-"]);
  const text = fs.readFileSync(trf, "utf8");
  fs.rmSync(path.dirname(trf), { recursive: true, force: true });
  let w = WIDTH, h = 0;
  for (const m of text.matchAll(/\(LM -?\d+ -?\d+ (\d+) (\d+) (\d+)/g)) { h = Math.max(h, Number(m[2]) + Number(m[3])); }
  const out = [];
  for (const line of text.split("\n")) {
    const fm = line.match(/^Frame (\d+)/);
    if (!fm) continue;
    const lm = [...line.matchAll(/\(LM (-?\d+) (-?\d+) (\d+) (\d+) \d+ ([\d.]+) ([\d.]+)\)/g)]
      .map((m) => ({ dx: +m[1], dy: +m[2], x: +m[3], y: +m[4], match: +m[5] }));
    const t = (Number(fm[1]) - 1) / FPS;
    if (lm.length < 6) { out.push({ t, tx: 0, ty: 0, zoom: 0, roll: 0, ok: false }); continue; }
    const tx = median(lm.map((v) => v.dx)), ty = median(lm.map((v) => v.dy));
    const cx = median(lm.map((v) => v.x)), cy = median(lm.map((v) => v.y));
    // least-squares zoom s and roll r of the residual field: d - t ≈ s·p + r·perp(p)
    let ss = 0, sr = 0, n = 0;
    for (const v of lm) {
      const px = v.x - cx, py = v.y - cy, rx = v.dx - tx, ry = v.dy - ty, q = px * px + py * py;
      if (q < 400) continue;
      ss += rx * px + ry * py; sr += ry * px - rx * py; n += q;
    }
    out.push({ t, tx, ty, zoom: n ? ss / n : 0, roll: n ? sr / n : 0, ok: true });
  }
  return { steps: out, width: w, height: h || Math.round(WIDTH * 16 / 9) };
}

/**
 * Measure a clip. Returns per-second camera speed and the summary used for the motion score.
 * from/dur (seconds) limit the analysis to part of a long film.
 */
export function measureCamera(file, { from = 0, dur = 0 } = {}) {
  const { steps: st, width } = steps(file, from, dur);
  const cutAt = cuts(file, from, dur);
  const nearCut = (t) => cutAt.some((c) => Math.abs(c - t) <= 1.5 / FPS);
  const v = st.map((s) => ({
    t: s.t,
    cut: nearCut(s.t),
    ok: s.ok,
    pan: Math.hypot(s.tx, s.ty) / width * FPS, // frame widths per second
    vx: s.tx / width * FPS, vy: s.ty / width * FPS,
    zoom: Math.abs(s.zoom) * FPS, // scale change per second
    roll: Math.abs(s.roll) * FPS * 180 / Math.PI, // degrees per second
  }));
  const moving = (x) => x.pan + x.zoom * 1.5 + x.roll / 30;
  // A 3-step median filter first: when the camera orbits close to objects at different depths, the
  // dominant vector flips between near and far layers for single steps (parallax), which is not a
  // camera jerk. A real jerk (a move that stops dead or starts at full speed) lasts longer than a step.
  const med3 = (k) => v.map((x, i) => (i === 0 || i === v.length - 1 ? x[k] : median([v[i - 1][k], x[k], v[i + 1][k]])));
  const fvx = med3("vx"), fvy = med3("vy"), fzoom = med3("zoom");
  const sm = v.map((x, i) => ({ ...x, vx: fvx[i], vy: fvy[i], zoom: fzoom[i] }));
  // jerk: sudden change of camera velocity between steps that are not a cut
  const jerks = [];
  for (let i = 1; i < sm.length; i++) {
    const a = sm[i - 1], b = sm[i];
    if (a.cut || b.cut || !a.ok || !b.ok) continue;
    const dv = Math.hypot(b.vx - a.vx, b.vy - a.vy) + Math.abs(b.zoom - a.zoom) * 1.5;
    if (dv > 0.25) jerks.push({ t: +b.t.toFixed(1), dv: +dv.toFixed(2) });
  }
  // pops: a single-step jump far above the local speed (the picture snaps, then carries on). The
  // median filter above hides these, so they are found on the raw steps: > 0.8 frame widths/s and
  // > 3x the median speed of the surrounding second.
  for (let i = 0; i < v.length; i++) {
    const x = v[i];
    if (x.cut || !x.ok) continue;
    const around = v.slice(Math.max(0, i - 5), i + 6).filter((y, j, arr) => y !== x && !y.cut && y.ok).map((y) => y.pan);
    const local = median(around);
    if (x.pan > 0.8 && x.pan > 3 * local + 0.1 && !jerks.some((j) => Math.abs(j.t - x.t) < 0.05)) jerks.push({ t: +x.t.toFixed(1), dv: +x.pan.toFixed(2), pop: true });
  }
  jerks.sort((a, b) => a.t - b.t);
  const seconds = [];
  for (let s = 0; s * FPS < v.length; s++) {
    const w = v.slice(s * FPS, (s + 1) * FPS).filter((x) => !x.cut && x.ok);
    seconds.push(w.length ? +median(w.map(moving)).toFixed(3) : null);
  }
  const valid = seconds.filter((x) => x !== null);
  const dead = valid.filter((x) => x < 0.008).length; // camera effectively parked for the whole second
  const fast = valid.filter((x) => x > 0.6).length; // faster than ~0.6 frame widths per second
  const dur_ = valid.length || 1;
  return {
    seconds: seconds.length,
    cuts: cutAt.length,
    deadPct: Math.round((dead / dur_) * 100),
    fastPct: Math.round((fast / dur_) * 100),
    jerksPer10s: +(jerks.length / dur_ * 10).toFixed(1),
    medianSpeed: +median(valid).toFixed(3),
    longestHold: longestRun(seconds, (x) => x !== null && x < 0.008),
    jerks: jerks.slice(0, 12),
    perSecond: seconds,
  };
}

function longestRun(a, pred) {
  let best = 0, cur = 0;
  for (const x of a) { cur = pred(x) ? cur + 1 : 0; best = Math.max(best, cur); }
  return best;
}

/**
 * Motion score 1–5 from the measurements, with the reasons. Start at 5 and take points off for a
 * parked camera, long holds, jerky velocity changes and over-fast moves. Intentional stillness
 * (a held payoff, the outro card) is allowed: up to 15 % parked seconds and holds up to 3 s are free.
 */
export function cameraScore(m) {
  let s = 5;
  const why = [];
  if (m.deadPct > 15) { const p = m.deadPct > 75 ? 3 : m.deadPct > 45 ? 2 : 1; s -= p; why.push(`kamera diam ${m.deadPct}% detik (-${p})`); }
  if (m.longestHold > 3) { s -= 1; why.push(`diam terlama ${m.longestHold} dtk (-1)`); }
  // Jerks from video are indicative only: when a 3D camera moves close to objects at several depths,
  // parallax alone produces velocity changes of the same size as a real handover jerk (a rig that is
  // C1 by construction measured 7.5 per 10 s). So jerks cost at most 2 points and only above 4 per
  // 10 s; smoothness is guaranteed by building the rig with core/camera/moves.ts (one C1 track).
  // Pops (single-step snaps) are reliable and are included in the count.
  if (m.jerksPer10s > 4) { const p = m.jerksPer10s > 10 ? 2 : 1; s -= p; why.push(`${m.jerksPer10s} hentakan per 10 dtk (-${p}, indikatif)`); }
  if (m.fastPct > 10) { s -= 1; why.push(`terlalu cepat ${m.fastPct}% detik (-1)`); }
  return { score: Math.max(1, s), why: why.length ? why : ["gerak kamera kontinu dan halus"] };
}
