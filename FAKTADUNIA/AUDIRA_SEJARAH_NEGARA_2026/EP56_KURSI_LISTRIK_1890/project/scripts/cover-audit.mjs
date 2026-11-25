// Cover audit: does the film keep the promise of its approved cover (style/cover-topic.png)?
//   npm run audit:cover -- <film.mp4> <cover-topic.png> [--json=out.json]
//
// The cover is the thumbnail people click. Rule (master directive, point 5): the hook opens on the
// cover framing, so the first second matches the cover, and the film keeps the cover's look.
// Measured on small grayscale/colour thumbnails, so it ignores captions and fine detail:
//   opening  best structural similarity (SSIM) of the cover with frames in the first 1.5 s
//   anywhere best SSIM over the whole film at 2 fps, and where it happens
//   look     colour/brightness distance between the cover and the film's median frame
// Pass: opening >= 0.55; look > 22 is a warning (calibrated 2026-11-10 on 5 episodes: a matching cover scored 0.64 / 7.8;
// a cover in the same palette but a different staging 0.29 / 19.3). A cover made with a different framing or palette than the
// film fails, which is the point: re-stage the hook from the cover, or re-render the cover from the film.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const opt = (k) => (process.argv.find((a) => a.startsWith(`--${k}=`)) ?? "").split("=").slice(1).join("=");
const [film, cover] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
if (!film || !cover) { console.error("usage: npm run audit:cover -- <film.mp4> <cover-topic.png|cover-topic-wide.png> [--json=out.json]"); process.exit(2); }
// Compare in a small box with the cover's own aspect: 90×160 for 9:16, 160×90 for a 16:9 long-form cover
// (cover-topic-wide.png), so a wide film is not squeezed into a portrait box.
const dims = spawnSync("ffprobe", ["-v", "error", "-show_entries", "stream=width,height", "-of", "csv=p=0", cover], { encoding: "utf8" }).stdout.trim().split(",").map(Number);
const wideCover = dims[0] > dims[1];
const TW = wideCover ? 160 : 90, TH = wideCover ? 90 : 160;

const raw = (input, vf, extra = []) => {
  const r = spawnSync("ffmpeg", ["-v", "error", ...extra, "-i", input, "-vf", `${vf},scale=${TW}:${TH}:force_original_aspect_ratio=decrease,pad=${TW}:${TH}:(ow-iw)/2:(oh-ih)/2,format=rgb24`, "-f", "rawvideo", "-"], { maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(String(r.stderr).trim().split("\n").pop());
  const n = TW * TH * 3, out = [];
  for (let i = 0; i + n <= r.stdout.length; i += n) out.push(r.stdout.subarray(i, i + n));
  return out;
};
const gray = (rgb) => { const g = new Float32Array(TW * TH); for (let i = 0; i < g.length; i++) g[i] = 0.2126 * rgb[i * 3] + 0.7152 * rgb[i * 3 + 1] + 0.0722 * rgb[i * 3 + 2]; return g; };

/** Mean SSIM over 8×8 windows (step 4), on 0–255 gray. */
function ssim(a, b) {
  const C1 = (0.01 * 255) ** 2, C2 = (0.03 * 255) ** 2;
  let sum = 0, n = 0;
  for (let y = 0; y + 8 <= TH; y += 4) for (let x = 0; x + 8 <= TW; x += 4) {
    let ma = 0, mb = 0;
    for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { ma += a[(y + j) * TW + x + i]; mb += b[(y + j) * TW + x + i]; }
    ma /= 64; mb /= 64;
    let va = 0, vb = 0, cov = 0;
    for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
      const da = a[(y + j) * TW + x + i] - ma, db = b[(y + j) * TW + x + i] - mb;
      va += da * da; vb += db * db; cov += da * db;
    }
    va /= 63; vb /= 63; cov /= 63;
    sum += ((2 * ma * mb + C1) * (2 * cov + C2)) / ((ma * ma + mb * mb + C1) * (va + vb + C2)); n++;
  }
  return sum / n;
}

/** Colour statistics: mean and spread of R, G, B. */
const stats = (rgb) => {
  const m = [0, 0, 0], s = [0, 0, 0], n = rgb.length / 3;
  for (let i = 0; i < n; i++) for (let c = 0; c < 3; c++) m[c] += rgb[i * 3 + c];
  for (let c = 0; c < 3; c++) m[c] /= n;
  for (let i = 0; i < n; i++) for (let c = 0; c < 3; c++) s[c] += (rgb[i * 3 + c] - m[c]) ** 2;
  for (let c = 0; c < 3; c++) s[c] = Math.sqrt(s[c] / n);
  return { m, s };
};
const lookDistance = (a, b) => Math.hypot(...a.m.map((x, i) => x - b.m[i])) * 0.7 + Math.hypot(...a.s.map((x, i) => x - b.s[i])) * 0.3;

const cv = raw(cover, "null")[0];
const cg = gray(cv);
const opening = raw(film, "fps=8", ["-t", "1.5"]).map((f, i) => ({ t: i / 8, s: ssim(cg, gray(f)) }));
const whole = raw(film, "fps=2").map((f, i) => ({ t: i / 2, s: ssim(cg, gray(f)), rgb: f }));
const bestOpen = opening.reduce((a, b) => (b.s > a.s ? b : a));
const bestAny = whole.reduce((a, b) => (b.s > a.s ? b : a));
// the film's look: per-channel median of the frame statistics
const fs_ = whole.map((w) => stats(w.rgb));
const med = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[s.length >> 1]; };
const filmLook = { m: [0, 1, 2].map((c) => med(fs_.map((x) => x.m[c]))), s: [0, 1, 2].map((c) => med(fs_.map((x) => x.s[c]))) };
const look = lookDistance(stats(cv), filmLook);

const result = {
  film, cover,
  opening: +bestOpen.s.toFixed(3), openingAt: bestOpen.t,
  anywhere: +bestAny.s.toFixed(3), anywhereAt: bestAny.t,
  look: +look.toFixed(1),
  // look is a warning, not a fail: a film whose scenes change a lot (an 8 s kit demo measured 28) can drift from
  // its own hook frame while still opening on the cover
  pass: bestOpen.s >= 0.55,
  lookWarning: look > 22,
};
const why = [];
if (bestOpen.s < 0.55) why.push(`pembuka tidak cocok dengan cover (SSIM ${result.opening} < 0.55)${bestAny.s >= 0.55 ? `; adegan cover baru muncul di ${bestAny.t} dtk` : "; adegan cover tidak muncul di film"}`);
if (look > 22) why.push(`peringatan: warna/kecerahan rata-rata film berbeda dari cover (jarak ${result.look} > 22); cek grade kalau adegannya tidak memang berganti suasana`);
result.why = why.length ? why : ["film membuka dengan framing cover dan memakai look yang sama"];
console.log(`${path.basename(path.dirname(path.dirname(film)))}/${path.basename(film)}: ${result.pass ? "LOLOS" : "PERLU POLES"}  opening ${result.opening} @${result.openingAt}s, anywhere ${result.anywhere} @${result.anywhereAt}s, look ${result.look}`);
for (const w of result.why) console.log(`  ${w}`);
if (opt("json")) fs.writeFileSync(opt("json"), JSON.stringify(result, null, 2));
process.exit(result.pass ? 0 : 1);
