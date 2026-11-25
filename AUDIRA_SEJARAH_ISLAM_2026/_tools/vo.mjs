// Narration for Sejarah Islam shorts (rule 08: paths are computed from this file, never hard-coded).
//
//   node _tools/vo.mjs make  EP01   -> EP01_*/audio/voiceover.json  (from audio/vo-lines.json, spoken forms applied)
//   node _tools/vo.mjs tts   EP01   -> Cartesia clips + audio/vo-meta.json (calls <WS>/scripts/tts-cartesia.mjs)
//   node _tools/vo.mjs build EP01   -> audio/vo.wav (-16 LUFS) + audio/timeline.json + project/public/audio/vo.wav
//
// Display words (captions) and spoken words (TTS) can differ: years become words ("1349" -> "seribu tiga ratus
// empat puluh sembilan"), acronyms and foreign names get phonetic spellings. Each display word knows how many
// spoken words it became, so build() folds Cartesia's word times back onto the display words.
//
// timeline.json (seconds of vo.wav): { lead, voEnd, total, tail, parts:[{id,start,end}],
//   lines:[{id,part,display,start,end,words:[{w,s,e}]}] }
import { readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SERIES = path.resolve(HERE, "..");
// workspace root = nearest ancestor holding shared/ and CHANNEL_BRAND/ (series may live in <WS>/<CODE>/<SERIES>, rule 08 §1a)
let WS = path.resolve(SERIES, "..");
while (!(existsSync(path.join(WS, "shared")) && existsSync(path.join(WS, "CHANNEL_BRAND"))) && path.dirname(WS) !== WS) WS = path.dirname(WS);
const VOICE = "04b567df-2923-4b0c-896b-4b7df0a07e1a"; // Galang (AUDIRA default)
const LEAD = 0.6, TAIL = 4.0, GAP_LINE = 0.35, GAP_PART = 0.6;

const [cmd, ep] = process.argv.slice(2);
// --speed=1.15 (make): Cartesia generation speed. Galang reads ~129 WPM at 1.0; shorts need ~145-150.
const SPEED = Number((process.argv.find((a) => a.startsWith("--speed=")) ?? "=1").split("=")[1]);
const LEAD_KEEP = 0.1; // build trims each clip's leading silence down to this
const dirName = readdirSync(SERIES).find((d) => d.toUpperCase().startsWith((ep ?? "").toUpperCase() + "_"));
if (!cmd || !dirName) { console.error("usage: node _tools/vo.mjs make|tts|build EP01"); process.exit(1); }
const EPD = path.join(SERIES, dirName);
const AUD = path.join(EPD, "audio");

// ---------- spoken forms ----------
const ONES = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
function terbilang(n) {
  if (n < 12) return ONES[n];
  if (n < 20) return `${ONES[n - 10]} belas`;
  if (n < 100) return `${ONES[Math.floor(n / 10)]} puluh${n % 10 ? " " + ONES[n % 10] : ""}`;
  if (n < 200) return `seratus${n % 100 ? " " + terbilang(n % 100) : ""}`;
  if (n < 1000) return `${ONES[Math.floor(n / 100)]} ratus${n % 100 ? " " + terbilang(n % 100) : ""}`;
  if (n < 2000) return `seribu${n % 1000 ? " " + terbilang(n % 1000) : ""}`;
  if (n < 1e6) return `${terbilang(Math.floor(n / 1000))} ribu${n % 1000 ? " " + terbilang(n % 1000) : ""}`;
  throw new Error(`number too large: ${n}`);
}
// whole-word phonetic replacements (key compared without punctuation, case-insensitive)
const PHON = {
  x: "eks", pbb: "Perserikatan Bangsa-Bangsa", dixit: "Diksit", algorizmi: "Algorismi",
  khwarazm: "Khawarazem", kairouan: "Kairuan", alhazen: "Alhazen", "diyarbakır": "Diyarbakir", "diyarbakır,": "Diyarbakir", koffie: "kofi", kahve: "kahve",
};
function speak(word) {
  const m = word.match(/^([("“]*)(.*?)([)"”.,!?;:…]*)$/);
  const [, pre, core, post] = m;
  let out = core.replace(/[’']/g, "");
  if (/^\d+$/.test(out)) out = terbilang(Number(out));
  else if (PHON[out.toLowerCase()]) out = PHON[out.toLowerCase()];
  return `${pre}${out}${post}`.split(/\s+/);
}

if (cmd === "make") {
  const src = JSON.parse(readFileSync(path.join(AUD, "vo-lines.json"), "utf8"));
  const lines = src.lines.map((l, i) => {
    const disp = l.text.trim().split(/\s+/);
    const spokenParts = disp.map(speak);
    const next = src.lines[i + 1];
    return {
      id: l.id, part: l.part, display: l.text.trim(), text: spokenParts.flat().join(" "),
      counts: spokenParts.map((p) => p.length), gap: !next ? 0 : next.part !== l.part ? GAP_PART : GAP_LINE,
    };
  });
  const req = { model: "sonic-3", language: "id", voice: VOICE,
    out_dir: path.join(AUD, "clips").replace(/\\/g, "/"), meta: path.join(AUD, "vo-meta.json").replace(/\\/g, "/"),
    lead: LEAD, tail: TAIL, ...(SPEED !== 1 ? { speed: SPEED } : {}), lines };
  writeFileSync(path.join(AUD, "voiceover.json"), JSON.stringify(req, null, 1));
  const changed = lines.filter((l) => l.text !== l.display.replace(/[’']/g, ""));
  console.log(`${dirName}: ${lines.length} lines, ${lines.reduce((a, l) => a + l.text.split(/\s+/).length, 0)} spoken words`);
  for (const l of changed) console.log(`  ${l.id}: ${l.text}`);
}

if (cmd === "tts") {
  mkdirSync(path.join(AUD, "clips"), { recursive: true });
  const env = { ...process.env }; delete env.CARTESIA_API_KEY; // the stale system key overrides .env (memory: cartesia-env-key-override)
  execFileSync("node", [path.join(WS, "scripts", "tts-cartesia.mjs"), "--request", path.join(AUD, "voiceover.json")], { cwd: WS, stdio: "inherit", env });
}

if (cmd === "build") {
  const req = JSON.parse(readFileSync(path.join(AUD, "voiceover.json"), "utf8"));
  const meta = JSON.parse(readFileSync(path.join(AUD, "vo-meta.json"), "utf8"));
  let t = req.lead;
  const lines = [];
  for (const l of req.lines) {
    const v = meta.voices[l.id];
    if (!v) throw new Error(`missing clip ${l.id} in vo-meta.json`);
    const disp = l.display.split(/\s+/);
    const need = l.counts.reduce((a, b) => a + b, 0);
    if (need !== v.words.length) console.warn(`warn ${l.id}: expected ${need} spoken words, Cartesia returned ${v.words.length}`);
    const cut = Math.max(0, v.words[0].start - LEAD_KEEP); // leading silence removed from the clip
    const words = [];
    let k = 0;
    disp.forEach((w, i) => {
      const a = v.words[Math.min(k, v.words.length - 1)], b = v.words[Math.min(k + l.counts[i] - 1, v.words.length - 1)];
      words.push({ w, s: +(t + a.start - cut).toFixed(3), e: +(t + b.end - cut).toFixed(3) });
      k += l.counts[i];
    });
    for (const w of v.words) if (w.end - w.start > 1.2) console.warn(`warn ${l.id}: "${w.text}" lasts ${(w.end - w.start).toFixed(2)} s (spelled out?)`);
    const dur = v.duration_s - cut;
    lines.push({ id: l.id, part: l.part, display: l.display, start: +t.toFixed(3), end: +(t + dur).toFixed(3), file: `clips/${l.id}.wav`, cut: +cut.toFixed(3), words });
    t += dur + (l.gap ?? 0);
  }
  const voEnd = lines.at(-1).end, total = +(voEnd + req.tail).toFixed(3);
  const parts = [];
  for (const l of lines) {
    const p = parts.at(-1);
    if (p && p.id === l.part) p.end = l.end; else parts.push({ id: l.part, start: l.start, end: l.end });
  }
  const raw = path.join(AUD, "mix", "vo-raw.wav"); mkdirSync(path.dirname(raw), { recursive: true });
  const inputs = lines.flatMap((c) => ["-i", path.join(AUD, c.file)]);
  const chains = lines.map((c, k) => `[${k}:a]atrim=start=${c.cut},asetpts=PTS-STARTPTS,aresample=48000,adelay=${Math.round(c.start * 1000)}:all=1[a${k}]`).join(";");
  const mix = lines.map((_, k) => `[a${k}]`).join("") + `amix=inputs=${lines.length}:normalize=0,apad=whole_dur=${total}[m]`;
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...inputs, "-filter_complex", `${chains};${mix}`, "-map", "[m]", "-ar", "48000", "-ac", "1", raw]);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", raw, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", path.join(AUD, "vo.wav")]);
  writeFileSync(path.join(AUD, "timeline.json"), JSON.stringify({ lead: req.lead, voEnd, total, tail: req.tail, parts, lines }, null, 1));
  const pub = path.join(EPD, "project", "public", "audio"); mkdirSync(pub, { recursive: true });
  copyFileSync(path.join(AUD, "vo.wav"), path.join(pub, "vo.wav"));
  const words = lines.reduce((a, l) => a + l.words.length, 0);
  console.log(`${dirName}: VO ends ${voEnd.toFixed(1)} s, film ${total.toFixed(1)} s, ${Math.round(words / (voEnd - req.lead) * 60)} display WPM`);
  for (const p of parts) console.log(`  ${p.id.padEnd(18)} ${p.start.toFixed(1).padStart(5)} - ${p.end.toFixed(1).padStart(5)}`);
}
