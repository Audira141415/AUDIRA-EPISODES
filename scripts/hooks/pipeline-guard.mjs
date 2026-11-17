#!/usr/bin/env node
// Pipeline guard (PreToolUse hook for Write/Edit).
// Blocks writing to scene/composition files when pipeline docs are incomplete.
//
// Checks before allowing writes to scene-related paths:
//   1. STATUS.json exists in the episode folder
//   2. ART_DIRECTION.md is not a blank template
//   3. STORYBOARD.md has actual scene data (not just headers)
//   4. Style is chosen (not "TBD")
//   5. Engine matches topic rules (world3d default; Remotion only for football/Islam)
//
// settings.json: "hooks": { "PreToolUse": [{ "hooks": [{ "type": "command",
//   "command": "node F:/AUDIRA-ALL-SKILL/scripts/hooks/pipeline-guard.mjs" }],
//   "matcher": { "tool_name": "Write|Edit" } }] }
//
// Never crashes: on any error exits with {"decision":"approve"}.

import fs from "node:fs";
import path from "node:path";

const SCENE_PATTERNS = [
  /[/\\]scenes[/\\]/i,
  /[/\\]compositions[/\\].*\.(html|mjs|js|tsx)$/i,
  /[/\\]world3d\.(js|mjs)$/i,
  /[/\\]SubmergedWorld/i,
  /[/\\]EP\d+Film/i,
  /[/\\]build-video\.(mjs|js)$/i,
  /[/\\]shell\.mjs$/i,
];

const EXEMPT_PATTERNS = [
  /[/\\]node_modules[/\\]/,
  /[/\\]scripts[/\\]/,
  /[/\\]_tools[/\\]/,
  /[/\\]shared[/\\]/,
  /[/\\]kits[/\\]/,
  /[/\\]core[/\\]/,
  /[/\\]brand[/\\]/,
];

function isSceneFile(filePath) {
  if (EXEMPT_PATTERNS.some(p => p.test(filePath))) return false;
  return SCENE_PATTERNS.some(p => p.test(filePath));
}

