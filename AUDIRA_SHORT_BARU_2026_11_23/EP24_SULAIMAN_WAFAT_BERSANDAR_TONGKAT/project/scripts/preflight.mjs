// Pre-flight health check: run BEFORE pipeline starts (stage 0).
// Checks ALL dependencies the 11-stage pipeline needs, not just build deps.
// Covers weaknesses #1 (no health check), #6 (disk+dup), #7 (TTS), #8 (gate bypass).
//   node scripts/preflight.mjs [--episode=<dir>] [--fix]
//
// Exit 0 = all green, 1 = has blockers, 2 = has warnings only.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { selectEngine, persistDecision } from "./lib/engine-select.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k) => args.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const fix = args.includes("--fix");
const episodeDir = opt("episode");

const rows = [];
const add = (level, area, msg) => rows.push({ level, area, msg });

// ── 1. System deps ──
const has = (cmd, a = ["--version"]) => {
  const r = spawnSync(cmd, a, { encoding: "utf8", shell: true, timeout: 10000 });
  return r.status === 0 ? (r.stdout || r.stderr).split("\n")[0].trim() : null;
};

const [maj, min] = process.versions.node.split(".").map(Number);
add(maj > 22 || (maj === 22 && min >= 13) ? "ok" : "BLOCK", "node", `Node ${process.versions.node} (need ≥22.13)`);

const npmV = has(process.platform === "win32" ? "npm.cmd" : "npm", ["-v"]);
add(npmV ? "ok" : "BLOCK", "npm", npmV ?? "not found");

const ff = has("ffmpeg", ["-version"]);
add(ff ? "ok" : "BLOCK", "ffmpeg", ff ? ff.slice(0, 60) : "not found — VO analysis, contact sheets, delivery all need it");

const fp = has("ffprobe", ["-version"]);
add(fp ? "ok" : "BLOCK", "ffprobe", fp ? "ok" : "not found — metadata check needs it");

// ── 2. GPU check ──
let gpuName = null;
try {
  const r = spawnSync("nvidia-smi", ["--query-gpu=name,memory.total,memory.free", "--format=csv,noheader,nounits"], { encoding: "utf8", timeout: 5000 });
  if (r.status === 0) {
    const [name, total, free] = r.stdout.trim().split(", ");
    gpuName = name;
    const freeGb = Number(free) / 1024;
    add(freeGb >= 2 ? "ok" : "WARN", "gpu", `${name} — ${free} MB free / ${total} MB total`);
    if (freeGb < 2) add("WARN", "gpu-vram", "< 2 GB VRAM free — renders may OOM or be slow");
  } else {
    add("WARN", "gpu", "nvidia-smi not found — CPU-only rendering (slow)");
  }
} catch {
  add("WARN", "gpu", "GPU check failed");
}

// ── 3. Disk space ──
let freeGb = null;
try {
  const st = fs.statfsSync(process.cwd());
  freeGb = (st.bavail * st.bsize) / 1e9;
} catch {}
if (freeGb !== null) {
  add(freeGb >= 10 ? "ok" : freeGb >= 5 ? "WARN" : "BLOCK", "disk",
    `${freeGb.toFixed(1)} GB free${freeGb < 10 ? " — render finals need ~3-5 GB each" : ""}`);
} else {
  add("WARN", "disk", "could not check free space");
}

// Also check episode target drive if different
if (episodeDir) {
  try {
    const epSt = fs.statfsSync(path.dirname(episodeDir));
    const epFree = (epSt.bavail * epSt.bsize) / 1e9;
    if (epFree < 5) add("WARN", "disk-ep", `Episode drive: only ${epFree.toFixed(1)} GB free`);
  } catch {}
}

// ── 4. RAM ──
const totalRam = os.totalmem() / 1e9;
const freeRam = os.freemem() / 1e9;
add(freeRam >= 4 ? "ok" : "WARN", "ram", `${freeRam.toFixed(1)} GB free / ${totalRam.toFixed(0)} GB total`);

// ── 5. Cartesia TTS API ──
const cartesiaKey = process.env.CARTESIA_API_KEY;
if (!cartesiaKey) {
  add("BLOCK", "tts", "CARTESIA_API_KEY not set — VO generation will fail (stage 6)");
} else {
  try {
    const r = spawnSync("node", ["-e", `
      fetch("https://api.cartesia.ai/voices", {
        headers: { "X-API-Key": process.env.CARTESIA_API_KEY, "Cartesia-Version": "2024-06-10" }
      }).then(r => { process.exit(r.ok ? 0 : 1); }).catch(() => process.exit(2));
    `], { encoding: "utf8", timeout: 10000, env: { ...process.env } });
    add(r.status === 0 ? "ok" : "WARN", "tts",
      r.status === 0 ? "Cartesia API reachable" : "Cartesia API unreachable — VO will fail at stage 6");
  } catch {
    add("WARN", "tts", "Could not test Cartesia API connectivity");
  }
}

