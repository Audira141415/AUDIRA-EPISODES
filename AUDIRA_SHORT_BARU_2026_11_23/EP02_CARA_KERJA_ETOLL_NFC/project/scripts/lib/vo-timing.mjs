// Load voice-over timing from either source and judge where a cut lands in the narration.
//   - `npm run vo` output (*.timing.json): pauses + phrases from silencedetect, optional whisper words
//   - Cartesia word timestamps: [{ text, start, end }] or { words: [...] }
// Times here are VO seconds. Film seconds = VO seconds + offset.

import fs from "node:fs";

const PAUSE_MIN = 0.25; // a gap between words this long counts as a breath/pause

/** @returns {{ duration:number, firstSpeech:number, lastSpeech:number, pauses:{start:number,end:number}[], phrases:{start:number,end:number}[], words:{text:string,start:number,end:number}[]|null }} */
export function loadVoTiming(timingFile, wordsFile) {
  let duration = 0, pauses = [], phrases = [], words = null;
  if (timingFile) {
    const j = JSON.parse(fs.readFileSync(timingFile, "utf8"));
    if (Array.isArray(j) || Array.isArray(j.words) && j.words[0]?.end !== undefined && !j.phrases) {
      words = normWords(Array.isArray(j) ? j : j.words);
    } else {
      duration = Number(j.duration) || 0;
      pauses = (j.pauses ?? []).map((p) => ({ start: +p.start, end: +p.end }));
      phrases = (j.phrases ?? []).map((p) => ({ start: +p.start, end: +p.end }));
      // whisper words carry only a start time: good for display, too vague to say "inside a word"
      if (Array.isArray(j.words) && j.words[0]?.end !== undefined) words = normWords(j.words);
    }
  }
  if (wordsFile) words = normWords(((j) => (Array.isArray(j) ? j : j.words ?? []))(JSON.parse(fs.readFileSync(wordsFile, "utf8"))));
  if (words?.length && !phrases.length) {
    // derive phrases/pauses from word gaps
    let s = words[0].start;
    for (let i = 1; i < words.length; i++) {
      if (words[i].start - words[i - 1].end >= PAUSE_MIN) {
        phrases.push({ start: s, end: words[i - 1].end });
        pauses.push({ start: words[i - 1].end, end: words[i].start });
        s = words[i].start;
      }
    }
    phrases.push({ start: s, end: words.at(-1).end });
  }
  if (words?.length) duration = Math.max(duration, words.at(-1).end);
  if (!duration && phrases.length) duration = phrases.at(-1).end;
  return {
    duration,
    firstSpeech: phrases[0]?.start ?? words?.[0]?.start ?? 0,
    lastSpeech: phrases.at(-1)?.end ?? words?.at(-1)?.end ?? duration,
    pauses,
    phrases,
    words,
  };
}

function normWords(arr) {
  return arr
    .map((w) => ({ text: String(w.text ?? w.word ?? w.w ?? "").trim(), start: Number(w.start ?? w.t), end: Number(w.end) }))
    .filter((w) => Number.isFinite(w.start) && Number.isFinite(w.end) && w.end >= w.start)
    .sort((a, b) => a.start - b.start);
}

/**
 * Where does a cut at VO time `t` land?
 *   pause         inside a breath/pause            -> ok
 *   outside       before speech starts / after it ends -> ok
 *   between-words on a word boundary with no pause  -> warn (no breathing room)
 *   mid-phrase    inside a phrase (no word timing)  -> warn
 *   in-word       chops a word in half             -> fail
 */
export function classifyCut(t, vo, slack = 0.04) {
  if (t <= vo.firstSpeech + slack || t >= vo.lastSpeech - slack) return { kind: "outside", level: "ok" };
  const p = vo.pauses.find((p) => t >= p.start - slack && t <= p.end + slack);
  if (p) return { kind: "pause", level: "ok", detail: `pause ${p.start.toFixed(2)}–${p.end.toFixed(2)}` };
  const near = nearestPause(t, vo);
  const hint = near ? ` nearest pause ${near.start.toFixed(2)}–${near.end.toFixed(2)} (${fmtShift(near, t)})` : "";
  if (vo.words?.length) {
    const w = vo.words.find((w) => t > w.start + slack && t < w.end - slack);
    if (w) return { kind: "in-word", level: "fail", detail: `cuts the word "${w.text}" (${w.start.toFixed(2)}–${w.end.toFixed(2)});${hint}` };
    return { kind: "between-words", level: "warn", detail: `between words, no pause;${hint}` };
  }
  return { kind: "mid-phrase", level: "warn", detail: `inside a phrase;${hint}` };
}

function nearestPause(t, vo) {
  let best = null, bd = Infinity;
  for (const p of vo.pauses) {
    const d = t < p.start ? p.start - t : t > p.end ? t - p.end : 0;
    if (d < bd) { bd = d; best = p; }
  }
  return best;
}

const fmtShift = (p, t) => {
  const target = (p.start + p.end) / 2, d = target - t;
  return `move ${d >= 0 ? "+" : ""}${d.toFixed(2)} s`;
};
