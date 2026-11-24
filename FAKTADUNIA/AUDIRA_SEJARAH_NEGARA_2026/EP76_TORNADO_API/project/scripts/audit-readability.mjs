// Static analysis of scene code for readability risks at mobile resolution (540×960 / 1080×1920).
// Catches patterns that lead to low readability scores: small text, text on busy backgrounds,
// too many labels per frame, labels outside safe zones.
//   npm run audit:readability              check current project scenes
//   npm run audit:readability -- ../kits   check all kit examples

import fs from "node:fs";
import path from "node:path";

// WCAG 2.1 contrast ratio helpers
function parseHex(hex) {
  if (!hex) return null;
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length < 6) return null;
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  return [r, g, b];
}
function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function luminance([r, g, b]) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}
function contrastRatio(fg, bg) {
  const l1 = luminance(fg) + 0.05;
  const l2 = luminance(bg) + 0.05;
  return l1 > l2 ? l1 / l2 : l2 / l1;
}

const args = process.argv.slice(2).filter(a => !a.startsWith("--"));
const scanDirs = args.length ? args.map(a => path.resolve(a)) : [path.resolve("src")];

const RULES = [
  {
    id: "small-font-3d",
    severity: "warn",
    message: "3D text with fontSize < 0.25 — likely unreadable at mobile resolution",
    test: (code) => {
      const m = code.match(/fontSize[=:]\s*\{?\s*(0\.0\d+|0\.1\d*|0\.2[0-4])/g);
      return m && m.length > 0 && /<Text\b|<Text3D\b/.test(code);
    },
  },
  {
    id: "small-font-hud",
    severity: "warn",
    message: "HUD/HTML text with fontSize < 32px — minimum 32px at 1080px render width",
    test: (code) => {
      const m = code.match(/fontSize[=:]\s*['"]?\d+/g);
      if (!m) return false;
      return m.some(s => {
        const n = parseInt(s.match(/\d+/)[0], 10);
        return n > 0 && n < 32;
      }) && /AbsoluteFill|<div|<span|style=/.test(code);
    },
  },
  {
    id: "low-contrast",
    severity: "warn",
    message: "Text color may have contrast < 4.5:1 against its background (WCAG AA)",
    test: (code) => {
      const textColors = code.match(/color[=:]\s*["']#([0-9a-fA-F]{3,8})["']/g);
      const bgColors = code.match(/background(?:Color)?[=:]\s*["']#([0-9a-fA-F]{3,8})["']/g);
      if (!textColors || !bgColors) return false;
      for (const tc of textColors) {
        const fg = parseHex(tc.match(/#([0-9a-fA-F]{3,8})/)?.[1]);
        if (!fg) continue;
        for (const bc of bgColors) {
          const bg = parseHex(bc.match(/#([0-9a-fA-F]{3,8})/)?.[1]);
          if (!bg) continue;
          const ratio = contrastRatio(fg, bg);
          if (ratio < 4.5) return true;
        }
      }
      return false;
    },
  },
  {
    id: "many-labels",
    severity: "warn",
    message: "6+ text/label elements in one component — risk of cluttered frame",
    test: (code) => {
      const textCount = (code.match(/<Text\b|<Text3D\b|<SafeLabel\b|<HudLabel\b/g) || []).length;
      return textCount >= 6;
    },
  },
  {
    id: "text-outside-safe",
    severity: "info",
    message: "Text positioned in bottom 380px danger zone (covered by mobile UI)",
    test: (code) => {
      // Check for bottom positioning near danger zone
      const bottomMatch = code.match(/bottom:\s*(\d+)/g);
      if (!bottomMatch) return false;
      return bottomMatch.some(m => {
        const val = parseInt(m.match(/\d+/)[0], 10);
        return val < 380 && val > 0;
      });
    },
  },
  {
    id: "no-safe-label",
    severity: "info",
    message: "Using raw <Text> instead of <SafeLabel> — no automatic safe-zone enforcement",
    test: (code) => /<Text\b/.test(code) && !/<SafeLabel/.test(code) && /import.*SafeLabel/.test(code) === false,
  },
  {
    id: "text-on-transparent",
    severity: "info",
    message: "Text with no background panel — may be unreadable over busy 3D scene",
    test: (code) => {
      const hasText = /<Text\b|<Text3D\b/.test(code);
      const hasPanel = /backdrop|background|panel|plate|card/i.test(code) && /mesh|plane|Rect/i.test(code);
      return hasText && !hasPanel;
    },
  },
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "node_modules" || e.name === "out" ? [] : walk(p);
    return /\.(tsx|jsx)$/.test(e.name) ? [p] : [];
  });
}

let totalFindings = 0, totalFiles = 0, warnCount = 0;
const summary = {};

for (const dir of scanDirs) {
  for (const file of walk(dir)) {
    const code = fs.readFileSync(file, "utf8");
    const findings = RULES.filter(r => r.test(code));
    if (!findings.length) continue;
    totalFiles++;
    const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");
    for (const f of findings) {
      totalFindings++;
      if (f.severity === "warn") warnCount++;
      summary[f.id] = (summary[f.id] || 0) + 1;
      const sev = f.severity === "warn" ? "WARN " : "INFO ";
      console.log(`  ${sev}  ${rel}  ${f.message}`);
    }
  }
}

console.log(`\n  audit:readability  ${totalFiles} file(s) with findings, ${totalFindings} total (${warnCount} warnings)`);
if (Object.keys(summary).length) {
  console.log("  Breakdown:");
  for (const [id, c] of Object.entries(summary).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${id}: ${c}`);
  }
}
