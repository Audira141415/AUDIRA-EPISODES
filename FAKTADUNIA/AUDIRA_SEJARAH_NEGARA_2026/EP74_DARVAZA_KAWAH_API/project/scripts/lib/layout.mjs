// audit:layout — composition and readability measured from the DOM, not guessed by eye.
// Input: <stillsDir>/_layout.json written by stills.mjs (lib/layout-probe.js) plus the stills
// themselves (for text contrast against whatever 3D frame sits behind the text).
//
// Checks per frame, in reference pixels (9:16 = 1080×1920, 16:9 = 1920×1080):
//   small     glyph size below the phone-legible minimum
//   contrast  text vs its box, or vs the pixels around it, below WCAG-style ratios
//   cropped   a text block cut by the frame edge
//   band      text inside the platform UI bands (9:16: top 180 / bottom 380 px)
//   overlap   two unrelated text blocks on top of each other
// These are the faults behind the jury's most frequent composition/readability notes
// (label, crop, caption, small, overlap; 173 low scores up to 2026-11-14).

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

export const RULES = {
  short: { refW: 1080, refH: 1920, top: 180, bottom: 380, minFail: 24, minWarn: 36, large: 48 },
  wide: { refW: 1920, refH: 1080, top: 60, bottom: 120, minFail: 19, minWarn: 28, large: 40 },
};

const lum = ({ r, g, b }) => {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const blend = (fg, bg) => (fg.a >= 1 ? fg : { r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a) });

