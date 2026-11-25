// Bulk-enhance KIT.md files: append Finish Defaults and Depth Recipe sections where missing.
// Reads kit palette, materials, memory scores, and gold data to generate recommendations.
//   npm run kit:enhance                    dry-run (shows what would change)
//   npm run kit:enhance -- --write         write changes to KIT.md files
//   npm run kit:enhance -- --write innerworks  single kit

import fs from "node:fs";
import path from "node:path";

const MEMORY = "F:/AUDIRA-ALL-SKILL/motion-memory/styles";
const KITS = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/i, "$1")), "../../kits");

const args = process.argv.slice(2);
const write = args.includes("--write");
const only = args.filter(a => !a.startsWith("--")).map(s => s.toLowerCase());

// Flat styles use 2D parallax, not 3D depth
const FLAT_STYLES = new Set(["RISOFORGE", "UKIYOFORGE", "COMICFORGE", "PIXELSTORY", "INKSTORY", "CHALKCRAFT", "TOONFORGE",
  "WATERCOLOR", "SKETCHFORGE", "MANUSCRIPT", "HISTORYMAP", "ISLAMICDOCUMENTARY", "WAYANGFORGE", "TEXTVOYAGE", "RETROWAVE",
  "ARCADECRT", "GLITCHFORGE", "DRAFTFORGE", "TRADINGTERMINAL", "SATELLITEBRIEFING"]);

// Style temperature heuristics from palette analysis
const WARM_KEYWORDS = /warm|candle|fire|gold|amber|sepia|sunset|desert|clay|leather|wood|earth|terracotta|spice|parchment|vintage/i;
const COOL_KEYWORDS = /cyber|neon|ice|arctic|ocean|steel|chrome|tech|digital|hologram|void|space|electric|synthwave/i;
const DARK_KEYWORDS = /noir|dark|shadow|night|mystery|abyss|deep|gothic|horror|backroom/i;

function readMemory(style) {
  const f = path.join(MEMORY, `${style}.json`);
  if (!fs.existsSync(f)) return null;
  try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return null; }
}

function readKitMd(style) {
  const f = path.join(KITS, style.toLowerCase(), "KIT.md");
  if (!fs.existsSync(f)) return null;
  return fs.readFileSync(f, "utf8");
}

function hasSection(text, heading) {
  return new RegExp(`^## ${heading}`, "im").test(text);
}

function guessTemperature(style, kitMd) {
  const combined = `${style} ${kitMd || ""}`;
  if (DARK_KEYWORDS.test(combined)) return "dark";
  if (COOL_KEYWORDS.test(combined)) return "cool";
  if (WARM_KEYWORDS.test(combined)) return "warm";
  return "neutral";
}

function recommendFinish(style, mem, kitMd) {
  // 1. Gold episode best params win
  const goldDir = path.join(KITS, style.toLowerCase(), "gold");
  if (fs.existsSync(goldDir)) {
    const episodes = fs.readdirSync(goldDir).filter(e => {
      const g = path.join(goldDir, e, "GOLD.json");
      return fs.existsSync(g);
    });
    if (episodes.length) {
      const gold = JSON.parse(fs.readFileSync(path.join(goldDir, episodes[0], "GOLD.json"), "utf8"));
      if (gold.best) return { source: "gold", ...gold.best };
    }
  }

  // 2. Memory best params
  if (mem?.best?.finishProfile) {
    return { source: "memory", ...mem.best };
  }

  // 3. Derive from style temperature
  const temp = guessTemperature(style, kitMd);
  const palette = readPalette(style);
  const bg = palette?.background || "#0a0a0a";

  const profiles = {
    warm: { finishProfile: "DOCUMENTARY_WARM", exposure: 0.9, envIntensity: 0.35 },
    cool: { finishProfile: "APPLE_STUDIO_CLEAN", exposure: 0.85, envIntensity: 0.4 },
    dark: { finishProfile: "CINEMA_TEAL_ORANGE", exposure: 0.75, envIntensity: 0.3 },
    neutral: { finishProfile: "APPLE_STUDIO_CLEAN", exposure: 0.85, envIntensity: 0.35 },
  };

  const needsHdri = /metal|chrome|gold|glass|glossy|mirror|reflec/i.test(kitMd || "");
  return {
    source: "derived",
    ...profiles[temp],
    hdri: needsHdri ? "studio" : null,
    ao: true,
    background: bg,
  };
}

