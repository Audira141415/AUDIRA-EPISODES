// Ep02 build: everything timed comes from ep02/timing.json (estimated words in the draft,
// Cartesia word timestamps once the voice exists), so a re-voice re-syncs the whole film.
//  - index.html: scene hosts, grid carrier, music, SFX, voice clips (voice mode only)
//  - each scene's anchor block  /*A*/{...}/*A*/  (word times, local to the scene)
//  - each scene's shared CSS block between @shared-start / @shared-end
//  - captions.html (per-word highlight), ep02/CAPTIONS.md, ep02/captions.srt
// Usage: node scripts/ep02-build.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const DIR = "ep02/video";
const timing = JSON.parse(readFileSync("ep02/timing.json", "utf8"));
const lines = Object.fromEntries(timing.lines.map((l) => [l.id, l]));
const voiced = timing.mode === "voice";

const clean = (s) => s.toLowerCase().replace(/[.,?!:;"]/g, "");
// Absolute time a word starts (or ends) in the film; nth picks a repeated word
function word(lineId, text, { nth = 0, edge = "start" } = {}) {
  const l = lines[lineId];
  const hits = l.words.filter((w) => clean(w.text) === clean(text));
  if (!hits[nth]) throw new Error(`anchor "${text}" #${nth} not in ${lineId}`);
  return l.offset + hits[nth][edge];
}
const lineEnd = (id) => lines[id].offset + lines[id].duration;

// ---------- scenes ----------
const END_CARD = 6.8; // end card hold after the last word
const SCENES = [
  { id: "s1", file: "s1-hook.html", line: "n1-hook", anchors: { num: ["33.000"], air: ["air,"], hari: ["hari."], itu: ["Itu"], maks: ["maksimal"], satu: ["satu"], dc: ["data"], jat: ["Jatiluhur."] } },
  { id: "s2", file: "s2-proyek.html", line: "n2-proyek", anchors: { proyek: ["Proyek"], bdx: ["BDx"], rp: ["Rp3,5"], tri: ["triliun"], resmi: ["diresmikan"], dedi: ["Dedi"], tgl: ["22"], kap: ["kapasitas"], mw: ["120"], mwEnd: ["megawatt.", { edge: "end" }] } },
  { id: "s3", file: "s3-air.html", line: "n3-air", anchors: { tahap: ["Tahap"], num: ["6.000"], hari: ["hari."], kata: ["Kata"], dibeli: ["dibeli"], pdam: ["PDAM,"], bukan: ["bukan"], waduk: ["waduk."] } },
  { id: "s4", file: "s4-sorotan.html", line: "n4-sorotan", anchors: { dprd: ["DPRD"], soroti: ["menyoroti."], waduk: ["Waduk"], num: ["240.000"], sawah: ["sawah."], per: ["Per"], amdal: ["AMDAL-nya"], proses: ["diproses."] } },
  { id: "s5", file: "s5-global.html", line: "n5-global", anchors: { ini: ["Ini"], riset: ["Riset"], satu: ["satu"], empat: ["empat"], rawan: ["rawan"], air: ["air."], fin: ["Finlandia,"], google: ["Google"], henti: ["dihentikan"] } },
  { id: "s6", file: "s6-respons.html", line: "n6-respons", anchors: { pem: ["Pemerintah"], menperin: ["Menperin"], usul: ["mengusulkan"], kel: ["berkelompok,"], pantai: ["pantai"], desal: ["desalinasi,"], agar: ["agar"], warga: ["warga."] } },
  { id: "s7", file: "s7-ekspansi.html", line: "n7-ekspansi", anchors: { eks: ["ekspansi"], telkom: ["TelkomGroup"], asp: ["aspirasi"], gw: ["1"], giga: ["gigawatt,"], mou: ["MoU"], pln: ["PLN"], hub: ["hub"], nas: ["nasional."] } },
  { id: "s8", file: "s8-penutup.html", line: "n8-penutup", anchors: { ai: ["AI"], dc: ["data"], dc2: ["Data"], air: ["air"], listrik: ["listrik."], menurut: ["Menurut"], mana: ["mana"], bangun: ["dibangun?"], tulis: ["Tulis"], komen: ["komentar."] } },
];

const LEAD = 0.3; // a scene lands just before its line starts
SCENES.forEach((s, i) => (s.start = i === 0 ? 0 : +(lines[s.line].offset - LEAD).toFixed(2)));
const TOTAL = +(lineEnd("n8-penutup") + END_CARD).toFixed(2);
SCENES.forEach((s, i) => (s.dur = +((SCENES[i + 1]?.start ?? TOTAL) - s.start).toFixed(2)));

const SHARED = readFileSync(`${DIR}/compositions/_shared.css`, "utf8").trim();
for (const s of SCENES) {
  const path = `${DIR}/compositions/${s.file}`;
  if (!existsSync(path)) continue;
  const A = { end: s.dur };
  for (const [k, [text, opts]] of Object.entries(s.anchors)) A[k] = +(word(s.line, text, opts) - s.start).toFixed(3);
  let src = readFileSync(path, "utf8");
  src = src.replace(/\/\*A\*\/[\s\S]*?\/\*A\*\//, `/*A*/${JSON.stringify(A)}/*A*/`);
  src = src.replace(/\/\* @shared-start \*\/[\s\S]*?\/\* @shared-end \*\//, `/* @shared-start */\n${SHARED}\n    /* @shared-end */`);
  writeFileSync(path, src);
}

// ---------- sound ----------
// One sound per visible action, never two on top of each other; seams get a short whoosh.
const sfx = [];
const add = (id, file, t, vol, dur) => sfx.push({ id, file, t: +t.toFixed(2), vol, dur });
SCENES.slice(1).forEach((s, i) => add(`sfx-seam-${i + 1}`, i % 2 ? "whoosh.mp3" : "whoosh-short.mp3", s.start - 0.22, 0.22, 0.57));
add("sfx-hook-hit", "impact-bass-1.mp3", word("n1-hook", "33.000") - 0.02, 0.42, 2.1);
add("sfx-hook-hari", "pop.mp3", word("n1-hook", "hari."), 0.3, 0.72);
add("sfx-hook-pin", "click-soft.mp3", word("n1-hook", "Jatiluhur."), 0.35, 0.4);
add("sfx-rp", "pop.mp3", word("n2-proyek", "Rp3,5") + 0.55, 0.3, 0.72);
add("sfx-mw", "pop.mp3", word("n2-proyek", "120") + 0.5, 0.3, 0.72);
add("sfx-tank", "click-soft.mp3", word("n3-air", "6.000"), 0.3, 0.4);
add("sfx-ha", "impact-bass-1.mp3", word("n4-sorotan", "240.000") + 0.4, 0.3, 2.1);
add("sfx-amdal", "click-soft.mp3", word("n4-sorotan", "AMDAL-nya"), 0.35, 0.4);
add("sfx-1of4", "pop.mp3", word("n5-global", "empat"), 0.3, 0.72);
add("sfx-fin", "click-soft.mp3", word("n5-global", "dihentikan"), 0.35, 0.4);
add("sfx-gw", "impact-bass-1.mp3", word("n7-ekspansi", "1") + 0.3, 0.32, 2.1);
add("sfx-q", "pop.mp3", word("n8-penutup", "dibangun?"), 0.3, 0.72);
sfx.sort((a, b) => a.t - b.t);

const pad = (n) => " ".repeat(n);
const host = (s) =>
  `${pad(6)}<div id="${s.id}" data-composition-id="${s.id}" data-composition-src="compositions/${s.file}" data-start="${s.start}" data-duration="${s.dur}" data-track-index="1" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index: 2"></div>`;
const voice = timing.lines
  .map((l) => `${pad(6)}<audio id="vo-${l.id}" class="clip" src="assets/voice/${l.id}.wav" data-start="${l.offset}" data-duration="${l.duration}" data-track-index="3" data-volume="1"></audio>`)
  .join("\n");
// Music sits low; with a voice it ducks further under every line
const MUSIC_VOL = voiced ? 0.22 : 0.55;
const seamTimes = SCENES.slice(1).map((s) => s.start);

const index = `<!doctype html>
<html lang="id" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #050605; }
      #root { width: 100%; height: 100%; background: #050605; }
      #stage-ground { position: absolute; inset: 0; background: #050605; }
      /* Grid carrier: one persistent layer the camera drags at every seam */
      #grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(198, 255, 61, 0.15) 2px, transparent 2px),
          linear-gradient(90deg, rgba(198, 255, 61, 0.15) 2px, transparent 2px),
          linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
        background-size: 240px 240px, 240px 240px, 60px 60px, 60px 60px;
        background-position: 0 0;
      }
      #vignette {
        position: absolute;
        inset: 0;
        background:
          radial-gradient(ellipse 80% 55% at 50% 38%, transparent 55%, rgba(5, 6, 5, 0.7) 100%),
          linear-gradient(180deg, transparent 62%, rgba(5, 6, 5, 0.9) 100%);
      }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1080" data-height="1920">
      <div id="stage-ground"></div>
      <div id="grid" style="z-index: 1"></div>
      <div id="vignette" style="z-index: 1"></div>

      <!-- Scenes (times generated from ep02/timing.json by scripts/ep02-build.mjs) -->
${SCENES.map(host).join("\n")}

      <!-- Captions: per-word highlight -->
      <div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="${TOTAL}" data-track-index="2" data-track-kind="captions" data-width="1080" data-height="1920" style="z-index: 10"></div>

${voiced ? `      <!-- Voiceover: Cartesia sonic-3, voice Galang, one clip per sentence cut in its silence -->\n${voice}\n` : "      <!-- Voiceover: not generated yet (draft). Captions use estimated word timings. -->\n"}
      <!-- Music: original track synthesized by scripts/ep02-music.mjs (no third-party licence) -->
      <audio id="music" class="clip" src="assets/music/bed.mp3" data-start="0" data-duration="${TOTAL}" data-track-index="6" data-volume="${MUSIC_VOL}"></audio>

      <!-- SFX (Pixabay Content License, bundled with HyperFrames media-use) -->
${sfx.map((x) => `${pad(6)}<audio id="${x.id}" class="clip" src="assets/sfx/${x.file}" data-start="${x.t}" data-duration="${x.dur}" data-track-index="${x.file.startsWith("impact") ? 5 : 4}" data-volume="${x.vol}"></audio>`).join("\n")}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      // Grid carrier: dragged one major cell left at every seam (the film's current)
      const seams = ${JSON.stringify(seamTimes)};
      seams.forEach((t) => {
        tl.fromTo("#grid", { backgroundPosition: "0px 0px" }, { backgroundPosition: "-240px 0px", duration: 0.7, ease: "power4.inOut", immediateRender: false }, t - 0.35);
      });
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
writeFileSync(`${DIR}/index.html`, index);

// ---------- captions (per-word) ----------
const MAX_WORDS = 4;
const groups = [];
for (const l of timing.lines) {
  const words = l.words.map((w) => ({ text: w.text, start: l.offset + w.start, end: l.offset + w.end }));
  let cur = [];
  const clauses = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    if (/[.,?!]$/.test(w.text) || !next || next.start - w.end >= 0.35) (clauses.push(cur), (cur = []));
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
  if (prev && prev.length < MAX_WORDS && groups[i][0].start - prev.at(-1).end < 0.6) (prev.push(...groups[i]), groups.splice(i, 1));
}
const EMPH = /^(33\.000|Rp3,5|triliun|120|megawatt|6\.000|240\.000|hektare|satu|empat|1|gigawatt|22)[.,?]?$/i;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const rows = groups.map((g, i) => {
  const start = Math.max(0.05, g[0].start - 0.06);
  const next = groups[i + 1];
  let end = g.at(-1).end + 0.3;
  // Hold through a breath inside the sentence so the band never blinks off mid-line
  if (next) end = next[0].start - g.at(-1).end < 1.2 ? next[0].start - 0.06 : Math.min(end, next[0].start - 0.06);
  return { i, start: +start.toFixed(2), end: +end.toFixed(2), words: g };
});
const capHtml = rows
  .map((r) => {
    const ws = r.words
      .map((w, k) => `<span id="w-${r.i}-${k}" class="w${EMPH.test(w.text) ? " em" : ""}" data-t="${(w.start - r.start).toFixed(3)}">${esc(w.text)}</span>`)
      .join("");
    return `    <div id="cap-${r.i}" class="clip cap" data-start="${r.start}" data-duration="${(r.end - r.start).toFixed(2)}" data-track-index="0"><div class="cap-t">${ws}</div></div>`;
  })
  .join("\n");
writeFileSync(
  `${DIR}/compositions/captions.html`,
  `<template>
  <style>
    #root { position: absolute; inset: 0; pointer-events: none; font-family: "Inter", sans-serif; }
    .cap { position: absolute; left: 0; top: 1176px; width: 1080px; padding: 0 100px; text-align: center; }
    .cap-t {
      display: inline-block;
      padding: 10px 22px 14px;
      border-radius: 14px;
      background: rgba(5, 6, 5, 0.72);
      font-weight: 900;
      font-size: 60px;
      line-height: 1.18;
      letter-spacing: -0.01em;
    }
    .w { display: inline-block; color: rgba(242, 245, 238, 0.42); margin: 0 0.19em; }
  </style>
  <div id="root" data-composition-id="captions" data-width="1080" data-height="1920">
${capHtml}
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    // Each word lights the moment it is spoken: upcoming dim, spoken white, figures lime
    document.querySelectorAll(".cap").forEach((el) => {
      const s = parseFloat(el.dataset.start);
      tl.fromTo(el.querySelector(".cap-t"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.14, ease: "power3.out" }, s);
      el.querySelectorAll(".w").forEach((w) => {
        const t = s + parseFloat(w.dataset.t);
        const lit = w.classList.contains("em") ? "#c6ff3d" : "#f2f5ee";
        tl.fromTo(w, { color: "rgba(242, 245, 238, 0.42)", scale: 1 }, { color: lit, scale: 1.08, duration: 0.08, ease: "power2.out" }, t);
        tl.to(w, { scale: 1, duration: 0.18, ease: "power2.out" }, t + 0.08);
      });
    });
    window.__timelines["captions"] = tl;
  </script>
</template>
`,
);

const fmt = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, "0")}`;
writeFileSync(
  "ep02/CAPTIONS.md",
  [
    "# CAPTIONS — EP02 Data center AI \"rakus\" air",
    "",
    `Mode timing: **${voiced ? "timestamp suara Cartesia" : "ESTIMASI (draft tanpa suara)"}**. Dibuat otomatis oleh \`scripts/ep02-build.mjs\` dari \`ep02/timing.json\`.`,
    "Gaya: subtitle per kata. Inter 900 60 px, maks. 4 kata per grup (1–2 baris), pita y 1176–1320 px. Kata belum diucapkan redup, kata terucap putih, angka bersumber lime.",
    "",
    "| # | Mulai | Selesai | Teks |",
    "|---|---|---|---|",
    ...rows.map((r) => `| ${r.i + 1} | ${fmt(r.start)} | ${fmt(r.end)} | ${r.words.map((w) => (EMPH.test(w.text) ? `**${w.text}**` : w.text)).join(" ")} |`),
    "",
  ].join("\n"),
);
const srt = (t) => {
  const ms = Math.round(t * 1000);
  const p = (n, l = 2) => String(n).padStart(l, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor((ms % 3600000) / 60000))}:${p(Math.floor((ms % 60000) / 1000))},${p(ms % 1000, 3)}`;
};
writeFileSync("ep02/captions.srt", rows.map((r, k) => `${k + 1}\n${srt(r.start)} --> ${srt(r.end)}\n${r.words.map((w) => w.text).join(" ")}\n`).join("\n"));

console.log(`total ${TOTAL}s · ${rows.length} caption groups · ${sfx.length} sfx`);
for (const s of SCENES) console.log(`${s.id} ${s.start} +${s.dur}`);
