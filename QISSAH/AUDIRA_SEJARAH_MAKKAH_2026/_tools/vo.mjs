// Narration for Sejarah Makkah episodes (rule 08: paths are computed from this file, never hard-coded).
//
//   node _tools/vo.mjs make  EP01   -> EP01_*/audio/voiceover.json   (chapter text split into clips of whole sentences)
//   node _tools/vo.mjs tts   EP01   -> Cartesia clips + audio/vo-meta.json (calls <WS>/scripts/tts-cartesia.mjs)
//   node _tools/vo.mjs build EP01   -> audio/vo.wav (-16 LUFS, long-form master track) + audio/timeline.json
//
// timeline.json (all times in seconds of vo.wav):
//   { lead, voEnd, total, endScreen, chapters:[{id,title,start,end}], clips:[{id,chapter,display,start,end,words:[{w,s,e}]}],
//     shorts:{ short01:{ hook:{...clip}, outro:{...clip} } } }
// Short hook/outro lines are voiced too (ids sNN_hook / sNN_outro) but are NOT placed in vo.wav; their own
// clip files and word times are listed under `shorts` so Stage B can assemble each short.
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SERIES = path.resolve(HERE, "..");
// seri selesai ada di <WS>/<KODE_CHANNEL>/<SERI>, seri yang masih dikerjakan di <WS>/<SERI>
const WS = [path.resolve(SERIES, ".."), path.resolve(SERIES, "..", "..")].find((d) => existsSync(path.join(d, "shared")));
const VOICE = "04b567df-2923-4b0c-896b-4b7df0a07e1a"; // Galang (AUDIRA default)

const [cmd, ep] = process.argv.slice(2);
const dirName = readdirSync(SERIES).find((d) => d.toUpperCase().startsWith((ep ?? "").toUpperCase() + "_"));
if (!cmd || !dirName) { console.error("usage: node _tools/vo.mjs make|tts|build EP01"); process.exit(1); }
const EPD = path.join(SERIES, dirName);
const AUD = path.join(EPD, "audio");
const src = JSON.parse(readFileSync(path.join(AUD, "vo-chapters.json"), "utf8"));