function readPalette(style) {
  const palFile = path.join(KITS, style.toLowerCase(), "src", "kits", style.toLowerCase(), "lib", "palette.ts");
  if (!fs.existsSync(palFile)) return null;
  const code = fs.readFileSync(palFile, "utf8");
  const bg = code.match(/background['":\s]*['"]?(#[0-9a-fA-F]{3,8})/i);
  return { background: bg ? bg[1] : null };
}

function generateFinishSection(style, mem, kitMd) {
  const finish = recommendFinish(style, mem, kitMd);
  const json = JSON.stringify({
    finishProfile: finish.finishProfile,
    exposure: finish.exposure,
    envIntensity: finish.envIntensity,
    hdri: finish.hdri || null,
    ao: finish.ao !== false,
    background: finish.background || "#0a0a0a",
  }, null, 2);

  return `\n## Finish Defaults\n\nSource: ${finish.source}. Update from motion memory or gold episodes when available.\n\n\`\`\`json\n${json}\n\`\`\`\n`;
}

function generateDepthSection(style) {
  if (FLAT_STYLES.has(style)) {
    return `\n## Depth Recipe\n\nFlat style — uses 2D parallax layers instead of 3D depth:\n- **Layer 1 (back):** background texture/gradient\n- **Layer 2 (mid):** hero subject(s)\n- **Layer 3 (front):** frame elements, particles, or decorative overlay\n- **Parallax rate:** 0.3–0.8× relative to camera\n`;
  }
  return `\n## Depth Recipe\n\n- **Foreground (FG):** [kit-specific prop or particle field]\n- **Midground (MG):** hero subject(s), ≥40% of frame width\n- **Background (BG):** [environment/skybox]\n- **Camera distance:** 4–8 units from MG centre\n- **Minimum subject size:** hero ≥40% frame width at 540×960\n`;
}

// Process kits
const kitDirs = fs.readdirSync(KITS)
  .filter(k => fs.statSync(path.join(KITS, k)).isDirectory())
  .filter(k => !only.length || only.includes(k))
  .sort();

let enhanced = 0, skipped = 0;

for (const kit of kitDirs) {
  const style = kit.toUpperCase();
  const kitMd = readKitMd(style);
  if (!kitMd) { skipped++; continue; }

  const mem = readMemory(style);
  let additions = "";
  const needs = [];

  if (!hasSection(kitMd, "Finish Defaults")) {
    additions += generateFinishSection(style, mem, kitMd);
    needs.push("Finish Defaults");
  }
  if (!hasSection(kitMd, "Depth Recipe")) {
    additions += generateDepthSection(style);
    needs.push("Depth Recipe");
  }

  if (!needs.length) { skipped++; continue; }

  enhanced++;
  const kitMdPath = path.join(KITS, kit, "KIT.md");

  if (write) {
    // Insert before ## Avoid or ## Kit Components, or append at end
    let newContent;
    const avoidMatch = kitMd.match(/^## (Avoid|Kit Components)/m);
    if (avoidMatch) {
      const idx = kitMd.indexOf(avoidMatch[0]);
      newContent = kitMd.slice(0, idx) + additions + "\n" + kitMd.slice(idx);
    } else {
      newContent = kitMd + "\n" + additions;
    }
    fs.writeFileSync(kitMdPath, newContent, "utf8");
    console.log(`  WRITE  ${kit}  added: ${needs.join(", ")}`);
  } else {
    console.log(`  WOULD  ${kit}  add: ${needs.join(", ")}  (source: ${recommendFinish(style, mem, kitMd).source})`);
  }
}

console.log(`\n  kit:enhance  ${enhanced} kit(s) ${write ? "enhanced" : "would be enhanced"}, ${skipped} already complete or no KIT.md`);
if (!write && enhanced > 0) console.log("  Run with --write to apply changes.");
