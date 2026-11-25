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
  // jerk: sudden change of camera velocity between steps that are not a cut
  const jerks = [];
  for (let i = 1; i < v.length; i++) {
    const a = v[i - 1], b = v[i];
    if (a.cut || b.cut || !a.ok || !b.ok) continue;
    const dv = Math.hypot(b.vx - a.vx, b.vy - a.vy) + Math.abs(b.zoom - a.zoom) * 1.5;
    if (dv > 0.25) jerks.push({ t: +b.t.toFixed(1), dv: +dv.toFixed(2) });
  }
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
  if (m.jerksPer10s > 1.5) { const p = m.jerksPer10s > 10 ? 3 : m.jerksPer10s > 4 ? 2 : 1; s -= p; why.push(`${m.jerksPer10s} hentakan per 10 dtk (-${p})`); }
  if (m.fastPct > 10) { s -= 1; why.push(`terlalu cepat ${m.fastPct}% detik (-1)`); }
  return { score: Math.max(1, s), why: why.length ? why : ["gerak kamera kontinu dan halus"] };
}
