#!/usr/bin/env node
// Cartesia TTS: text or a timed voice-over script in, one WAV (+ word timestamps) out.
// Zero npm dependencies (Node >= 18 fetch) and no ffmpeg: the WAV is written from raw
// PCM, so it works in workspaces where the npm registry and CDNs are blocked.
// The --words output matches heygen-tts.mjs ([{id,text,start,end}]), so
// changelog-video/scripts/align-captions.mjs consumes it unchanged.
//
// Usage:
//   node cartesia-tts.mjs "Teks narasi" -o vo.wav --words vo-words.json
//   node cartesia-tts.mjs ./script.txt  -o vo.wav --words vo-words.json
//   node cartesia-tts.mjs --script docs/VOICEOVER.md -o vo.wav --words vo-words.json [--duration 45]
//   node cartesia-tts.mjs --script segments.json     -o vo.wav --words vo-words.json
//   node cartesia-tts.mjs --list [--lang id]
//
// --script places each line at its own start time on one timeline (silence between),
// so the VO lands on the seams the video was cut to. Accepted line forms:
//   [00:05] text      [0:05.5] text      00:05 - text      | 00:05 | text |   (markdown table)
//   segments.json: [{ "start": 5, "text": "..." }, ...]
// A line that would overrun the next start is reported as OVERRUN (shorten it or
// raise --speed); it is never silently cut.
//
// Flags: -o/--output, --words, --voice <id>, --lang (default id), --model (sonic-3),
//   --speed (0.6-1.5), --rate (44100), --duration <s> (pad the file to the video length).
// Key: $CARTESIA_API_KEY, else CARTESIA_API_KEY= in ./.env or ~/.audira/secrets.env.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { homedir } from "node:os";

const API = "https://api.cartesia.ai";
const VERSION = "2025-04-16";
const DEFAULT_VOICE = "a053f6bc-7df4-40de-96d4-de026bc47ce8"; // Andi - Dynamic Presenter (id)

const argv = process.argv.slice(2);
const flag = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  if (i < 0) return def;
  const v = argv[i + 1];
  return v === undefined || v.startsWith("--") ? true : v;
};
const die = (m) => {
  console.error(`x cartesia-tts: ${m}`);
  process.exit(1);
};

function loadKey() {
  if (process.env.CARTESIA_API_KEY) return process.env.CARTESIA_API_KEY.trim();
  for (const f of [join(process.cwd(), ".env"), join(homedir(), ".audira", "secrets.env")]) {
    if (!existsSync(f)) continue;
    const m = readFileSync(f, "utf8").match(/^\s*CARTESIA_API_KEY\s*=\s*["']?([^"'\r\n]+)/m);
    if (m) return m[1].trim();
  }
  return null;
}

const key = loadKey();
if (!key) die("no API key. Set CARTESIA_API_KEY or add it to ~/.audira/secrets.env");
const headers = { "X-API-Key": key, "Cartesia-Version": VERSION, "Content-Type": "application/json" };

const lang = typeof flag("lang") === "string" ? flag("lang") : "id";
const model = typeof flag("model") === "string" ? flag("model") : "sonic-3";
const rate = Number(flag("rate", 44100)) || 44100;
const speedRaw = Number(flag("speed", 1));
const speed = isFinite(speedRaw) && speedRaw > 0 ? Math.min(1.5, Math.max(0.6, speedRaw)) : 1;
const voiceId = typeof flag("voice") === "string" ? flag("voice") : DEFAULT_VOICE;

// ---------- --list ----------
if (flag("list") === true) {
  const r = await fetch(`${API}/voices?limit=100&language=${encodeURIComponent(lang)}`, { headers });
  if (!r.ok) die(`list failed: HTTP ${r.status} ${await r.text()}`);
  const { data = [] } = await r.json();
  for (const v of data) console.log(`${v.id}\t${v.name}\t${v.gender ?? ""}`);
  process.exit(0);
}

// ---------- input ----------
const positional = (() => {
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-o" || (a.startsWith("--") && argv[i + 1] && !argv[i + 1].startsWith("--"))) {
      i++;
      continue;
    }
    if (!a.startsWith("--")) return a;
  }
  return null;
})();

const parseTime = (s) => {
  const p = s.split(":").map(Number);
  return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p.length === 2 ? p[0] * 60 + p[1] : p[0];
};

