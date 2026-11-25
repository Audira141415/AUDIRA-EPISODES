// Rig audit: check a camera rig's smoothness from its own maths, frame by frame, with no rendering.
// Complements audit:camera (which measures the video): in 3D scenes with close objects, parallax makes
// video-based jerk counts noisy, while the rig itself shows exactly where the camera stops, jumps or
// changes speed abruptly.
//   npm run audit:rig -- <rig module.ts> [exportName] [--frames=480] [--fps=60]
// The export is a pose function f => { position|pos, target, fov }. Node runs the .ts file directly
// (type stripping), so its imports must carry file extensions, as core/camera/moves.ts does.

import path from "node:path";
import { pathToFileURL } from "node:url";

const opt = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) ?? `=${d}`).split("=").slice(1).join("=");
const [file, exportName] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
if (!file) { console.error("usage: npm run audit:rig -- <rig module.ts> [exportName] [--frames=480] [--fps=60]"); process.exit(2); }
const mod = await import(pathToFileURL(path.resolve(file)).href);
const fn = exportName ? mod[exportName] : Object.values(mod).find((v) => typeof v === "function");
if (typeof fn !== "function") { console.error(`no pose function exported from ${file}`); process.exit(2); }
const frames = Number(opt("frames", 480)), fps = Number(opt("fps", 60));

const pose = (f) => { const p = fn(f); return { pos: p.position ?? p.pos, target: p.target, fov: p.fov }; };
const dir = (p) => { const d = p.target.map((x, i) => x - p.pos[i]); const n = Math.hypot(...d); return d.map((x) => x / n); };
const w = [];
for (let f = 1; f <= frames; f++) {
  const a = pose(f - 1), b = pose(f), da = dir(a), db = dir(b);
  const ang = (Math.acos(Math.min(1, da[0] * db[0] + da[1] * db[1] + da[2] * db[2])) * 180) / Math.PI * fps;
  const dist = Math.hypot(...b.target.map((x, i) => x - b.pos[i]));
  const lin = Math.hypot(...b.pos.map((x, i) => x - a.pos[i])) * fps;
  // screen-relative speed: turning in fovs per second plus travel in subject distances per second
  w.push({ f, s: ang / b.fov + lin / dist });
}
const step = Math.round(fps / 10);
const changes = [];
for (let i = step; i < w.length; i += step) { const dv = Math.abs(w[i].s - w[i - step].s); if (dv > 0.08) changes.push({ t: +(w[i].f / fps).toFixed(1), dv: +dv.toFixed(2) }); }
const mean = w.reduce((x, y) => x + y.s, 0) / w.length;
const peak = Math.max(...w.map((x) => x.s));
const rest = w.filter((x, i) => i > fps * 0.3 && i < w.length - fps * 0.3 && x.s < 0.004).length;
const jumps = w.filter((x) => x.s > Math.max(1.5, mean * 8)).map((x) => +(x.f / fps).toFixed(2));
let score = 5; const why = [];
if (jumps.length) { score -= 2; why.push(`kamera melompat di ${jumps.slice(0, 5).join(", ")} dtk (-2)`); }
if (changes.length > frames / fps) { score -= 1; why.push(`${changes.length} perubahan kecepatan mendadak (-1)`); }
if (rest > fps * 0.5) { score -= 1; why.push(`berhenti ${(rest / fps).toFixed(1)} dtk di tengah film (-1)`); }
if (peak > 1.2) { score -= 1; why.push(`puncak ${peak.toFixed(2)} lebar/dtk, terlalu cepat (-1)`); }
console.log(`${path.basename(file)}: rig ${Math.max(1, score)}/5 (${why.length ? why.join("; ") : "halus, tanpa lompatan atau berhenti mendadak"})`);
console.log(`  mean speed ${mean.toFixed(3)}, peak ${peak.toFixed(2)}, abrupt changes ${changes.length}, rest ${(rest / fps).toFixed(1)} s`);