function readRgb(file, w, h) {
  const r = spawnSync("ffmpeg", ["-v", "error", "-i", file, "-vf", `scale=${w}:${h}`, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { encoding: "buffer", maxBuffer: 1 << 28 });
  return r.status === 0 && r.stdout.length >= w * h * 3 ? r.stdout : null;
}

// median colour of a ring around the text block = the background the text has to read against
function ringColor(rgb, w, h, it) {
  const pad = Math.max(4, it.h * 0.35);
  const x0 = Math.max(0, Math.floor(it.x - pad)), x1 = Math.min(w - 1, Math.ceil(it.x + it.w + pad));
  const y0 = Math.max(0, Math.floor(it.y - pad)), y1 = Math.min(h - 1, Math.ceil(it.y + it.h + pad));
  const px = [];
  const step = Math.max(1, Math.round(Math.min(x1 - x0, y1 - y0) / 40));
  for (let y = y0; y <= y1; y += step) for (let x = x0; x <= x1; x += step) {
    const inside = x >= it.x && x <= it.x + it.w && y >= it.y && y <= it.y + it.h;
    if (inside) continue;
    const i = (y * w + x) * 3;
    px.push({ r: rgb[i], g: rgb[i + 1], b: rgb[i + 2], l: 0.299 * rgb[i] + 0.587 * rgb[i + 1] + 0.114 * rgb[i + 2] });
  }
  if (!px.length) return null;
  px.sort((a, b) => a.l - b.l);
  return px[Math.floor(px.length / 2)];
}

/**
 * @param {string} stillsDir folder with _layout.json and f####.png stills
 * @param {"short"|"wide"} format
 */
export function auditLayout(stillsDir, format) {
  const file = path.join(stillsDir, "_layout.json");
  if (!fs.existsSync(file)) return null;
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  format ??= data.width > data.height ? "wide" : "short";
  const R = RULES[format] ?? RULES.short;
  const frames = [];
  for (const fr of data.frames) {
    if (fr.missing) { frames.push({ frame: fr.frame, missing: true, issues: [] }); continue; }
    const k = R.refW / fr.vw; // viewport px -> reference px
    const still = path.join(stillsDir, `f${String(fr.frame).padStart(4, "0")}.png`);
    const rgb = fs.existsSync(still) ? readRgb(still, fr.vw, fr.vh) : null;
    const issues = [];
    const add = (kind, level, it, detail) => issues.push({ kind, level, text: it?.text, detail });
    fr.items.forEach((it) => {
      const size = it.fontPx * k;
      const large = size >= R.large || (size >= R.large * 0.75 && it.weight >= 700);
      if (size < R.minFail - 0.5) add("small", "fail", it, `${Math.round(size)} px < ${R.minFail}`);
      else if (size < R.minWarn - 0.5) add("small", "warn", it, `${Math.round(size)} px < ${R.minWarn}`);

      // contrast
      let bg = null, how = "";
      if (it.box && it.box.r !== undefined) { bg = it.box; how = "box"; }
      else if (it.box) { how = it.box.gradient ? "gradient box" : "blur box"; }
      else if (rgb) { bg = ringColor(rgb, fr.vw, fr.vh, it); how = "frame"; }
      if (bg && it.color) {
        // a fading caption reads as its blend with what is behind it
        const fg = { ...it.color, a: (it.color.a ?? 1) * (it.opacity ?? 1) };
        const c = ratio(blend(fg, bg), bg);
        const need = it.shadow || it.stroke >= 1 ? 2 : large ? 3 : 4.5;
        if (c < need) add("contrast", c < need * 0.66 ? "fail" : "warn", it, `${c.toFixed(1)}:1 vs ${how} (want ≥ ${need})`);
      }

      // cropped by the frame edge
      if (it.x < -1 || it.x + it.w > fr.vw + 1 || it.y < -1 || it.y + it.h > fr.vh + 1) add("cropped", "fail", it, "cut by the frame edge");
      else if (it.clipped) add("cropped", "fail", it, "truncated by its box (overflow/ellipsis)");

      // platform UI bands
      const top = R.top / k, bottom = fr.vh - R.bottom / k;
      const inTop = Math.max(0, Math.min(it.y + it.h, top) - it.y) / Math.max(1, it.h);
      const inBottom = Math.max(0, it.y + it.h - Math.max(it.y, bottom)) / Math.max(1, it.h);
      if (inTop > 0.3) add("band", "fail", it, `in the top ${R.top} px (platform UI)`);
      if (inBottom > 0.3) add("band", "fail", it, `in the bottom ${R.bottom} px (platform UI)`);
    });
    for (const o of fr.overlaps) add("overlap", "fail", fr.items[o.a], `overlaps "${fr.items[o.b].text.slice(0, 24)}" (${Math.round(o.share * 100)} %)`);
    frames.push({ frame: fr.frame, texts: fr.items.length, issues });
  }

  // ---- ceilings ----
  const measured = frames.filter((f) => !f.missing);
  const withText = measured.filter((f) => f.texts > 0);
  const ceil = { composition: 5, readability: withText.length ? 5 : null };
  const why = { composition: [], readability: [] };
  const cap = (a, v, reason) => { if (ceil[a] === null) return; ceil[a] = Math.min(ceil[a], v); why[a].push(`max ${v}: ${reason}`); };
  const count = (kinds, level) => {
    const hit = measured.filter((f) => f.issues.some((i) => kinds.includes(i.kind) && (!level || i.level === level)));
    return { frames: hit.length, items: hit.reduce((a, f) => a + f.issues.filter((i) => kinds.includes(i.kind) && (!level || i.level === level)).length, 0) };
  };
  const ex = (kinds, level) => {
    const i = measured.flatMap((f) => f.issues.filter((x) => kinds.includes(x.kind) && (!level || x.level === level)).map((x) => `"${(x.text || "").slice(0, 22)}" ${x.detail}`));
    return i.slice(0, 2).join("; ");
  };
  const rf = count(["small", "contrast", "cropped"], "fail");
  if (rf.items) cap("readability", rf.frames >= Math.max(2, withText.length / 2) || rf.items >= 4 ? 2 : 3, `${rf.items} unreadable text block(s) in ${rf.frames} frame(s): ${ex(["small", "contrast", "cropped"], "fail")}`);
  const rw = count(["small", "contrast"], "warn");
  // one small secondary label is borderline (the gold MANUSCRIPT EP02 had one and the jury gave 4);
  // many of them make the whole frame hard to read on a phone
  if (rw.items) cap("readability", rw.items >= 4 ? 3 : 4, `${rw.items} borderline text block(s): ${ex(["small", "contrast"], "warn")}`);
  const cb = count(["band", "overlap", "cropped"]);
  if (cb.items) cap("composition", cb.frames >= 3 ? 2 : 3, `${cb.items} layout fault(s) in ${cb.frames} frame(s): ${ex(["band", "overlap", "cropped"])}`);
  if (!withText.length) why.readability.push("no DOM text measured (text in 3D textures is judged by eye)");
  const missing = frames.length - measured.length;
  return { format, frames, ceil, why, missing, summary: { framesWithText: withText.length, issues: measured.reduce((a, f) => a + f.issues.length, 0) } };
}

/** Short report lines for the console (one line per frame with issues). */
export function layoutLines(res) {
  const out = [];
  for (const f of res.frames) {
    if (f.missing) { out.push(`  frame ${f.frame}: not measured`); continue; }
    if (!f.issues.length) continue;
    const by = {};
    for (const i of f.issues) (by[i.kind] ??= []).push(i);
    out.push(`  frame ${f.frame}: ` + Object.entries(by).map(([k, l]) => `${k} ×${l.length} (${l[0].detail}${l[0].text ? `, "${l[0].text.slice(0, 20)}"` : ""})`).join(" · "));
  }
  return out;
}
