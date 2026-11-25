#!/usr/bin/env node
// CHRONICLE auto-director: naskah → plan → (voice) → render.
//
//   node scripts/make.mjs <story-id> [--plan|--stills 2s,9s|--preview|--final] [--wide] [--tts|--silent] [--no-music]
//
//   stories/<id>/naskah.txt   the script (FORMAT-NASKAH.md)
//   stories/<id>/vo.mp3|wav|m4a  the voice-over: captions, scene cuts and beats follow it word by word.
//                             Word timings come from whisper.cpp when it is installed (exact); without it the script
//                             lines are laid onto the VO's speech runs found by ffmpeg (line starts ≈ exact, words paced).
//   --tts                     no VO yet: a temporary narration with macOS `say` (voice Damayanti) on the paced timing
//   --silent                  preview / final without any voice (music + SFX only) — only when the buyer asks for it
//   --plan / --stills         need no voice: without a VO the script is paced at ~2.5 words per second
//
// Writes out/<id>/plan.json (+ src/generated/plan.json for the Studio), the mix public/stories/<id>/mix.wav, and
// out/<id>/<id>_preview_540x960.mp4 or out/<id>/<id>_1080x1920_60fps.mp4 (+ QA in out/<id>/qa/ after --final).

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync, spawnSync } from "node:child_process";
import { deliveryScan, sceneGate } from "./qa-gate.mjs";
import { planStory } from "../src/director/plan.ts";
import { parseNaskah } from "../src/director/parse.ts";
import { duration } from "./lib/media.mjs";

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const opt = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };
const id = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--stills");
if (!id) { console.error("usage: node scripts/make.mjs <story-id> [--plan|--stills 2s,9s|--preview|--final] [--wide] [--tts|--silent] [--no-music]"); process.exit(2); }
const dir = path.resolve("stories", id);
if (!fs.existsSync(path.join(dir, "naskah.txt"))) {
  console.error(`stories/${id}/naskah.txt tidak ada / not found — write the script there first (format: FORMAT-NASKAH.md)`);
  process.exit(2);
}
const out = path.resolve("out", id);
fs.mkdirSync(out, { recursive: true });
const src = fs.readFileSync(path.join(dir, "naskah.txt"), "utf8");
const rendering = !flag("--plan") && !opt("--stills");
const pub = path.resolve("public", "stories", id);
fs.mkdirSync(pub, { recursive: true });

const sh = (cmd, a, o = {}) => execFileSync(cmd, a, { stdio: ["ignore", "pipe", "pipe"], ...o }).toString();