// ── 6. Project packages ──
// npm workspaces hoist packages to the repo root, so resolve them instead of looking in ./node_modules.
const req = createRequire(path.resolve("package.json"));
const resolvable = (m) => { try { req.resolve(m); return true; } catch { return false; } };
const deps = resolvable("remotion") && resolvable("three");
add(deps ? "ok" : "BLOCK", "packages", deps ? "ok" : "run: npm ci");

let browser = false;
try {
  browser = fs.readdirSync("node_modules/.remotion").some((d) => d.includes("chrome"));
} catch {}
add(browser ? "ok" : "WARN", "browser", browser ? "Remotion browser ready" : "Will download on first render (~200 MB)");

// ── 7. Motion memory health ──
const hubDir = process.env.AUDIRA_HUB || "F:/AUDIRA-ALL-SKILL";
const memDir = path.join(hubDir, "motion-memory/styles");
if (fs.existsSync(memDir)) {
  let corrupt = 0, total = 0;
  for (const f of fs.readdirSync(memDir).filter(f => f.endsWith(".json"))) {
    total++;
    try {
      JSON.parse(fs.readFileSync(path.join(memDir, f), "utf8"));
    } catch {
      corrupt++;
      if (fix) {
        const bak = path.join(memDir, f + ".corrupt." + Date.now());
        fs.renameSync(path.join(memDir, f), bak);
        add("WARN", "memory", `${f} corrupt → backed up to ${path.basename(bak)}`);
      }
    }
  }
  add(corrupt === 0 ? "ok" : "WARN", "memory",
    corrupt === 0 ? `${total} style files OK` : `${corrupt}/${total} style files corrupt${fix ? " (backed up)" : " — run with --fix"}`);
} else {
  add("WARN", "memory", `motion-memory/styles not found at ${memDir}`);
}

// ── 8. Episode duplicate check ──
if (episodeDir) {
  if (fs.existsSync(episodeDir)) {
    const statusFile = path.join(episodeDir, "STATUS.json");
    if (fs.existsSync(statusFile)) {
      try {
        const st = JSON.parse(fs.readFileSync(statusFile, "utf8"));
        const finalStage = st.stages?.final;
        if (finalStage?.status === "done") {
          add("WARN", "episode", `Episode already has completed final — are you sure this isn't a duplicate?`);
        } else {
          add("ok", "episode", `Existing episode, stage: ${st.stages ? Object.entries(st.stages).filter(([,v]) => v.status === "done").map(([k]) => k).join(", ") || "none done" : "fresh"}`);
        }
      } catch {
        add("WARN", "episode", "STATUS.json exists but cannot be parsed");
      }
    } else {
      add("ok", "episode", "Episode folder exists, no STATUS.json yet");
    }
  } else {
    add("ok", "episode", "New episode — folder will be created");
  }
}

// ── 9. Live renders (same rule as mcp-server/src/render-batch.js runnerActive: a job log that has not
// grown for 15 min means the runner is dead, and the 3D gate already ignores it) ──
const batchDir = path.join(os.homedir(), ".audira", "render-batch");
const STALE_LOG_MS = 15 * 60 * 1000;
let live = 0, dead = 0, waiting = 0;
if (fs.existsSync(batchDir)) {
  for (const id of fs.readdirSync(batchDir).sort().slice(-30)) {
    let b;
    try { b = JSON.parse(fs.readFileSync(path.join(batchDir, id, "batch.json"), "utf8")); } catch { continue; }
    if (b.state !== "running") continue;
    let newest = 0;
    for (const j of b.jobs || []) { try { newest = Math.max(newest, fs.statSync(j.log).mtimeMs); } catch {} }
    const fresh = Date.now() - Date.parse(b.startedAt || 0) < 60000;
    if (newest ? Date.now() - newest <= STALE_LOG_MS : fresh) live++; else dead++;
  }
  try { waiting = JSON.parse(fs.readFileSync(path.join(batchDir, "queue.json"), "utf8")).length || 0; } catch {}
}
if (live) add("WARN", "render", `${live} render batch(es) running: a new 3D final waits its turn (audira_render_batch action "queue")`);
else add("ok", "render", "No live render: GPU free");
if (dead) add("WARN", "render", `${dead} batch(es) still marked running with a stalled log (runner died); clear with audira_render_batch action "cancel"`);
if (waiting) add("WARN", "render", `${waiting} render request(s) waiting in queue.json`);

