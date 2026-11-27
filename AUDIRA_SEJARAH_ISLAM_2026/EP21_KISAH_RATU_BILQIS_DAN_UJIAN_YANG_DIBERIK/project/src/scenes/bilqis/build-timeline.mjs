// Build timeline.json (lines/parts/words) for EP21 from audio/vo-lines.txt (one paragraph per part,
// same order as docs/SCRIPT.md) and audio/vo-words.json (Cartesia word times on audio/vo.wav).
//   node src/scenes/bilqis/build-timeline.mjs   (run inside project/)
import fs from "node:fs";
const EP = "..";
const PARTS = ["hook", "intro", "hudhud", "musyawarah", "singgasana", "samar", "kaca", "payoff"];
const paras = fs.readFileSync(`${EP}/audio/vo-lines.txt`, "utf8").trim().split(/\r?\n/).filter(Boolean);
const words = JSON.parse(fs.readFileSync(`${EP}/audio/vo-words.json`, "utf8"));
const r3 = (x) => Math.round(x * 1000) / 1000;
let k = 0, n = 0;
const lines = [], parts = [];
paras.forEach((p, pi) => {
  const sentences = p.match(/[^.?!]+[.?!]+/g).map((s) => s.trim());
  const pStart = words[k].start;
  for (const s of sentences) {
    const cnt = s.split(/\s+/).length;
    const ws = words.slice(k, k + cnt).map((w) => ({ w: w.text, s: r3(w.start), e: r3(w.end) }));
    k += cnt;
    lines.push({ id: `l${String(++n).padStart(2, "0")}`, part: PARTS[pi], display: s, start: ws[0].s, end: ws[ws.length - 1].e, words: ws });
  }
  parts.push({ id: PARTS[pi], start: r3(pStart), end: r3(words[k - 1].end) });
});
if (k !== words.length) throw new Error(`word count mismatch ${k} vs ${words.length}`);
const voEnd = r3(words[words.length - 1].end);
const tl = { lead: 0, voEnd, total: r3(voEnd + 3.65), tail: 3.65, parts, lines };
fs.writeFileSync("src/scenes/bilqis/timeline.json", JSON.stringify(tl, null, 1));
console.log(`lines ${lines.length}, voEnd ${voEnd}, total ${tl.total}`);
for (const p of parts) console.log(p.id, p.start, p.end);
