// Engine selector — probes input files with MediaBunny and recommends
// the best engine (remotion | world3d) based on format, codec, resolution,
// fps, duration, GPU availability, .gl-mode state, and style affinity.
//
// Addresses five engineering gaps:
//   1. Probe-based data (MediaBunny) — already present
//   2. Fallback logic: reads .gl-mode, auto-suggests world3d when swangle
//   3. Input validation: magic bytes, format whitelist, early bail on corrupt
//   4. Style-engine affinity: loaded from engine-affinity.json
//   5. Persist: writes ENGINE_DECISION.md to episode folder
//
// Usage:
//   import { selectEngine, persistDecision } from "./lib/engine-select.mjs";
//   const result = await selectEngine({ inputs, gpu, style });
//   persistDecision(result, episodeDir);
//
// Also runnable as CLI:
//   node scripts/lib/engine-select.mjs [--input=file.mp4] [--style=PIXELSTORY] [--episode=dir]

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { probe } from "./media.mjs";

// ── Magic bytes for supported media formats ──
const MAGIC = [
  { ext: "mp4",  offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] },            // ftyp
  { ext: "mov",  offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] },            // ftyp (same container)
  { ext: "webm", offset: 0, bytes: [0x1A, 0x45, 0xDF, 0xA3] },            // EBML
  { ext: "mkv",  offset: 0, bytes: [0x1A, 0x45, 0xDF, 0xA3] },            // EBML
  { ext: "wav",  offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] },            // RIFF
  { ext: "mp3a", offset: 0, bytes: [0xFF, 0xFB] },                        // MPEG frame sync
  { ext: "mp3b", offset: 0, bytes: [0xFF, 0xF3] },                        // MPEG frame sync
  { ext: "mp3c", offset: 0, bytes: [0xFF, 0xF2] },                        // MPEG frame sync
  { ext: "mp3d", offset: 0, bytes: [0x49, 0x44, 0x33] },                  // ID3 tag
  { ext: "flac", offset: 0, bytes: [0x66, 0x4C, 0x61, 0x43] },            // fLaC
  { ext: "ogg",  offset: 0, bytes: [0x4F, 0x67, 0x67, 0x53] },            // OggS
  { ext: "m4a",  offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] },            // ftyp (AAC in MP4)
  { ext: "aac",  offset: 0, bytes: [0xFF, 0xF1] },                        // ADTS sync
  { ext: "aacb", offset: 0, bytes: [0xFF, 0xF9] },                        // ADTS sync
];

const SUPPORTED_EXTS = new Set([
  ".mp4", ".mov", ".webm", ".mkv",
  ".wav", ".mp3", ".flac", ".ogg", ".m4a", ".aac",
]);

const MIN_FILE_BYTES = 128;

// ── Style-engine affinity ──
// Loaded from engine-affinity.json (sibling file) if it exists.
// Each key is uppercase style name, value is "remotion" | "world3d".
// Falls back to empty map if file missing.
let _affinityCache = null;
function loadAffinity() {
  if (_affinityCache) return _affinityCache;
  const affinityPath = path.join(
    path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")),
    "engine-affinity.json",
  );
  try {
    _affinityCache = JSON.parse(fs.readFileSync(affinityPath, "utf8"));
  } catch {
    _affinityCache = {};
  }
  return _affinityCache;
}