function findEpisodeRoot(filePath) {
  let dir = path.dirname(filePath);
  for (let i = 0; i < 10; i++) {
    if (/EP\d+_/i.test(path.basename(dir))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function findSeriesRoot(epRoot) {
  const parent = path.dirname(epRoot);
  if (fs.existsSync(path.join(parent, "SERIES.json"))) return parent;
  return null;
}

function isBlankTemplate(content) {
  const stripped = content
    .replace(/^#.*$/gm, "")
    .replace(/^\|.*\|$/gm, "")
    .replace(/^-+$/gm, "")
    .replace(/Belum diisi\.?/gi, "")
    .replace(/TBD/gi, "")
    .trim();
  return stripped.length < 30;
}

function checkDocs(epRoot) {
  const errors = [];

  // 1. STATUS.json
  if (!fs.existsSync(path.join(epRoot, "STATUS.json"))) {
    errors.push("STATUS.json tidak ada — jalankan audira_episode_status init dulu");
  }

  // 2. ART_DIRECTION.md
  const artDir = path.join(epRoot, "docs", "ART_DIRECTION.md");
  if (!fs.existsSync(artDir)) {
    errors.push("docs/ART_DIRECTION.md tidak ada");
  } else {
    const content = fs.readFileSync(artDir, "utf8");
    if (isBlankTemplate(content)) {
      errors.push("docs/ART_DIRECTION.md masih template kosong — isi konsep spasial, palet, kamera dulu");
    }
    // Check style
    const styleMatch = content.match(/Style:\s*(.+)/i);
    if (styleMatch && /TBD|belum/i.test(styleMatch[1])) {
      errors.push("Style belum dipilih (masih TBD) — jalankan audira_recommend_style dan pilih style dulu");
    }
  }

  // 3. STORYBOARD.md
  const storyboard = path.join(epRoot, "docs", "STORYBOARD.md");
  if (!fs.existsSync(storyboard)) {
    errors.push("docs/STORYBOARD.md tidak ada");
  } else {
    const content = fs.readFileSync(storyboard, "utf8");
    // A valid storyboard has scene rows in the table (at least 3 pipe-separated columns with scene data)
    const rows = content.split("\n").filter(l => /^\|.*s\d+/i.test(l) || /^\|.*Scene/i.test(l));
    if (rows.length < 2) {
      errors.push("docs/STORYBOARD.md kosong atau hanya header — tulis scene breakdown dulu");
    }
  }

  return errors;
}

function checkEngine(epRoot) {
  const seriesRoot = findSeriesRoot(epRoot);
  if (!seriesRoot) return [];

  const errors = [];
  const seriesName = path.basename(seriesRoot).toUpperCase();
  const epName = path.basename(epRoot).toUpperCase();

  // Detect topic from series/episode name
  const isFootball = /SEPAK.?BOLA|FOOTBALL|SOCCER/i.test(seriesName + " " + epName);
  const isIslamicHistory = /SEJARAH.?ISLAM|PERADABAN.?ISLAM|KISAH.?ISLAM|TOKOH.?MUSLIM/i.test(seriesName + " " + epName);
  const isQissah = /QISSAH/i.test(seriesName);

  // Check SERIES.json for channel
  let channel = "";
  try {
    const sj = JSON.parse(fs.readFileSync(path.join(seriesRoot, "SERIES.json"), "utf8"));
    channel = (sj.account?.handle || "").toUpperCase();
  } catch { /* ok */ }

  const isQissahChannel = channel.includes("QISSAH");
  const needsRemotion = isFootball || isIslamicHistory || isQissah || isQissahChannel;

  // Check what engine the project actually uses
  const hasRemotion = fs.existsSync(path.join(epRoot, "project", "package.json"));
  const hasWorld3d = fs.existsSync(path.join(epRoot, "project", "hf", "hyperframes.json"));

  if (needsRemotion && !hasRemotion) {
    const rule = isFootball ? "rule 13" : "rule 14";
    errors.push(`Topik ini wajib Remotion + R3F (${rule}), tapi project ini bukan Remotion`);
  }

  if (!needsRemotion && hasRemotion && !hasWorld3d) {
    // Has Remotion but topic doesn't require it — warn (not block, user may have overridden)
    errors.push(
      "PERINGATAN: topik ini default engine world3d (rule 4), tapi project ini pakai Remotion. " +
      "Lanjutkan hanya kalau pengguna secara eksplisit meminta Remotion."
    );
  }

  return errors;
}

function approve() {
  process.stdout.write(JSON.stringify({ decision: "approve" }));
  process.exit(0);
}

function block(reasons) {
  const msg =
    "⛔ PIPELINE GUARD: Tidak boleh menulis kode adegan sebelum pipeline docs lengkap.\n\n" +
    reasons.map((r, i) => `${i + 1}. ${r}`).join("\n") +
    "\n\nSelesaikan docs dulu, baru tulis kode adegan. " +
    "Urutan: style gate → script gate → ART_DIRECTION → STORYBOARD → baru kode.";
  process.stdout.write(JSON.stringify({ decision: "block", reason: msg }));
  process.exit(0);
}

try {
  const input = JSON.parse(fs.readFileSync(0, "utf8") || "{}");
  const tool = input.tool_name;
  const toolInput = input.tool_input || {};

  // Get file path from Write or Edit
  const filePath = toolInput.file_path || "";
  if (!filePath) approve();

  // Only check scene files
  if (!isSceneFile(filePath)) approve();

  // Find episode root
  const epRoot = findEpisodeRoot(filePath);
  if (!epRoot) approve(); // not in an episode folder, let it through

  // Run checks
  const docErrors = checkDocs(epRoot);
  const engineErrors = checkEngine(epRoot);
  const allErrors = [...docErrors, ...engineErrors];

  if (allErrors.length === 0) approve();

  // If only warnings (engine mismatch with possible override), approve with note
  const blocks = allErrors.filter(e => !e.startsWith("PERINGATAN:"));
  if (blocks.length === 0) approve();

  block(allErrors);
} catch {
  approve(); // never break the session
}
