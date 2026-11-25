// Script check for a long-form 16:9 video and its two shorts (rule 09), before the VO is made.
//   npm run script:check -- docs/SCRIPT.md [--wpm=135-150] [--short]
//
// Format of docs/SCRIPT.md:
//   ## Hook            (first 0–30 s; promise + glimpse of the payoff)
//   ## Intro           (brand AUDIRA in the voice)
//   ## Chapter 1: <title> … ## Chapter 8: <title>
//   ## Payoff / ## CTA / ## End screen
// Short candidates are marked inside the text with [SHORT 1] … [/SHORT 1] and [SHORT 2] … [/SHORT 2].
// Lines starting with > (stage directions), HTML comments and [VISUAL: …] notes are not spoken and not counted.
//
// Reports words and estimated seconds per section (135–150 WPM), the total, the two shorts, and the
// rule-09 checks: 8–12 min total (1,100–1,700 words), 5–8 chapters of 60–120 s, shorts of 45–90 s each,
// AUDIRA spoken in the hook or intro. With --short it checks a stand-alone short instead (200–240 words,
// AUDIRA in the hook or outro).

import fs from "node:fs";

const opt = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) ?? `=${d}`).split("=").slice(1).join("=");
const file = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (!file) { console.error("usage: npm run script:check -- docs/SCRIPT.md [--wpm=135-150] [--short]"); process.exit(2); }
const [lo, hi] = opt("wpm", "135-150").split("-").map(Number);
const short = process.argv.includes("--short");

const raw = fs.readFileSync(file, "utf8").replace(/<!--[\s\S]*?-->/g, "");
const spoken = (t) => t.split(/\r?\n/).filter((l) => !/^\s*>/.test(l) && !/^#/.test(l)).join(" ")
  .replace(/\[(VISUAL|SFX|CUT|B-ROLL)[^\]]*\]/gi, " ").replace(/\[\/?SHORT \d\]/gi, " ").replace(/[*_`#]/g, " ");
const words = (t) => (spoken(t).match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).length;
const secs = (w) => [Math.round((w / hi) * 60), Math.round((w / lo) * 60)];
const fmt = ([a, b]) => `${Math.floor(a / 60)}:${String(a % 60).padStart(2, "0")}–${Math.floor(b / 60)}:${String(b % 60).padStart(2, "0")}`;

const parts = [];
let cur = { title: "(sebelum heading pertama)", text: "" };
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^##\s+(.+)/);
  if (m) { if (cur.text.trim()) parts.push(cur); cur = { title: m[1].trim(), text: "" }; } else cur.text += line + "\n";
}
if (cur.text.trim()) parts.push(cur);

const red = [], warn = [];
let total = 0;
console.log(`${file}  (${lo}–${hi} WPM)`);
for (const p of parts) {
  const w = words(p.text); total += w;
  p.words = w; p.secs = secs(w);
  if (w === 0) continue;
  console.log(`  ${p.title.padEnd(42).slice(0, 42)} ${String(w).padStart(5)} kata  ≈ ${fmt(p.secs)}`);
}
console.log(`  ${"TOTAL".padEnd(42)} ${String(total).padStart(5)} kata  ≈ ${fmt(secs(total))}`);

const hookIntro = parts.filter((p) => /hook|intro/i.test(p.title)).map((p) => p.text).join(" ");
const outro = parts.filter((p) => /outro|cta|end/i.test(p.title)).map((p) => p.text).join(" ");

if (short) {
  if (total < 200 || total > 240) warn.push(`total ${total} kata; short 90 dtk = 200–240 kata`);
  if (!/audira/i.test(hookIntro + outro)) red.push("AUDIRA tidak disebut di hook atau outro (brand di suara)");
} else {
  if (total < 1100 || total > 1700) red.push(`total ${total} kata; video panjang 8–12 menit = 1.100–1.700 kata`);
  const chapters = parts.filter((p) => /^chapter\b|^bab\b/i.test(p.title));
  if (chapters.length < 5 || chapters.length > 8) red.push(`${chapters.length} chapter; harus 5–8`);
  for (const c of chapters) {
    if (c.secs[1] < 60) warn.push(`"${c.title}" ≈ ${fmt(c.secs)}, di bawah 60 dtk`);
    if (c.secs[0] > 120) warn.push(`"${c.title}" ≈ ${fmt(c.secs)}, di atas 120 dtk (sisipkan re-hook)`);
  }
  if (!parts.some((p) => /hook/i.test(p.title))) red.push("bagian ## Hook tidak ada");
  if (!/audira/i.test(hookIntro)) red.push("AUDIRA tidak disebut di hook atau intro (brand di suara)");
  for (const n of [1, 2]) {
    const m = raw.match(new RegExp(`\\[SHORT ${n}\\]([\\s\\S]*?)\\[\\/SHORT ${n}\\]`, "i"));
    if (!m) { red.push(`calon short ${n} belum ditandai ([SHORT ${n}] … [/SHORT ${n}])`); continue; }
    const w = words(m[1]), s = secs(w);
    console.log(`  ${`SHORT ${n}`.padEnd(42)} ${String(w).padStart(5)} kata  ≈ ${fmt(s)}`);
    if (s[1] < 45 || s[0] > 90) red.push(`short ${n} ≈ ${fmt(s)}; harus 45–90 dtk (${Math.ceil((45 * lo) / 60)}–${Math.floor((90 * hi) / 60)} kata)`);
  }
}

for (const r of red) console.log(`  RED   ${r}`);
for (const w of warn) console.log(`  WARN  ${w}`);
console.log(red.length ? "SCRIPT: RED, perbaiki sebelum minta acc" : "SCRIPT: OK, tampilkan tabel ini saat minta acc naskah");
process.exit(red.length ? 1 : 0);
