// Per-episode voiceover assembly for the Roblox series.
// Reads <ep>/video/assets/audio/vo-meta.json and <ep>/scripts/vo-config.json, then writes
// <ep>/scripts/scenes.json (scene slots on the film clock), video/assets/audio/vo.wav,
// vo-words.json, compositions/captions.html (themed), captions.srt and docs/CAPTIONS.md.
// Usage (from the repo root): node scripts/ep-build-vo.mjs <ep-dir>
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const EP = process.argv[2];
const P = (f) => join(EP, f);
const SAMPLE_RATE = 44100;
const MAX_WORDS = 5;
const cfg = JSON.parse(readFileSync(P("scripts/vo-config.json"), "utf8"));
const meta = JSON.parse(readFileSync(P("video/assets/audio/vo-meta.json"), "utf8"));

// Scene slots: lead-in before each clip, a breath after it, a longer hold on the last scene
const ids = Object.keys(meta.voices);
const scenes = {};
let t = 0;
ids.forEach((id, i) => {
  const lead = i === 0 ? 0.1 : 0.25;
  const tail = i === ids.length - 1 ? 1.4 : 0.35;
  const dur = +(lead + meta.voices[id].duration_s + tail).toFixed(2);
  scenes[id] = { start: +t.toFixed(2), clip: +(t + lead).toFixed(2), dur };
  t += dur;
});
const TOTAL = +t.toFixed(2);
scenes.TOTAL = TOTAL;
writeFileSync(P("scripts/scenes.json"), JSON.stringify(scenes, null, 1));

const MERGES = (cfg.merges || []).concat([[["M", "C", "P"], "MCP"]]);
const EMPHASIS = new RegExp(cfg.emphasis || "^$");
const BREAK_AFTER = new Set(cfg.breakAfter || []);
function merge(words) {
  const out = [];
  for (let i = 0; i < words.length; ) {
    const hit = MERGES.find(([seq]) => seq.every((s, k) => words[i + k]?.text === s));
    if (hit) {
      const n = hit[0].length;
      out.push({ text: hit[1], start: words[i].start, end: words[i + n - 1].end });
      i += n;
    } else out.push(words[i++]);
  }
  return out;
}

const pcm = Buffer.alloc(Math.round(TOTAL * SAMPLE_RATE) * 2);
const allWords = [];
for (const id of ids) {
  const off = scenes[id].clip;
  readFileSync(P(`video/assets/audio/clips/${id}.wav`)).subarray(44).copy(pcm, Math.round(off * SAMPLE_RATE) * 2);
  merge(meta.voices[id].words).forEach((w) => allWords.push({ text: w.text, start: +(off + w.start).toFixed(3), end: +(off + w.end).toFixed(3), clip: id }));
}
const h = Buffer.alloc(44);
h.write("RIFF", 0);
h.writeUInt32LE(36 + pcm.length, 4);
h.write("WAVEfmt ", 8);
h.writeUInt32LE(16, 16);
h.writeUInt16LE(1, 20);
h.writeUInt16LE(1, 22);
h.writeUInt32LE(SAMPLE_RATE, 24);
h.writeUInt32LE(SAMPLE_RATE * 2, 28);
h.writeUInt16LE(2, 32);
h.writeUInt16LE(16, 34);
h.write("data", 36);
h.writeUInt32LE(pcm.length, 40);
writeFileSync(P("video/assets/audio/vo.wav"), Buffer.concat([h, pcm]));
writeFileSync(P("video/assets/audio/vo-words.json"), JSON.stringify(allWords, null, 1));

// Caption groups: break on punctuation or a pause, at most MAX_WORDS words, never across clips
const groups = [];
for (const id of ids) {
  const words = allWords.filter((w) => w.clip === id);
  const clauses = [];
  let cur = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    if (/[.,?!:]$/.test(w.text) || BREAK_AFTER.has(w.text) || !next || next.start - w.end >= 0.35) {
      clauses.push(cur);
      cur = [];
    }
  });
  for (const c of clauses) {
    const n = Math.ceil(c.length / MAX_WORDS);
    const size = Math.ceil(c.length / n);
    for (let k = 0; k < c.length; k += size) groups.push(c.slice(k, k + size));
  }
}
for (let i = groups.length - 1; i >= 0; i--) {
  if (groups[i].length !== 1) continue;
  const prev = groups[i - 1];
  const next = groups[i + 1];
  if (prev && prev.length < MAX_WORDS + 1 && prev.at(-1).clip === groups[i][0].clip && groups[i][0].start - prev.at(-1).end < 0.6) {
    prev.push(...groups[i]);
    groups.splice(i, 1);
  } else if (next && next.length < MAX_WORDS + 1 && next[0].clip === groups[i][0].clip && next[0].start - groups[i][0].end < 0.6) {
    next.unshift(...groups[i]);
    groups.splice(i, 1);
  }
}
const caps = groups.map((g, i) => {
  const start = g[0].start;
  const nextStart = groups[i + 1]?.[0].start ?? TOTAL;
  const end = Math.min(g.at(-1).end + 0.45, nextStart - 0.02);
  return {
    start: +start.toFixed(2),
    dur: +(end - start).toFixed(2),
    html: g.map((w) => (EMPHASIS.test(w.text) ? `<em>${w.text}</em>` : w.text)).join(" "),
    plain: g.map((w) => w.text).join(" "),
  };
});
const rows = caps
  .map((c, i) => `    <div id="cap-${i}" class="clip cap" data-start="${c.start}" data-duration="${c.dur}" data-track-index="0"><span class="cap-t">${c.html}</span></div>`)
  .join("\n");
writeFileSync(
  P("video/compositions/captions.html"),
  `<template>
  <style>
    #root {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
${cfg.captionCss}
  </style>
  <div id="root" data-composition-id="captions" data-width="1080" data-height="1920">
${rows}
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    document.querySelectorAll(".cap").forEach((el) => {
      tl.fromTo(el.querySelector(".cap-t"), ${cfg.captionIn || '{ opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.12, ease: "power2.out" }'}, parseFloat(el.dataset.start));
    });
    tl.set({}, {}, ${TOTAL});
    window.__timelines["captions"] = tl;
  </script>
</template>
`
);
const ts = (x) => {
  const ms = Math.round(x * 1000);
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
writeFileSync(P("captions.srt"), caps.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.start + c.dur)}\n${c.plain}\n`).join("\n"));
writeFileSync(
  P("docs/CAPTIONS.md"),
  `# CAPTIONS\nDari timestamp kata Cartesia (\`video/assets/audio/vo-words.json\`). ${caps.length} grup.\n\n| # | Mulai | Teks |\n|---|---|---|\n` +
    caps.map((c, i) => `| ${i + 1} | ${c.start.toFixed(2)} | ${c.plain} |`).join("\n") +
    "\n"
);

// Scene-local word times, to lock beats to the voice while building compositions
const lines = ids.map((id) => {
  const s = scenes[id];
  const ws = allWords.filter((w) => w.clip === id).map((w) => `${w.text}@${(w.start - s.start).toFixed(2)}`);
  return `${id} start=${s.start} dur=${s.dur}\n  ${ws.join(" ")}`;
});
writeFileSync(P("scripts/beats.txt"), lines.join("\n") + "\n");
console.log(`${EP}: ${TOTAL}s, ${caps.length} caption groups`);
