// Builds video/compositions/captions.html and CAPTIONS.md from voiceover_meta.json.
// Usage: node scripts/build-captions.mjs
import { readFileSync, writeFileSync } from "node:fs";

// Absolute start of each voiceover clip in the film (must match video/index.html)
const OFFSETS = {
  "s1-hook": 0.3,
  "s2-fakta": 4.7,
  "s3-konteks": 17.1,
  "s4-dampak": 33.05,
  "s5-tantangan": 44.95,
  "s6-penutup": 56.9,
};
const MAX_WORDS = 5;
// Selective emphasis: sourced figures only
const EMPHASIS = /^(lima|miliar|Rp88|triliun|30|hektare|1,47|gigawatt|700|800|2035)[.,?]?$/i;

const meta = JSON.parse(readFileSync("voiceover_meta.json", "utf8"));
const groups = [];
for (const [id, v] of Object.entries(meta.voices)) {
  const off = OFFSETS[id];
  const words = v.words.map((w) => ({ text: w.text, start: off + w.start, end: off + w.end }));
  // Clauses end at punctuation or a long pause
  const clauses = [];
  let cur = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    if (/[.,?!]$/.test(w.text) || !next || next.start - w.end >= 0.35) {
      clauses.push(cur);
      cur = [];
    }
  });
  // Long clauses split into balanced chunks of at most MAX_WORDS
  for (const c of clauses) {
    const n = Math.ceil(c.length / MAX_WORDS);
    const size = Math.ceil(c.length / n);
    for (let k = 0; k < c.length; k += size) groups.push(c.slice(k, k + size));
  }
}

// A one-word clause joins its neighbour when the pair stays short
for (let i = groups.length - 1; i >= 0; i--) {
  if (groups[i].length !== 1) continue;
  const prev = groups[i - 1];
  const next = groups[i + 1];
  if (prev && prev.length < MAX_WORDS + 1 && groups[i][0].start - prev.at(-1).end < 0.6) {
    prev.push(...groups[i]);
    groups.splice(i, 1);
  } else if (next && next.length < MAX_WORDS + 1 && next[0].start - groups[i][0].end < 0.6) {
    next.unshift(...groups[i]);
    groups.splice(i, 1);
  }
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const rows = groups.map((g, i) => {
  const start = Math.max(0.1, g[0].start - 0.05);
  const next = groups[i + 1];
  let end = g.at(-1).end + 0.25;
  if (next) end = Math.min(end, next[0].start - 0.05);
  return { i, start: +start.toFixed(2), end: +end.toFixed(2), words: g };
});

const html = rows
  .map((r) => {
    const words = r.words.map((w) => (EMPHASIS.test(w.text) ? `<em>${esc(w.text)}</em>` : esc(w.text))).join(" ");
    return `    <div id="cap-${r.i}" class="clip cap" data-start="${r.start}" data-duration="${(r.end - r.start).toFixed(2)}" data-track-index="0"><span class="cap-t">${words}</span></div>`;
  })
  .join("\n");

const doc = `<template>
  <style>
    #root {
      position: absolute;
      inset: 0;
      pointer-events: none;
      font-family: "Inter", sans-serif;
    }
    .cap {
      position: absolute;
      left: 0;
      top: 1170px;
      width: 1080px;
      padding: 0 110px;
      text-align: center;
      overflow: visible;
    }
    .cap-t {
      display: inline;
      padding: 6px 16px;
      background: rgba(11, 14, 18, 0.62);
      box-decoration-break: clone;
      -webkit-box-decoration-break: clone;
      font-weight: 700;
      font-size: 52px;
      line-height: 1.42;
      color: #f4f6f8;
    }
    .cap-t em {
      font-style: normal;
      color: #5b9bff;
    }
  </style>
  <div id="root" data-composition-id="captions" data-width="1080" data-height="1920">
${html}
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    document.querySelectorAll(".cap").forEach((el) => {
      const s = parseFloat(el.dataset.start);
      tl.fromTo(el.querySelector(".cap-t"), { opacity: 0 }, { opacity: 1, duration: 0.08, ease: "none" }, s);
    });
    window.__timelines["captions"] = tl;
  </script>
</template>
`;
writeFileSync("video/compositions/captions.html", doc);

const fmt = (t) => {
  const m = Math.floor(t / 60);
  const s = (t - m * 60).toFixed(2).padStart(5, "0");
  return `${m}:${s}`;
};
const md = [
  "# CAPTIONS — AUDIRA DATA CENTER NEWS",
  "",
  "Subtitle on-screen (burned-in) per frasa, diturunkan otomatis dari timestamp kata Cartesia (`voiceover_meta.json`) oleh `scripts/build-captions.mjs`.",
  "Gaya: Inter 700 52 px, putih di atas backing gelap 62%, maks. 2 baris, pita y ±1170–1320 px. Kata **tebal** = penekanan warna biru (angka bersumber saja).",
  "",
  "| # | Mulai | Selesai | Teks |",
  "|---|---|---|---|",
  ...rows.map((r) => `| ${r.i + 1} | ${fmt(r.start)} | ${fmt(r.end)} | ${r.words.map((w) => (EMPHASIS.test(w.text) ? `**${w.text}**` : w.text)).join(" ")} |`),
  "",
  `Total ${rows.length} grup.`,
  "",
].join("\n");
writeFileSync("CAPTIONS.md", md);

// SRT sidecar for platforms that accept uploaded subtitles
const srtTime = (t) => {
  const ms = Math.round(t * 1000);
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  return `${h}:${m}:${s},${String(ms % 1000).padStart(3, "0")}`;
};
writeFileSync(
  "captions.srt",
  rows.map((r, k) => `${k + 1}\n${srtTime(r.start)} --> ${srtTime(r.end)}\n${r.words.map((w) => w.text).join(" ")}\n`).join("\n"),
);
console.log(`${rows.length} caption groups`);