// Spoken form: words with an apostrophe (Ka'bah, Sa'i, Al-Qur'an) lose it so the TTS does not pause inside them.
// The word count stays identical, so display words map 1:1 onto Cartesia's word timestamps.
const spoken = (t) => t.replace(/[’']/g, "");
const sentences = (t) => t.replace(/\s+/g, " ").trim().split(/(?<=[.!?…])\s+(?=[A-Z0-9"“(])/);

function chunk(text, maxWords = 42) {
  const out = []; let cur = [];
  const n = (a) => a.join(" ").split(/\s+/).length;
  for (const s of sentences(text)) {
    if (cur.length && n([...cur, s]) > maxWords) { out.push(cur.join(" ")); cur = []; }
    cur.push(s);
  }
  if (cur.length) out.push(cur.join(" "));
  return out;
}

if (cmd === "make") {
  const lines = [];
  for (const c of src.chapters) {
    const parts = chunk(c.text);
    parts.forEach((p, i) => lines.push({
      id: `${c.id}_${String(i + 1).padStart(2, "0")}`, chapter: c.id, display: p, text: spoken(p),
      gap: i === parts.length - 1 ? 1.25 : 0.45,
    }));
  }
  for (const s of src.shorts ?? []) {
    const n = s.id.replace(/\D/g, "").padStart(2, "0");
    lines.push({ id: `s${n}_hook`, chapter: s.id, display: s.hook, text: spoken(s.hook), short: true });
    lines.push({ id: `s${n}_outro`, chapter: s.id, display: s.outro, text: spoken(s.outro), short: true });
  }
  const req = {
    model: "sonic-3", language: "id", voice: VOICE,
    out_dir: path.join(AUD, "clips").replace(/\\/g, "/"), meta: path.join(AUD, "vo-meta.json").replace(/\\/g, "/"),
    lead: 1.0, tail: 20.0, lines,
  };
  writeFileSync(path.join(AUD, "voiceover.json"), JSON.stringify(req, null, 1));
  const words = lines.filter((l) => !l.short).reduce((a, l) => a + l.text.split(/\s+/).length, 0);
  console.log(`${dirName}: ${lines.length} clips (${lines.filter((l) => l.short).length} short-only), ${words} spoken words`);
}

if (cmd === "tts") {
  mkdirSync(path.join(AUD, "clips"), { recursive: true });
  const env = { ...process.env }; delete env.CARTESIA_API_KEY; // the stale system key overrides .env (memory: cartesia-env-key-override)
  execFileSync("node", [path.join(WS, "scripts", "tts-cartesia.mjs"), "--request", path.join(AUD, "voiceover.json")], { cwd: WS, stdio: "inherit", env });
}

if (cmd === "build") {
  const req = JSON.parse(readFileSync(path.join(AUD, "voiceover.json"), "utf8"));
  const meta = JSON.parse(readFileSync(path.join(AUD, "vo-meta.json"), "utf8"));
  const clipOf = (l, t) => {
    const v = meta.voices[l.id];
    if (!v) throw new Error(`missing clip ${l.id} in vo-meta.json`);
    const disp = l.display.split(/\s+/);
    if (disp.length !== v.words.length) console.warn(`warn ${l.id}: ${disp.length} display words vs ${v.words.length} voiced`);
    return {
      id: l.id, chapter: l.chapter, display: l.display, start: +t.toFixed(3), end: +(t + v.duration_s).toFixed(3), file: `clips/${l.id}.wav`,
      words: v.words.map((w, i) => ({ w: disp[i] ?? w.text, s: +(t + w.start).toFixed(3), e: +(t + w.end).toFixed(3) })),
    };
  };
  let t = req.lead;
  const clips = [];
  for (const l of req.lines.filter((x) => !x.short)) { const c = clipOf(l, t); clips.push(c); t = c.end + (l.gap ?? 0.45); }
  const voEnd = clips.at(-1).end;
  const total = +(voEnd + req.tail).toFixed(3);
  const chapters = src.chapters.map((c) => {
    const cs = clips.filter((x) => x.chapter === c.id);
    return { id: c.id, title: c.title, start: cs[0].start, end: cs.at(-1).end };
  });
  const shorts = {};
  for (const l of req.lines.filter((x) => x.short)) {
    const [sid, part] = l.id.split("_");
    (shorts[l.chapter] ??= { id: l.chapter })[part] = clipOf(l, 0);
  }
  // Mix clips onto one track in batches (Windows command lines are limited), then loudness-normalise.
  const raw = path.join(AUD, "mix", "vo-raw.wav"); mkdirSync(path.dirname(raw), { recursive: true });
  const parts = [];
  for (let i = 0; i < clips.length; i += 40) {
    const b = clips.slice(i, i + 40), out = path.join(AUD, "mix", `part${parts.length}.wav`);
    const inputs = b.flatMap((c) => ["-i", path.join(AUD, c.file)]);
    const chains = b.map((c, k) => `[${k}:a]aresample=48000,adelay=${Math.round(c.start * 1000)}:all=1[a${k}]`).join(";");
    const mix = b.map((_, k) => `[a${k}]`).join("") + `amix=inputs=${b.length}:normalize=0,apad=whole_dur=${total}[m]`;
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...inputs, "-filter_complex", `${chains};${mix}`, "-map", "[m]", "-ar", "48000", "-ac", "1", out]);
    parts.push(out);
  }
  const pin = parts.flatMap((p) => ["-i", p]);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...pin, "-filter_complex", parts.map((_, k) => `[${k}:a]`).join("") + `amix=inputs=${parts.length}:normalize=0[m]`, "-map", "[m]", "-ar", "48000", "-ac", "1", raw]);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", raw, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", path.join(AUD, "vo.wav")]);
  writeFileSync(path.join(AUD, "timeline.json"), JSON.stringify({ lead: req.lead, voEnd, total, endScreen: req.tail, chapters, clips, shorts }, null, 1));
  console.log(`${dirName}: ${clips.length} clips, VO ends ${voEnd.toFixed(1)} s (${(voEnd / 60).toFixed(2)} min), film ${total.toFixed(1)} s`);
  for (const c of chapters) console.log(`  ${c.id.padEnd(18)} ${c.start.toFixed(1).padStart(6)} - ${c.end.toFixed(1).padStart(6)}  ${c.title}`);
}