// whisper.cpp (optional): WHISPER_CLI / WHISPER_MODEL, `whisper-cli` on PATH, Homebrew, common build folders
const exists = (f) => !!f && fs.existsSync(f);
const onPath = (cmd) => { try { return execFileSync("sh", ["-c", `command -v ${cmd}`], { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { return ""; } };
const findWhisper = () => {
  if (process.env.NO_WHISPER) return null; // test switch: force the speech-run alignment
  const home = os.homedir();
  const cli = [process.env.WHISPER_CLI, onPath("whisper-cli"), "/opt/homebrew/bin/whisper-cli", "/usr/local/bin/whisper-cli",
    path.join(home, "whisper.cpp/build/bin/whisper-cli")].find(exists);
  const dirs = [path.join(home, ".cache/whisper.cpp"), "models", "/opt/homebrew/share/whisper-cpp", path.join(home, "whisper.cpp/models")];
  const prefer = ["large-v3-turbo", "large-v3", "medium", "small"];
  const models = dirs.flatMap((d) => (fs.existsSync(d) ? fs.readdirSync(d).filter((f) => /^ggml-.*\.bin$/.test(f)).map((f) => path.join(d, f)) : []));
  const model = [process.env.WHISPER_MODEL].find(exists) ?? prefer.map((p) => models.find((m) => m.includes(p))).find(Boolean) ?? models[0];
  return cli && model ? { cli, model } : null;
};

// ---------------------------------------------------------------- voice
let times;
let audio;
const vo = ["vo.wav", "vo.mp3", "vo.m4a"].map((f) => path.join(dir, f)).find((f) => fs.existsSync(f));
const norm = (w) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

if (vo) {
  console.log("VO:", vo);
  const story = parseNaskah(src);
  const W = findWhisper();
  const cw = path.join(dir, "vo-words.json");
  if (fs.existsSync(cw)) {
    // EP42: Cartesia TTS gives exact word timestamps — use them (script words in order = spoken words in order)
    const heard = JSON.parse(fs.readFileSync(cw, "utf8")).map((x) => ({ w: norm(x.text), a: x.start, b: x.end }));
    let h = 0;
    times = story.scenes.map((sc) => sc.lines.map((l) => {
      const ws = l.words.map((w) => { const x = heard[Math.min(h++, heard.length - 1)]; if (x.w !== norm(w.w)) console.warn("vo-words mismatch:", w.w, "vs", x.w); return { w: w.w, t: x.a, e: x.b }; });
      return { a: ws[0].t, b: ws[ws.length - 1].e, words: ws.map((x) => ({ w: x.w, t: x.t })) };
    }));
    if (h !== heard.length) console.warn(`vo-words: ${heard.length} spoken, ${h} in script`);
    console.log("word timings: Cartesia vo-words.json (exact)");
  } else if (W) {
    const wav = path.join(out, "vo16k.wav");
    sh("ffmpeg", ["-y", "-v", "error", "-i", vo, "-ar", "16000", "-ac", "1", wav]);
    sh(W.cli, ["-m", W.model, "-f", wav, "-l", "id", "-ml", "1", "-sow", "-ojf", "-of", path.join(out, "vo_words")]);
    const j = JSON.parse(fs.readFileSync(path.join(out, "vo_words.json"), "utf8"));
    const heard = j.transcription.map((x) => ({ w: norm(x.text), a: x.offsets.from / 1000, b: x.offsets.to / 1000 })).filter((x) => x.w);
    // align script words to heard words, in order (greedy with a look-ahead)
    let h = 0;
    times = story.scenes.map((sc) => sc.lines.map((l) => {
      const ws = l.words.map((w) => {
        const n = norm(w.w);
        for (let k = h; k < Math.min(heard.length, h + 12); k++) {
          if (heard[k].w === n || (n.length > 3 && heard[k].w.startsWith(n.slice(0, 4)))) { h = k + 1; return { w: w.w, t: heard[k].a, e: heard[k].b }; }
          // whisper sometimes splits a name ("di ponegoro", "tegal rejo") or spells a number ("200 ribu")
          const two = k + 1 < heard.length ? heard[k].w + heard[k + 1].w : "";
          if (two && (two === n || (n.length > 5 && two.startsWith(n.slice(0, 6))))) { h = k + 2; return { w: w.w, t: heard[k].a, e: heard[k + 1].b }; }
        }
        return { w: w.w, t: null, e: null };
      });
      // fill gaps by interpolation
      for (let i = 0; i < ws.length; i++) if (ws[i].t === null) {
        const prev = ws.slice(0, i).reverse().find((x) => x.t !== null), next = ws.slice(i + 1).find((x) => x.t !== null);
        ws[i].t = prev && next ? (prev.e + next.t) / 2 : prev ? prev.e + 0.05 : next ? next.t - 0.25 : heard[Math.min(h, heard.length - 1)]?.a ?? 0;
        ws[i].e = ws[i].t + 0.25;
      }
      return { a: ws[0].t, b: ws[ws.length - 1].e, e0: ws[0].e, words: ws.map((x) => ({ w: x.w, t: x.t })) };
    }));
    // whisper's word starts run early (~0.3–0.6 s); a line that starts after a pause starts at that pause's end
    const sil = silences(vo);
    for (const sc of times) for (const T of sc) {
      // only when whisper put the line start inside a pause: move it to where the voice comes back
      // (unless whisper heard the first word end before that pause: then it was said before it)
      const o = sil.find(([a, b]) => T.a >= a - 0.15 && T.a < b && b - T.a < 2.5 && !(T.e0 <= a + 0.05 && T.e0 - T.a > 0.15))?.[1];
      if (o !== undefined && o > T.a) {
        const d = o - T.a;
        T.a += d;
        T.words = T.words.map((w, k) => ({ ...w, t: Math.max(w.t + d * Math.max(0, 1 - k / Math.max(3, T.words.length)), o + k * 0.05) }));
      }
      delete T.e0;
    }
    // keep every word after the one before it
    let last = -1;
    for (const sc of times) for (const T of sc) for (const w of T.words) { if (w.t < last + 0.04) w.t = last + 0.04; last = w.t; }
    for (const sc of times) for (const T of sc) T.a = Math.min(T.a, T.words[0].t);
    // whisper also squeezes pauses inside a line (an expressive VO: "April 1815, … Tambora … meledak"): words land up
    // to ~1 s early. Re-seat every word on the VO's speech runs; whisper's time is only a hint for which run.
    const moved = await wordsOntoRuns(vo, times);
    console.log(`word timings: whisper.cpp (${path.basename(W.model)}), words seated on the VO's speech runs (${moved} moved > 0.25 s)`);
  } else {
    times = await alignBySpeech(vo, story);
    console.log("word timings: whisper.cpp not found — script lines laid onto the VO's speech runs (line starts ≈ exact, words paced)");
  }
  const ext = path.extname(vo);
  fs.copyFileSync(vo, path.join(pub, "vo" + ext));
  audio = `stories/${id}/vo${ext}`;
} else if (flag("--tts")) {
  if (process.platform !== "darwin" || !onPath("say") || !sh("say", ["-v", "?"]).includes("Damayanti")) {
    console.error("--tts needs macOS with the Indonesian voice Damayanti (System Settings → Accessibility → Spoken Content). /\n" +
      "Narasi sementara (--tts) hanya bisa di macOS dengan suara Damayanti. Tanpa itu: rekam/buat VO (mis. ElevenLabs) dan simpan sebagai stories/" + id + "/vo.mp3.");
    process.exit(2);
  }
  // temporary narration: one `say` clip per line, placed on the paced timeline
  const plan0 = planStory(src, { id });
  const story = parseNaskah(src);
  const lines = story.scenes.flatMap((sc) => sc.lines.map((l) => l.text.replace(/\*/g, "")));
  const starts = [];
  { let wi = 0; for (const sc of story.scenes) for (const l of sc.lines) { starts.push(plan0.words[wi].t); wi += l.words.length; } }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "chron-tts-"));
  const parts = [];
  lines.forEach((t, i) => {
    const aiff = path.join(tmp, `l${i}.aiff`);
    sh("say", ["-v", "Damayanti", "-r", "175", "-o", aiff, t]);
    parts.push({ file: aiff, at: starts[i] });
  });
  // re-time: measure each clip, then lay lines out back to back with the planner's pauses
  const durs = await Promise.all(parts.map((p) => duration(p.file)));
  let t = 0.5;
  let li = 0;
  times = story.scenes.map((sc, si) => {
    if (si > 0) t += 0.35;
    const start = t;
    const res = sc.lines.map((l) => {
      const d = durs[li];
      parts[li].at = t;
      li++;
      const r = { a: t, b: t + d };
      t += d + (/[.?!]$/.test(l.text) ? 0.38 : 0.15);
      return r;
    });
    const min = sc.kind === "RUTE" ? 4.4 : sc.kind === "PETA" ? 3.0 : sc.kind === "PENUTUP" ? 0 : 0;
    if (t - start < min) t = start + min;
    return res;
  });
  const total = t + 5;
  const inputs = parts.flatMap((p) => ["-i", p.file]);
  const filt = parts.map((p, i) => `[${i}]adelay=${Math.round(p.at * 1000)}:all=1,aresample=48000[a${i}]`).join(";") + ";" + parts.map((_, i) => `[a${i}]`).join("") + `amix=inputs=${parts.length}:normalize=0,apad=whole_dur=${total.toFixed(2)},loudnorm=I=-16:TP=-1.5[out]`;
  const wav = path.join(pub, "vo_tts.wav");
  sh("ffmpeg", ["-y", "-v", "error", ...inputs, "-filter_complex", filt, "-map", "[out]", "-ar", "48000", "-ac", "2", wav]);
  audio = `stories/${id}/vo_tts.wav`;
  console.log("TTS narration:", wav);
} else if (rendering && !flag("--silent")) {
  console.error(`Belum ada suara: simpan VO sebagai stories/${id}/vo.mp3 (atau .wav/.m4a), atau tambah --tts untuk narasi sementara (macOS), atau --silent untuk video tanpa narasi.\n` +
    `No voice yet: put the voice-over at stories/${id}/vo.mp3 (or .wav/.m4a), or add --tts for a temporary macOS narration, or --silent for a film without narration.`);
  process.exit(2);
}

// ---------------------------------------------------------------- plan
const plan = planStory(src, { id, times, audio });
fs.writeFileSync(path.join(out, "plan.json"), JSON.stringify(plan, null, 1));
// ---------------------------------------------------------------- sound: original score + SFX + voice → mix.wav
if (rendering && !flag("--no-music")) {
  const voPath = audio ? path.resolve("public", audio) : "";
  execFileSync("node", ["scripts/sound.mjs", path.join(out, "plan.json"), path.join(pub, "mix.wav"), ...(voPath ? [voPath] : [])], { stdio: "inherit" });
  plan.audio = `stories/${id}/mix.wav`;
  fs.writeFileSync(path.join(out, "plan.json"), JSON.stringify(plan, null, 1));
}
fs.mkdirSync("src/generated", { recursive: true });
fs.writeFileSync("src/generated/plan.json", JSON.stringify(plan));
console.log(`plan: "${plan.title}" ${plan.duration}s, ${plan.scenes.length} adegan`);
for (const s of plan.scenes) console.log(`  ${s.a.toFixed(1).padStart(5)}–${s.b.toFixed(1).padEnd(5)} ${s.kind.padEnd(5)} ${s.map ? s.map.mode + " " + s.map.points.map((p) => p.name).join(" → ") : s.place ? s.place.set + "/" + s.place.mood + " · " + s.place.groups.map((g) => `${g.count}×${g.name}(${g.action})`).join(", ") : ""}`);
for (const w of plan.warnings) console.log("  ! " + w);
if (flag("--plan")) process.exit(0);

// ---------------------------------------------------------------- render
const props = path.join(out, "props.json");
fs.writeFileSync(props, JSON.stringify({ plan }));
const planFile = path.join(out, "plan.json");
const wide = flag("--wide"); // 16:9 (1920 × 1080) instead of 9:16
const gl = fs.existsSync(".gl-mode") ? fs.readFileSync(".gl-mode", "utf8").trim() : "angle";
if (opt("--stills")) {
  execFileSync("node", ["scripts/stills.mjs", path.join(out, wide ? "stills-wide" : "stills"), opt("--stills"), wide ? "ChroniclePreviewWide" : "ChroniclePreview", "1", planFile], { stdio: "inherit" });
  process.exit(0);
}
const final = flag("--final");
// QA gate (scripts/qa-gate.mjs): planned cuts = scene starts + camera beats (as in qa.mjs)
const cuts = [...new Set(plan.scenes.flatMap((sc) => [sc.a, ...(sc.place?.beats ?? []).map((b) => b.a)]))].filter((t) => t > 0).sort((a, b) => a - b);
const gateDir = path.join(out, wide ? "qa-gate-wide" : "qa-gate");
const gate = { comp: "ChroniclePreview" + (wide ? "Wide" : ""), cuts, out: gateDir, props };
if (final && !flag("--no-qa")) sceneGate({ ...gate, force: flag("--force-qa") });
const file = path.join(out, wide ? (final ? `${id}_1920x1080_60fps.mp4` : `${id}_preview_960x540.mp4`) : final ? `${id}_1080x1920_60fps.mp4` : `${id}_preview_540x960.mp4`);
execFileSync("npx", ["remotion", "render", (final ? "ChronicleFinal" : "ChroniclePreview") + (wide ? "Wide" : ""), file, `--props=${props}`, "--codec=h264", "--crf=18", `--concurrency=${final ? 3 : 2}`, `--gl=${gl}`, "--log=error"], { stdio: "inherit", shell: process.platform === "win32" }); // Windows: npx is npx.cmd, needs a shell
console.log("→", file);
if (!final && !flag("--no-qa")) sceneGate({ ...gate, force: true }); // a report: fix every FAIL before the preview is shown
if (final && !flag("--no-qa")) {
  try { execFileSync("node", ["scripts/qa.mjs", id, file], { stdio: "inherit" }); }
  catch { console.log("QA: some checks failed — read out/" + id + "/qa/report.json, fix, run --final again"); process.exitCode = 1; }
  if (deliveryScan({ file, cuts, out: path.join(gateDir, "delivered") }) === "FAIL") {
    console.error(`✗ the delivered film has a hard glitch (see ${path.join(gateDir, "delivered")}) — fix it before delivery`);
    process.exitCode = 1;
  }
}

// ---------------------------------------------------------------- helpers
/** Indonesian number words, for estimating how long a line takes to say. */
function terbilang(n) {
  const S = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
  if (n < 12) return S[n];
  if (n < 20) return terbilang(n - 10) + " belas";
  if (n < 100) return terbilang(Math.floor(n / 10)) + " puluh " + terbilang(n % 10);
  if (n < 200) return "seratus " + terbilang(n - 100);
  if (n < 1000) return terbilang(Math.floor(n / 100)) + " ratus " + terbilang(n % 100);
  if (n < 2000) return "seribu " + terbilang(n - 1000);
  if (n < 1e6) return terbilang(Math.floor(n / 1000)) + " ribu " + terbilang(n % 1000);
  if (n < 1e9) return terbilang(Math.floor(n / 1e6)) + " juta " + terbilang(n % 1e6);
  return String(n);
}
function spoken(text) {
  return text.replace(/\*/g, "").replace(/\d[\d.]*/g, (m) => { const n = parseInt(m.replace(/\./g, ""), 10); return Number.isFinite(n) ? terbilang(n) : m; });
}
/** Silences [start, end] in a voice file. */
function silences(file) {
  const txt = spawnSync("ffmpeg", ["-v", "info", "-i", file, "-af", "silencedetect=noise=-45dB:d=0.22", "-f", "null", "-"], { encoding: "utf8" }).stderr ?? "";
  const st = [...txt.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
  const en = [...txt.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
  return st.map((a, i) => [a, en[i] ?? Infinity]);
}

/** Speech runs [start, end] of a voice file (the gaps between silences ≥ 0.15 s: an expressive VO breathes short). */
async function speechRuns(file, db = -45, minSil = 0.15) {
  const dur = await duration(file);
  const txt = spawnSync("ffmpeg", ["-v", "info", "-i", file, "-af", `silencedetect=noise=${db}dB:d=${minSil}`, "-f", "null", "-"], { encoding: "utf8" }).stderr ?? "";
  const starts = [...txt.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
  const ends = [...txt.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
  const runs = [];
  let cur = 0;
  starts.forEach((s0, i) => { if (s0 - cur > 0.08) runs.push([cur, s0]); cur = ends[i] ?? dur; });
  if (dur - cur > 0.08) runs.push([cur, dur]);
  return runs;
}

/**
 * Re-seats whisper-timed words on the VO's speech runs (in place). Every run takes a block of consecutive words (or
 * none: a breath); a block's spoken length should fill its run, its first word should be near whisper's time (whisper
 * runs early, so early is cheap), and blocks like to start after punctuation. Inside a run, words are paced by
 * spoken length. Returns how many words moved more than 0.25 s.
 */
async function wordsOntoRuns(file, times) {
  const runs = await speechRuns(file);
  const lines = times.flat();
  const W = lines.flatMap((T, li) => T.words.map((w, k) => ({ ref: w, li, first: k === 0, t: w.t, c: spoken(w.w).replace(/[^\p{L}\p{N}]/gu, "").length + 2, punct: /[.,;:!?—–-]["”']?$/.test(w.w) || k === T.words.length - 1 })));
  const n = W.length, m = runs.length;
  if (!n || m < 2) return 0;
  const C = [0];
  for (const w of W) C.push(C[C.length - 1] + w.c);
  const speech = runs.reduce((s, [a, b]) => s + b - a, 0);
  const rho = speech / C[n]; // seconds per spoken char
  const INF = 1e18;
  const f = Array.from({ length: m + 1 }, () => new Float64Array(n + 1).fill(INF));
  const from = Array.from({ length: m + 1 }, () => new Int32Array(n + 1).fill(-2));
  f[0][0] = 0;
  for (let r = 1; r <= m; r++) {
    const [s, e] = runs[r - 1], d = e - s;
    for (let j = 0; j <= n; j++) {
      // skip run r (a breath or a noise): cheap when short
      if (f[r - 1][j] < INF) { const c = f[r - 1][j] + 0.4 + 6 * d * d; if (c < f[r][j]) { f[r][j] = c; from[r][j] = -1; } }
    }
    for (let k = 0; k < n; k++) {
      if (f[r - 1][k] >= INF) continue;
      const lead = W[k].t - s; // whisper start of the block's first word vs the run start
      const hint = lead < -1.6 ? 1 + 2 * (-1.6 - lead) : lead < 0 ? 0.12 * -lead : lead < 0.35 ? 0.3 * lead : 0.1 + 2 * (lead - 0.35);
      const brk = k === 0 || W[k - 1].punct ? 0 : 0.35;
      for (let j = k + 1; j <= n; j++) {
        const exp = (C[j] - C[k]) * rho;
        const err = (d - exp) / Math.max(0.6, exp);
        const c = f[r - 1][k] + 3 * err * err + hint + brk;
        if (c < f[r][j]) { f[r][j] = c; from[r][j] = k; }
        if (exp > d * 3 + 1) break;
      }
    }
  }
  if (f[m][n] >= INF) return 0;
  const blocks = [];
  for (let r = m, j = n; r > 0; r--) { const k = from[r][j]; if (k >= 0) { blocks.unshift({ r: r - 1, k, j }); j = k; } }
  let moved = 0;
  for (const { r, k, j } of blocks) {
    const [s, e] = runs[r];
    const tot = C[j] - C[k];
    for (let i = k; i < j; i++) {
      const t = s + ((e - s) * (C[i] - C[k])) / tot;
      if (Math.abs(t - W[i].ref.t) > 0.25) moved++;
      W[i].ref.t = +t.toFixed(3);
    }
    lines[W[j - 1].li].b = e; // a line ends where its last word's run ends (or later, if the line goes on)
  }
  for (const T of lines) { T.a = T.words[0].t; T.b = Math.max(T.b, T.words[T.words.length - 1].t + 0.2); }
  return moved;
}

// ---------------------------------------------------------------- no whisper: lines onto speech runs
async function alignBySpeech(file, story) {
  const dur = await duration(file);
  // silencedetect reports on stderr
  const txt = spawnSync("ffmpeg", ["-v", "info", "-i", file, "-af", "silencedetect=noise=-55dB:d=0.22", "-f", "null", "-"], { encoding: "utf8" }).stderr ?? "";
  const starts = [...txt.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
  const ends = [...txt.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
  // speech runs = the gaps between silences
  const runs = [];
  let cur = 0;
  starts.forEach((s0, i) => { if (s0 - cur > 0.08) runs.push([cur, s0]); cur = ends[i] ?? dur; });
  if (dur - cur > 0.08) runs.push([cur, dur]);
  if (!runs.length) runs.push([0, dur]);
  // cumulative speech time at the end of each run; candidate line boundaries = every pause between runs
  const cum = [0];
  for (const [a, b] of runs) cum.push(cum[cum.length - 1] + (b - a));
  const total = cum[cum.length - 1];
  const gapAfter = runs.map((r, k) => (k < runs.length - 1 ? runs[k + 1][0] - r[1] : 9));
  const lines = story.scenes.flatMap((sc) => sc.lines);
  const L = lines.length, M = runs.length;
  // spoken length: numbers are read as words ("1815" → "seribu delapan ratus lima belas")
  const chars = lines.map((l) => spoken(l.text).length + 4);
  const rate = total / chars.reduce((a, b) => a + b, 0);
  // DP: line i covers runs [j, k); boundaries sit on pauses, durations follow the text length, long pauses preferred
  const INF = 1e18;
  const f = Array.from({ length: L + 1 }, () => new Float64Array(M + 1).fill(INF));
  const from = Array.from({ length: L + 1 }, () => new Int32Array(M + 1).fill(-1));
  f[0][0] = 0;
  for (let i = 0; i < L; i++) {
    const exp = chars[i] * rate;
    const endWeight = /[.!?]["”']?$/.test(lines[i].text) ? 1 : 0.5;
    for (let j = 0; j < M; j++) {
      if (f[i][j] >= INF) continue;
      for (let k = j + 1; k <= M; k++) {
        if (L - i - 1 > M - k) break; // leave a run for every remaining line
        const d = cum[k] - cum[j];
        const err = (d - exp) / exp;
        const pause = k === M ? 0 : endWeight * 0.22 / (gapAfter[k - 1] + 0.05);
        const c = f[i][j] + err * err * 3 + pause;
        if (c < f[i + 1][k]) { f[i + 1][k] = c; from[i + 1][k] = j; }
        if (d > exp * 3) break;
      }
    }
  }
  const spans = [];
  if (f[L][M] < INF) {
    let k = M;
    for (let i = L; i > 0; i--) { const j = from[i][k]; spans.unshift([j, k]); k = j; }
  } else {
    // fewer runs than lines: split the speech by text length
    let acc = 0;
    for (let i = 0; i < L; i++) { spans.push([acc, acc + chars[i] * rate]); acc += chars[i] * rate; }
  }
  const toReal = (st) => { let acc = 0; for (const [a, b] of runs) { if (acc + (b - a) >= st - 1e-9) return a + (st - acc); acc += b - a; } return runs[M - 1][1]; };
  let li = 0;
  return story.scenes.map((sc) => sc.lines.map((l) => {
    const sp = spans[li++];
    const s0 = f[L][M] < INF ? cum[sp[0]] : sp[0], s1 = f[L][M] < INF ? cum[sp[1]] : sp[1];
    // words paced in speech time, so pauses inside the line stay pauses
    const w = l.words.map((x) => 0.6 + x.w.length * 0.08), tw = w.reduce((x, y) => x + y, 0);
    let k = 0;
    const words = l.words.map((x, q) => { const t = toReal(s0 + ((s1 - s0) * k) / tw + 1e-6); k += w[q]; return { w: x.w, t }; });
    return { a: toReal(s0 + 1e-6), b: toReal(s1), words };
  }));
}
