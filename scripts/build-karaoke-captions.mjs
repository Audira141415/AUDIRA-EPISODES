// AUDIRA Studio Karaoke Caption Generator
// Generates word-by-word active bouncing karaoke captions from voiceover_meta.json
// Usage: node scripts/build-karaoke-captions.mjs [--meta voiceover_meta.json] [--out video/compositions/captions.html]
import { readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const get = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : undefined);
const metaPath = get("--meta") || "voiceover_meta.json";
const outHtmlPath = get("--out") || "video/compositions/captions.html";

const meta = JSON.parse(readFileSync(metaPath, "utf8"));
const MAX_WORDS_PER_LINE = 5;

// Collect all words across sections
let allWords = [];
let cumulativeOffset = 0;

for (const [id, v] of Object.entries(meta.voices)) {
  const sectionWords = (v.words || []).map((w) => ({
    text: w.text,
    start: +(cumulativeOffset + w.start).toFixed(3),
    end: +(cumulativeOffset + w.end).toFixed(3)
  }));
  allWords.push(...sectionWords);
  cumulativeOffset += v.duration_s || 0;
}

// Group into compact mobile-friendly chunks (3-5 words)
const chunks = [];
let tempChunk = [];
for (let i = 0; i < allWords.length; i++) {
  const w = allWords[i];
  tempChunk.push(w);
  const isPunctuation = /[.,?!]$/.test(w.text);
  const next = allWords[i + 1];
  const isLongPause = next && (next.start - w.end >= 0.4);

  if (tempChunk.length >= MAX_WORDS_PER_LINE || isPunctuation || isLongPause || i === allWords.length - 1) {
    chunks.push({
      id: `chunk-${chunks.length}`,
      start: tempChunk[0].start,
      end: tempChunk[tempChunk.length - 1].end + 0.15,
      words: tempChunk
    });
    tempChunk = [];
  }
}

// Build HTML and GSAP timeline for karaoke
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

let spansHtml = "";
let gsapCode = "const tl = gsap.timeline({ paused: true });\n";

chunks.forEach((chunk, cIdx) => {
  const wordSpans = chunk.words
    .map((w, wIdx) => `<span id="w-${cIdx}-${wIdx}" class="k-word">${esc(w.text)}</span>`)
    .join(" ");

  spansHtml += `    <div id="c-${cIdx}" class="k-chunk" data-start="${chunk.start}" data-end="${chunk.end}">${wordSpans}</div>\n`;

  // Chunk visibility
  gsapCode += `  tl.fromTo("#c-${cIdx}", { display: "none", opacity: 0 }, { display: "block", opacity: 1, duration: 0.05 }, ${chunk.start});\n`;
  gsapCode += `  tl.to("#c-${cIdx}", { display: "none", opacity: 0, duration: 0.05 }, ${chunk.end});\n`;

  // Word-by-word karaoke bounce
  chunk.words.forEach((w, wIdx) => {
    const dur = Math.max(0.12, w.end - w.start);
    gsapCode += `  tl.to("#w-${cIdx}-${wIdx}", { color: "#FFF000", scale: 1.12, textShadow: "0 0 24px rgba(255,240,0,0.8)", duration: 0.08, ease: "back.out(2)" }, ${w.start});\n`;
    gsapCode += `  tl.to("#w-${cIdx}-${wIdx}", { color: "#FFFFFF", scale: 1, textShadow: "0 4px 12px rgba(0,0,0,0.8)", duration: 0.1 }, ${w.end});\n`;
  });
});

const template = `<template>
  <style>
    #root {
      position: absolute;
      inset: 0;
      pointer-events: none;
      font-family: 'Space Grotesk', system-ui, sans-serif;
    }
    .k-container {
      position: absolute;
      left: 64px;
      right: 64px;
      bottom: 420px; /* Safe Zone Guard */
      text-align: center;
    }
    .k-chunk {
      display: none;
      font-size: 52px;
      font-weight: 800;
      line-height: 1.35;
      color: #ffffff;
      text-shadow: 0 4px 16px rgba(0, 0, 0, 0.95);
      background: rgba(10, 14, 23, 0.65);
      padding: 12px 24px;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: inline-block;
    }
    .k-word {
      display: inline-block;
      margin: 0 4px;
      transform-origin: center center;
    }
  </style>
  <div id="root" data-composition-id="captions" data-width="1080" data-height="1920">
    <div class="k-container">
${spansHtml}
    </div>
  </div>
  <script>
${gsapCode}
    window.__timelines["captions"] = tl;
  </script>
</template>
`;

writeFileSync(outHtmlPath, template);

// Also produce standard SRT
const srtTime = (t) => {
  const ms = Math.round(t * 1000);
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  return `${h}:${m}:${s},${String(ms % 1000).padStart(3, "0")}`;
};

const srtContent = chunks
  .map((c, i) => `${i + 1}\n${srtTime(c.start)} --> ${srtTime(c.end)}\n${c.words.map((w) => w.text).join(" ")}\n`)
  .join("\n");
writeFileSync("captions.srt", srtContent);

console.log(`Generated ${chunks.length} karaoke caption chunks -> ${outHtmlPath} & captions.srt`);

