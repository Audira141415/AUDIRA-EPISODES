// Silent-draft timing: estimate clip and word times from the script, before any voice exists.
//   node scripts/estimate-timeline.mjs ep02
// In:  ../EP02_*/voiceover.json  (lines: id, who, text, speed?, gap?)
// Out: src/scenes/ep02/timeline.json, same shape as scripts/build-vo.mjs writes after the real voice,
//      so the film re-times itself when the Cartesia clips replace this estimate.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";

const ep = process.argv[2];
if (!/^ep\d\d$/.test(ep ?? "")) { console.error("usage: node scripts/estimate-timeline.mjs ep02"); process.exit(1); }
const dir = readdirSync("..").find((d) => d.toUpperCase().startsWith(ep.toUpperCase() + "_"));
const req = JSON.parse(readFileSync(`../${dir}/voiceover.json`, "utf8"));

const LEAD = req.lead ?? 0.8;
const TAIL = req.tail ?? 8.0; // closing line + AUDIRA outro after the last word
// Cartesia sonic-3 Indonesian at speed 1 runs about 2.4 words/s (Galang 137-147 WPM).
const wordDur = (w, speed) => (0.11 + 0.055 * w.replace(/[^\p{L}\p{N}]/gu, "").length) / speed;
const pauseAfter = (w) => (/[.!?…]$/.test(w) ? 0.32 : /[,;:]$/.test(w) ? 0.16 : 0);

let t = LEAD;
const clips = [];
for (const line of req.lines) {
  const speed = line.speed ?? 1;
  const toks = line.text.split(/\s+/).filter(Boolean);
  let u = t + 0.05;
  const words = toks.map((w, i) => {
    const s = u, e = u + wordDur(w, speed);
    u = e + (i < toks.length - 1 ? pauseAfter(w) : 0);
    return { w, s: +s.toFixed(3), e: +e.toFixed(3) };
  });
  const end = u + 0.08;
  clips.push({ id: line.id, who: line.who, text: line.text, start: +t.toFixed(3), end: +end.toFixed(3), words });
  t = end + (line.gap ?? 0.6);
}
const voEnd = clips.at(-1).end;
const total = +(voEnd + TAIL).toFixed(3);
writeFileSync(`src/scenes/${ep}/timeline.json`, JSON.stringify({ estimated: true, lead: LEAD, voEnd, total, clips }, null, 1));
const nWords = clips.reduce((a, c) => a + c.words.length, 0);
console.log(`${dir}: ${clips.length} lines, ${nWords} words, VO ends ~${voEnd.toFixed(1)} s, film ~${total.toFixed(1)} s (estimate)`);
