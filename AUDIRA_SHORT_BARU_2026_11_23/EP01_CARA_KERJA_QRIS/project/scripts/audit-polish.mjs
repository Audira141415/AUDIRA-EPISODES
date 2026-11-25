// Static analysis of scene code for polish quality.
// Checks for common anti-patterns that lead to low material/texture scores.
//   npm run audit:polish                  check current project scenes
//   npm run audit:polish -- ../kits       check all kit examples
//   npm run audit:polish -- src/kits/innerworks  check one kit

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2).filter(a => !a.startsWith("--"));
const scanDirs = args.length ? args.map(a => path.resolve(a)) : [path.resolve("src")];
const verbose = process.argv.includes("--verbose");

const RULES = [
  {
    id: "no-finish",
    severity: "error",
    message: "Scene has no <Finish> component — lighting/AO/tone-mapping missing",
    test: (code, file) => {
      if (!/Preview|Final/.test(path.basename(file))) return false;
      return !/<Finish\b/.test(code) && /<Canvas|<ThreeCanvas/.test(code);
    },
  },
  {
    id: "bare-standard-material",
    severity: "warn",
    message: "meshStandardMaterial without POLISH spread — flat look",
    test: (code) => /meshStandardMaterial/.test(code) && !/POLISH\./.test(code),
  },
  {
    id: "bare-box-geometry",
    severity: "warn",
    message: "boxGeometry on visible object — use RoundedBoxGeo for bevelled edges",
    test: (code) => /<boxGeometry\b/.test(code) && !/RoundedBoxGeo/.test(code),
  },
  {
    id: "no-hdri-metal",
    severity: "warn",
    message: "Metallic/glass material without HDRI env — reflections will be black",
    test: (code) => /metalness:\s*(0\.[5-9]|1(\.\d+)?|[1-9])/.test(code) && !/hdri|HDRI|envMap|environment/.test(code),
  },
  {
    id: "no-surface-grain",
    severity: "info",
    message: "No surfaceGrain/useSurfaceGrain — surfaces may look CG-smooth",
    test: (code) => !/surfaceGrain|useSurfaceGrain/.test(code) && /meshPhysicalMaterial/.test(code),
  },
  {
    id: "no-rounded-person",
    severity: "warn",
    message: "Capsule/cylinder person geometry — use <ToyPerson> or custom mesh",
    test: (code) => /capsuleGeometry|cylinderGeometry/.test(code) && /<mesh\b/.test(code) && /person|human|character|figure/i.test(code),
  },
  {
    id: "no-ao",
    severity: "info",
    message: "Finish has ao={false} — ground-truth AO disabled (OK for additive/line styles)",
    test: (code) => /<Finish\b[^>]*ao=\{false\}/.test(code),
  },
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap(e => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "node_modules" || e.name === "out" ? [] : walk(p);
    return /\.(tsx|jsx)$/.test(e.name) ? [p] : [];
  });
}

let totalFindings = 0, totalFiles = 0, errorCount = 0;
const summary = {};

for (const dir of scanDirs) {
  const files = walk(dir);
  for (const file of files) {
    const code = fs.readFileSync(file, "utf8");
    const findings = RULES.filter(r => r.test(code, file));
    if (!findings.length) continue;
    totalFiles++;
    const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");
    for (const f of findings) {
      totalFindings++;
      if (f.severity === "error") errorCount++;
      summary[f.id] = (summary[f.id] || 0) + 1;
      const sev = f.severity === "error" ? "ERROR" : f.severity === "warn" ? "WARN " : "INFO ";
      console.log(`  ${sev}  ${rel}  ${f.message}`);
    }
  }
}

console.log(`\n  audit:polish  ${totalFiles} file(s) with findings, ${totalFindings} total (${errorCount} errors)`);
if (Object.keys(summary).length) {
  console.log("  Breakdown:");
  for (const [id, c] of Object.entries(summary).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${id}: ${c}`);
  }
}

process.exitCode = errorCount > 0 ? 1 : 0;