function parseScript(file) {
  const raw = readFileSync(file, "utf8");
  if (file.endsWith(".json")) {
    return JSON.parse(raw).map((s) => ({ start: Number(s.start), text: String(s.text).trim() }));
  }
  const T = String.raw`(\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?|\d+(?:\.\d+)?s)`;
  const R = String.raw`(?:\s*[-–]\s*[\d:.s]+)?`; // optional range end: 00:05-00:09
  const pats = [
    new RegExp(String.raw`^\s*\|\s*${T}${R}\s*\|(.+)$`), // | 00:05 | text |
    new RegExp(String.raw`^\s*[-*]?\s*\[${T}${R}\]\s*[:\-–]?\s*(.+)$`), // [00:05] text
    new RegExp(String.raw`^\s*[-*]?\s*\**${T}${R}\**\s*[-–:|]\s*(.+)$`), // 00:05 - text
  ];
  const out = [];
  for (const line of raw.split(/\r?\n/)) {
    for (const re of pats) {
      const m = line.match(re);
      if (!m) continue;
      // In a table the narration is the last non-empty cell.
      let text = m[2].split("|").map((c) => c.trim()).filter(Boolean).pop() ?? "";
      text = text.replace(/[*_`]/g, "").replace(/^["“]|["”]$/g, "").trim();
      if (text) out.push({ start: m[1].endsWith("s") ? parseFloat(m[1]) : parseTime(m[1]), text });
      break;
    }
  }
  return out.sort((a, b) => a.start - b.start);
}

let segments;
const scriptPath = typeof flag("script") === "string" ? resolve(flag("script")) : null;
if (scriptPath) {
  if (!existsSync(scriptPath)) die(`script not found: ${scriptPath}`);
  segments = parseScript(scriptPath);
  if (!segments.length)
    die("no timed lines found. Use lines like `[00:05] text` or a `| 00:05 | text |` table");
} else {
  if (!positional) die("no text given. Pass a string, a .txt path, --script, or --list");
  const p = resolve(positional);
  const text = positional.endsWith(".txt") && existsSync(p) ? readFileSync(p, "utf8").trim() : positional;
  if (!text) die("input text is empty");
  segments = [{ start: 0, text }];
}

// ---------- synthesis ----------
async function synth(text) {
  const body = {
    model_id: model,
    transcript: text,
    voice: { mode: "id", id: voiceId },
    language: lang,
    add_timestamps: true,
    output_format: { container: "raw", encoding: "pcm_s16le", sample_rate: rate },
    ...(speed !== 1 ? { generation_config: { speed } } : {}),
  };
  for (let attempt = 1; attempt <= 3; attempt++) {
    const r = await fetch(`${API}/tts/sse`, { method: "POST", headers, body: JSON.stringify(body) });
    if (r.status === 429 || r.status >= 500) {
      await new Promise((ok) => setTimeout(ok, 1500 * attempt));
      continue;
    }
    if (!r.ok) die(`HTTP ${r.status}: ${await r.text()}`);
    const chunks = [];
    const words = [];
    for (const line of (await r.text()).split("\n")) {
      if (!line.startsWith("data:")) continue;
      const ev = JSON.parse(line.slice(5));
      if (ev.type === "error") die(ev.error ?? JSON.stringify(ev));
      if (ev.type === "chunk" && ev.data) chunks.push(Buffer.from(ev.data, "base64"));
      if (ev.type === "timestamps" && ev.word_timestamps) {
        const w = ev.word_timestamps;
        w.words.forEach((t, i) => words.push({ text: t, start: w.start[i], end: w.end[i] }));
      }
    }
    return { pcm: Buffer.concat(chunks), words };
  }
  die("Cartesia kept failing (rate limit / server error)");
}

const bytesPerSec = rate * 2;
const parts = [];
const allWords = [];
let cursor = 0;
let overruns = 0;

for (let i = 0; i < segments.length; i++) {
  const seg = segments[i];
  const { pcm, words } = await synth(seg.text);
  const dur = pcm.length / bytesPerSec;
  const start = Math.max(seg.start, cursor);
  if (start > cursor) parts.push(Buffer.alloc(Math.round((start - cursor) * rate) * 2));
  parts.push(pcm);
  for (const w of words)
    allWords.push({ text: w.text, start: +(start + w.start).toFixed(3), end: +(start + w.end).toFixed(3) });
  const next = segments[i + 1]?.start;
  const end = start + dur;
  const bad = start > seg.start + 0.01 || (next !== undefined && end > next + 0.01);
  if (bad) overruns++;
  console.error(
    `${bad ? "! OVERRUN" : "  ok     "} ${start.toFixed(2)}s -> ${end.toFixed(2)}s` +
      `${next !== undefined ? ` (next ${next.toFixed(2)}s)` : ""}  ${seg.text.slice(0, 60)}`,
  );
  cursor = end;
}

const padTo = Number(flag("duration", 0));
if (padTo > cursor) parts.push(Buffer.alloc(Math.round((padTo - cursor) * rate) * 2));

// ---------- write WAV (PCM s16le mono) ----------
const data = Buffer.concat(parts);
const hdr = Buffer.alloc(44);
hdr.write("RIFF", 0);
hdr.writeUInt32LE(36 + data.length, 4);
hdr.write("WAVE", 8);
hdr.write("fmt ", 12);
hdr.writeUInt32LE(16, 16);
hdr.writeUInt16LE(1, 20);
hdr.writeUInt16LE(1, 22);
hdr.writeUInt32LE(rate, 24);
hdr.writeUInt32LE(bytesPerSec, 28);
hdr.writeUInt16LE(2, 32);
hdr.writeUInt16LE(16, 34);
hdr.write("data", 36);
hdr.writeUInt32LE(data.length, 40);

const output = resolve(
  (typeof flag("output") === "string" && flag("output")) ||
    (argv.includes("-o") && argv[argv.indexOf("-o") + 1]) ||
    "narration.wav",
);
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, Buffer.concat([hdr, data]));

const wordsPath = typeof flag("words") === "string" ? resolve(flag("words")) : null;
if (wordsPath) {
  mkdirSync(dirname(wordsPath), { recursive: true });
  writeFileSync(wordsPath, JSON.stringify(allWords.map((w, i) => ({ id: `w${i}`, ...w })), null, 2));
}

console.log(
  `ok ${output} (${(data.length / bytesPerSec).toFixed(2)}s, ${segments.length} segment(s))` +
    `${wordsPath ? ` + ${wordsPath} (${allWords.length} words)` : ""}`,
);
if (overruns) console.error(`! ${overruns} segment(s) overrun their slot: shorten the line or use --speed 1.1`);

