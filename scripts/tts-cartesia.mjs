// Cartesia TTS for AUDIRA voiceover.
// Usage: node scripts/tts-cartesia.mjs --request voiceover.json [--only id1,id2] [--voice <id>] [--out-dir assets/voice]
// Reads CARTESIA_API_KEY from .env (never logged). Writes one WAV per line plus
// voiceover_meta.json with duration and word timestamps (for captions).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const API = "https://api.cartesia.ai/tts/sse";
const VERSION = "2025-04-16";
const SAMPLE_RATE = 44100;

function loadEnv() {
  const p = resolve(".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

function args() {
  const a = process.argv.slice(2);
  const get = (k) => (a.includes(k) ? a[a.indexOf(k) + 1] : undefined);
  return {
    request: get("--request") ?? "voiceover.json",
    only: get("--only")?.split(","),
    voice: get("--voice"),
    outDir: get("--out-dir"),
    meta: get("--meta"),
  };
}

function wav(pcm) {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + pcm.length, 4);
  h.write("WAVEfmt ", 8);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20); // PCM
  h.writeUInt16LE(1, 22); // mono
  h.writeUInt32LE(SAMPLE_RATE, 24);
  h.writeUInt32LE(SAMPLE_RATE * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

async function synth(key, req, line) {
  const body = {
    model_id: req.model ?? "sonic-3",
    transcript: line.text,
    voice: { mode: "id", id: line.voice ?? req.voice },
    language: req.language ?? "id",
    output_format: { container: "raw", encoding: "pcm_s16le", sample_rate: SAMPLE_RATE },
    add_timestamps: true,
  };
  if (req.speed ?? line.speed) body.generation_config = { speed: line.speed ?? req.speed };

  const res = await fetch(API, {
    method: "POST",
    headers: { "X-API-Key": key, "Cartesia-Version": VERSION, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Cartesia ${res.status}: ${(await res.text()).slice(0, 300)}`);

  const chunks = [];
  const words = [];
  let buf = "";
  const handle = (evt) => {
    if (evt.type === "chunk" && evt.data) chunks.push(Buffer.from(evt.data, "base64"));
    else if (evt.type === "timestamps" && evt.word_timestamps) {
      const w = evt.word_timestamps;
      w.words.forEach((t, i) => words.push({ text: t, start: w.start[i], end: w.end[i] }));
    } else if (evt.type === "error") throw new Error(`Cartesia stream error: ${evt.error ?? JSON.stringify(evt)}`);
  };
  for await (const part of res.body) {
    buf += Buffer.from(part).toString("utf8");
    let i;
    while ((i = buf.indexOf("\n\n")) >= 0) {
      const block = buf.slice(0, i);
      buf = buf.slice(i + 2);
      const data = block.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).join("");
      if (data) handle(JSON.parse(data));
    }
  }
  const pcm = Buffer.concat(chunks);
  return { pcm, words, duration_s: pcm.length / 2 / SAMPLE_RATE };
}

loadEnv();
const key = process.env.CARTESIA_API_KEY;
if (!key) {
  console.error("CARTESIA_API_KEY is not set (.env)");
  process.exit(1);
}
const opt = args();
const req = JSON.parse(readFileSync(opt.request, "utf8"));
if (opt.voice) req.voice = opt.voice;
const outDir = opt.outDir ?? req.out_dir ?? "assets/voice";
const metaPath = opt.meta ?? req.meta ?? "voiceover_meta.json";
mkdirSync(outDir, { recursive: true });

const meta = existsSync(metaPath) ? JSON.parse(readFileSync(metaPath, "utf8")) : { voices: {} };
meta.model = req.model ?? "sonic-3";
meta.voice = req.voice;
for (const line of req.lines) {
  if (opt.only && !opt.only.includes(line.id)) continue;
  const r = await synth(key, req, line);
  const path = join(outDir, `${line.id}.wav`).replaceAll("\\", "/");
  writeFileSync(path, wav(r.pcm));
  meta.voices[line.id] = { path, text: line.text, duration_s: +r.duration_s.toFixed(3), words: r.words };
  console.log(`${line.id}: ${r.duration_s.toFixed(2)}s, ${r.words.length} words -> ${path}`);
}
meta.total_duration_s = +Object.values(meta.voices).reduce((s, v) => s + v.duration_s, 0).toFixed(3);
writeFileSync(metaPath, JSON.stringify(meta, null, 2));
console.log(`total: ${meta.total_duration_s}s -> ${metaPath}`);