// ── .gl-mode detection ──
function readGlMode() {
  try {
    return fs.readFileSync(".gl-mode", "utf8").trim().toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Validate a single input file before probing.
 * Returns { valid, error? } — invalid files should be skipped with a warning.
 */
function validateInput(filePath) {
  if (!fs.existsSync(filePath)) return { valid: false, error: "file not found" };

  let stat;
  try { stat = fs.statSync(filePath); } catch { return { valid: false, error: "cannot stat file" }; }
  if (!stat.isFile()) return { valid: false, error: "not a regular file" };
  if (stat.size < MIN_FILE_BYTES) return { valid: false, error: `too small (${stat.size} bytes) — likely corrupt or empty` };

  const ext = path.extname(filePath).toLowerCase();
  if (!SUPPORTED_EXTS.has(ext)) return { valid: false, error: `unsupported format "${ext}" — expected: ${[...SUPPORTED_EXTS].join(", ")}` };

  // Magic bytes check
  let fd;
  try {
    fd = fs.openSync(filePath, "r");
    const buf = Buffer.alloc(12);
    fs.readSync(fd, buf, 0, 12, 0);
    const matched = MAGIC.some(m => {
      if (buf.length < m.offset + m.bytes.length) return false;
      return m.bytes.every((b, i) => buf[m.offset + i] === b);
    });
    if (!matched) return { valid: false, error: "magic bytes mismatch — file may be corrupt or mislabeled" };
  } catch (e) {
    return { valid: false, error: `cannot read file header: ${e.message}` };
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }

  return { valid: true };
}

/**
 * Probe one or more input files and return an engine recommendation.
 *
 * @param {object} opts
 * @param {string[]}  [opts.inputs]  — paths to reference/input media files
 * @param {string}    [opts.style]   — chosen style name (uppercase)
 * @param {boolean}   [opts.gpu]     — GPU available? (null = auto-detect)
 * @param {string}    [opts.userPick]— user's explicit engine choice (always wins)
 * @returns {Promise<EngineResult>}
 *
 * @typedef {object} EngineResult
 * @property {"remotion"|"world3d"} engine     — recommended engine
 * @property {"user"|"probe"|"style"|"fallback"|"default"} reason — why
 * @property {string}  summary   — one-line human explanation
 * @property {object[]} probes   — per-file probe results
 * @property {string[]} warnings — anything noteworthy
 * @property {object[]} validation — per-file validation results
 * @property {string|null} glMode — detected .gl-mode value
 * @property {string|null} styleAffinity — affinity from engine-affinity.json
 */
export async function selectEngine(opts = {}) {
  const { inputs = [], style, userPick, gpu } = opts;
  const warnings = [];
  const probes = [];
  const validation = [];

  // 1. User override always wins
  if (userPick) {
    const eng = userPick.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (eng === "world3d" || eng === "remotion") {
      return { engine: eng, reason: "user", summary: `User chose ${eng}.`, probes, warnings, validation, glMode: null, styleAffinity: null };
    }
    warnings.push(`Unrecognized engine "${userPick}" — falling back to auto-select.`);
  }

  // 2. Validate then probe input files
  for (const file of inputs) {
    const v = validateInput(file);
    validation.push({ file: path.basename(file), ...v });

    if (!v.valid) {
      warnings.push(`${path.basename(file)}: ${v.error}`);
      continue;
    }

    try {
      const p = await probe(file);
      probes.push({ file: path.basename(file), ...p });
    } catch (err) {
      warnings.push(`Probe failed for ${path.basename(file)}: ${err.message}`);
    }
  }

  // 3. GPU + .gl-mode detection
  const hasGpu = gpu ?? detectGpu();
  const glMode = readGlMode();
  const isSwangle = glMode === "swangle";

  if (isSwangle) {
    warnings.push("GL mode is swangle (software rendering) — GPU path previously failed.");
  }

  // 4. Style affinity lookup
  const affinity = loadAffinity();
  const upperStyle = style?.toUpperCase();
  const styleAffinity = upperStyle ? (affinity[upperStyle] || null) : null;

  // 5. Decision logic
  let engine = "remotion";
  let reason = "default";
  let summary = "Default engine: Remotion + R3F.";

  // 5a. Style affinity from engine-affinity.json
  if (styleAffinity) {
    engine = styleAffinity;
    reason = "style";
    summary = `${upperStyle} has ${styleAffinity} affinity (from engine-affinity.json).`;
  }

  // 5b. Probe-based signals
  if (probes.length > 0) {
    const signals = analyzeProbes(probes);
    if (reason === "default") reason = "probe";

    if (signals.hasWebM || signals.hasMatroska) {
      warnings.push("WebM/MKV input detected — Remotion handles MP4 natively, may need transcode for other containers.");
    }

    if (signals.maxRes > 3840) {
      warnings.push(`Very high resolution input (${signals.maxRes}px) — render times will be long.`);
    }

    if (signals.maxFps > 60) {
      warnings.push(`High FPS input (${signals.maxFps}) — final will be capped at 60 FPS.`);
    }

    if (signals.totalDuration > 300) {
      warnings.push(`Long input (${Math.round(signals.totalDuration)}s) — consider splitting into episodes.`);
    }

    if (!hasGpu && signals.videoCount === 0 && signals.audioCount > 0) {
      engine = "world3d";
      reason = "probe";
      summary = "Audio-only input + no GPU: world3d (lighter renderer) recommended.";
    }

    if (signals.videoCount > 0 && engine === "remotion") {
      summary = `Remotion + R3F recommended. Input: ${signals.videoCount} video(s), ${fmtRes(signals.maxWidth, signals.maxHeight)}, ${signals.maxFps} FPS, ${fmtDur(signals.totalDuration)}.`;
    }

    if (signals.audioCount > 0 && signals.videoCount === 0 && engine === "remotion") {
      summary = `Remotion + R3F recommended. Input: ${signals.audioCount} audio file(s), ${fmtDur(signals.totalDuration)}.`;
    }
  }

  // 5c. Swangle fallback: if .gl-mode says swangle, suggest world3d
  if (isSwangle && engine === "remotion") {
    engine = "world3d";
    reason = "fallback";
    summary = "GPU unavailable (.gl-mode = swangle) — world3d recommended to avoid slow software rendering.";
  } else if (!hasGpu && !isSwangle && engine === "remotion") {
    warnings.push("No GPU detected — Remotion will use software rendering (swangle), expect slow renders. Consider world3d if appropriate.");
  }

  return { engine, reason, summary, probes, warnings, validation, glMode: glMode || null, styleAffinity };
}

/**
 * Persist the engine decision to ENGINE_DECISION.md in the episode folder.
 * Makes the choice reproducible across sessions.
 */
export function persistDecision(result, episodeDir) {
  if (!episodeDir) return null;
  fs.mkdirSync(episodeDir, { recursive: true });
  const outPath = path.join(episodeDir, "ENGINE_DECISION.md");

  const probeLines = result.probes.map(p => {
    const v = p.video ? `${p.video.codec_name ?? "?"} ${p.video.width}x${p.video.height} @ ${p.fps} FPS` : "audio-only";
    const a = p.audio ? `${p.audio.codec_name ?? "?"} ${p.audio.sample_rate}Hz ${p.audio.channels}ch` : "";
    return `| ${p.file} | ${v} | ${a} | ${fmtDur(p.duration)} |`;
  });

  const validLines = result.validation.map(v =>
    `| ${v.file} | ${v.valid ? "OK" : "FAIL"} | ${v.valid ? "" : v.error} |`
  );

  const warnLines = result.warnings.map(w => `- ${w}`);

  const md = [
    `# Engine Decision`,
    ``,
    `> Auto-generated by engine-select. Do not edit — re-run preflight to update.`,
    ``,
    `| Field | Value |`,
    `| --- | --- |`,
    `| Engine | **${result.engine}** |`,
    `| Reason | ${result.reason} |`,
    `| Summary | ${result.summary} |`,
    `| GL Mode | ${result.glMode ?? "not set (default: angle)"} |`,
    `| Style Affinity | ${result.styleAffinity ?? "none"} |`,
    `| Date | ${new Date().toISOString().slice(0, 19)} |`,
    ``,
  ];

  if (result.validation.length) {
    md.push(
      `## Input Validation`,
      ``,
      `| File | Status | Error |`,
      `| --- | --- | --- |`,
      ...validLines,
      ``,
    );
  }

  if (result.probes.length) {
    md.push(
      `## Probe Results`,
      ``,
      `| File | Video | Audio | Duration |`,
      `| --- | --- | --- | --- |`,
      ...probeLines,
      ``,
    );
  }

  if (result.warnings.length) {
    md.push(`## Warnings`, ``, ...warnLines, ``);
  }

  fs.writeFileSync(outPath, md.join("\n") + "\n");
  return outPath;
}

/** Analyze probe results for decision signals. */
function analyzeProbes(probes) {
  let videoCount = 0, audioCount = 0;
  let maxRes = 0, maxWidth = 0, maxHeight = 0, maxFps = 0;
  let totalDuration = 0;
  let hasWebM = false, hasMatroska = false;

  for (const p of probes) {
    totalDuration += p.duration || 0;

    if (p.video) {
      videoCount++;
      const w = p.video.width || 0;
      const h = p.video.height || 0;
      maxWidth = Math.max(maxWidth, w);
      maxHeight = Math.max(maxHeight, h);
      maxRes = Math.max(maxRes, w, h);
      maxFps = Math.max(maxFps, p.fps || 0);

      const codec = (p.video.codec_name || "").toLowerCase();
      if (codec.includes("vp8") || codec.includes("vp9")) hasWebM = true;
    }

    if (p.audio && !p.video) {
      audioCount++;
    }

    const ext = (p.file || "").split(".").pop()?.toLowerCase();
    if (ext === "webm") hasWebM = true;
    if (ext === "mkv") hasMatroska = true;
  }

  return { videoCount, audioCount, maxRes, maxWidth, maxHeight, maxFps, totalDuration, hasWebM, hasMatroska };
}

/** Detect NVIDIA GPU. */
function detectGpu() {
  try {
    const r = spawnSync("nvidia-smi", ["--query-gpu=name", "--format=csv,noheader,nounits"], { encoding: "utf8", timeout: 5000 });
    return r.status === 0 && r.stdout.trim().length > 0;
  } catch {
    return false;
  }
}

function fmtRes(w, h) { return w && h ? `${w}x${h}` : "unknown"; }
function fmtDur(s) { return s > 60 ? `${Math.floor(s / 60)}m${Math.round(s % 60)}s` : `${Math.round(s)}s`; }

// ── CLI mode ──
const isCli = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
if (isCli) {
  const args = process.argv.slice(2);
  const opt = (k) => args.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
  const inputFiles = args.filter((a) => a.startsWith("--input=")).map((a) => a.slice(8));
  if (!inputFiles.length) {
    const plain = args.filter((a) => !a.startsWith("--") && fs.existsSync(a));
    inputFiles.push(...plain);
  }

  const result = await selectEngine({
    inputs: inputFiles,
    style: opt("style"),
    userPick: opt("engine"),
  });

  console.log(`\n  Engine Selection\n  ${"=".repeat(20)}\n`);
  console.log(`  Engine:  ${result.engine}`);
  console.log(`  Reason:  ${result.reason}`);
  console.log(`  Summary: ${result.summary}`);
  console.log(`  GL Mode: ${result.glMode ?? "not set"}`);
  console.log(`  Style:   ${result.styleAffinity ?? "no affinity"}`);

  if (result.validation.length) {
    console.log(`\n  Validated ${result.validation.length} file(s):`);
    for (const v of result.validation) {
      console.log(`    ${v.valid ? "✓" : "✗"} ${v.file}${v.error ? `: ${v.error}` : ""}`);
    }
  }

  if (result.probes.length) {
    console.log(`\n  Probed ${result.probes.length} file(s):`);
    for (const p of result.probes) {
      const v = p.video ? `${p.video.codec_name ?? "?"} ${p.video.width}x${p.video.height} @ ${p.fps} FPS` : "no video";
      const a = p.audio ? `${p.audio.codec_name ?? "?"} ${p.audio.sample_rate}Hz ${p.audio.channels}ch` : "no audio";
      console.log(`    ${p.file}: ${v}, ${a}, ${fmtDur(p.duration)}`);
    }
  }
  if (result.warnings.length) {
    console.log(`\n  Warnings:`);
    for (const w of result.warnings) console.log(`    ! ${w}`);
  }

  const ep = opt("episode");
  if (ep) {
    const saved = persistDecision(result, ep);
    if (saved) console.log(`\n  Decision saved to: ${saved}`);
  }

  console.log();
}