// ── 10. MCP server check ──
const mcpConfig = path.join(hubDir, "mcp-server/src/style-memory.js");
add(fs.existsSync(mcpConfig) ? "ok" : "WARN", "mcp", fs.existsSync(mcpConfig) ? "MCP style-memory module found" : "MCP style-memory module not found — audira_style_memory will fail");

// ── 11. Engine selection (MediaBunny probe) ──
const inputFiles = [];
if (episodeDir) {
  // Scan episode folder for input media (VO, reference video/audio)
  const mediaDirs = ["", "vo", "reference", "audio", "input"].map(d => path.join(episodeDir, d));
  const mediaExts = new Set([".mp4", ".mov", ".webm", ".mkv", ".wav", ".mp3", ".flac", ".ogg", ".m4a", ".aac"]);
  for (const dir of mediaDirs) {
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) {
      if (mediaExts.has(path.extname(f).toLowerCase())) inputFiles.push(path.join(dir, f));
    }
  }
}
// Also accept --input=file args
for (const a of args) {
  if (a.startsWith("--input=")) inputFiles.push(a.slice(8));
}

let styleHint = null;
if (episodeDir) {
  const sdPath = path.join(episodeDir, "style", "STYLE_DECISION.md");
  if (fs.existsSync(sdPath)) {
    const sdText = fs.readFileSync(sdPath, "utf8");
    const m = sdText.match(/style[:\s]+([A-Z][A-Z0-9]+)/i);
    if (m) styleHint = m[1].toUpperCase();
  }
}

let engineResult = null;
try {
  engineResult = await selectEngine({
    inputs: inputFiles,
    style: styleHint,
    gpu: gpuName != null,
  });

  // Report validation results (invalid files are blockers)
  for (const v of engineResult.validation) {
    if (v.valid) {
      add("ok", "input-valid", `${v.file}: OK`);
    } else {
      add("BLOCK", "input-valid", `${v.file}: ${v.error}`);
    }
  }

  add("ok", "engine", `${engineResult.engine} (${engineResult.reason}): ${engineResult.summary}`);
  if (engineResult.glMode) add("ok", "engine-gl", `.gl-mode = ${engineResult.glMode}`);
  if (engineResult.styleAffinity) add("ok", "engine-aff", `Style affinity: ${styleHint} → ${engineResult.styleAffinity}`);

  if (engineResult.probes.length) {
    for (const p of engineResult.probes) {
      const v = p.video ? `${p.video.codec_name ?? "?"} ${p.video.width}x${p.video.height}` : "audio";
      add("ok", "engine-probe", `${p.file}: ${v}, ${Math.round(p.duration)}s`);
    }
  }
  for (const w of engineResult.warnings) add("WARN", "engine", w);

  // Persist decision to episode folder
  if (episodeDir) {
    const saved = persistDecision(engineResult, episodeDir);
    if (saved) add("ok", "engine-save", `Decision persisted to ${path.basename(saved)}`);
  }
} catch (err) {
  add("WARN", "engine", `Engine selection failed: ${err.message}`);
}

// ── Report ──
console.log("\n  AUDIRA Pipeline Pre-flight Check\n  " + "=".repeat(36) + "\n");
const icons = { ok: "✓", WARN: "!", BLOCK: "✗" };
for (const r of rows) console.log(`  ${icons[r.level] ?? "?"} ${r.level.padEnd(5)} ${r.area.padEnd(12)} ${r.msg}`);

const blocks = rows.filter((r) => r.level === "BLOCK");
const warns = rows.filter((r) => r.level === "WARN");
console.log(`\n  ${blocks.length ? `${blocks.length} BLOCKER(s)` : "No blockers"}${warns.length ? `, ${warns.length} warning(s)` : ""}.`);
if (blocks.length) {
  console.log("  Fix blockers before starting the pipeline.\n");
  process.exit(1);
}
if (warns.length) {
  console.log("  Warnings won't stop the pipeline but may cause issues later.\n");
  process.exit(2);
}
console.log("  All clear — ready to produce.\n");
process.exit(0);
