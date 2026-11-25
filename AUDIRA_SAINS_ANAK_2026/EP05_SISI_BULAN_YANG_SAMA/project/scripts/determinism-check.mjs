// Determinism check: Remotion renders frames out of order in several browser tabs, so anything that
// reads a clock or an unseeded random number draws a different picture per tab (flicker, popping
// textures, steam or dust that jumps between segments). Scan the source for those calls.
//   node scripts/determinism-check.mjs                       src/ (and ../kits in the skill repo)
//   node scripts/determinism-check.mjs <dir...>              only these folders
//   node scripts/determinism-check.mjs --from=src/index.ts   only files the film imports (render:final gate)
// Flags: Math.random(), Date.now(), new Date(), performance.now(), the R3F clock (clock.getElapsedTime,
// clock.elapsedTime, state.clock) and useFrame callbacks that read their delta argument.
// advance(performance.now()) is allowed: it only redraws a frame after a texture or font arrived.
// Any other line can be allowed with a trailing "// det-ok: <reason>" comment. Exit 1 when anything is found.

import fs from "node:fs";
import path from "node:path";

const RULES = [
  { re: /\bMath\.random\s*\(/, why: "unseeded random: use mulberry32(seed) from core/film/craft.ts" },
  { re: /\bDate\.now\s*\(|\bnew Date\s*\(/, why: "wall clock: derive time from useCurrentFrame() / fps" },
  { re: /\bperformance\.now\s*\(/, why: "wall clock: derive time from useCurrentFrame() / fps", allow: /\badvance\s*\(\s*performance\.now\s*\(\s*\)\s*\)/ },
  { re: /\bclock\s*\.\s*(getElapsedTime|elapsedTime|getDelta)\b|\bstate\.clock\b/, why: "R3F clock: drive motion from the film frame, not the render clock" },
  { re: /useFrame\s*\(\s*\(\s*[^,)]*,\s*delta\b/, why: "useFrame delta: per-frame deltas differ per tab; use the frame time" },
];
const EXT = /\.(tsx?|jsx?|mjs)$/;
const SKIP = new Set(["node_modules", "out", "build", ".git", "dist"]);

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const from = (process.argv.find((a) => a.startsWith("--from=")) ?? "").slice(7);
const roots = args.length ? args : ["src", ...(fs.existsSync("../kits") && fs.existsSync("../SKILL.md") ? ["../kits"] : [])];

const walk = (d) =>
  fs.existsSync(d)
    ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
        if (SKIP.has(e.name)) return [];
        const p = path.join(d, e.name);
        return e.isDirectory() ? walk(p) : EXT.test(e.name) ? [p] : [];
      })
    : [];

/** Files reachable from an entry through relative imports (unused copies of old modules are skipped). */
function reachable(entry) {
  const seen = new Set();
  const stack = [path.resolve(entry)];
  const IMPORT = /(?:import|export)[^'"`;]*?from\s*["'](\.{1,2}\/[^"']+)["']|import\s*\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)/g;
  const resolve = (base, spec) => {
    const p = path.resolve(path.dirname(base), spec);
    const cands = [p, ...[".ts", ".tsx", ".js", ".mjs", ".jsx"].map((e) => p + e), ...["index.ts", "index.tsx", "index.js"].map((i) => path.join(p, i))];
    return cands.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) ?? null;
  };
  while (stack.length) {
    const f = stack.pop();
    if (seen.has(f)) continue;
    seen.add(f);
    for (const m of fs.readFileSync(f, "utf8").matchAll(IMPORT)) {
      const r = resolve(f, m[1] ?? m[2]);
      if (r && !seen.has(r)) stack.push(r);
    }
  }
  return [...seen];
}

const files = from ? (fs.existsSync(from) ? reachable(from) : []) : roots.flatMap(walk);
const hits = [];
for (const f of files) {
  const lines = fs.readFileSync(f, "utf8").split(/\r?\n/);
  let inBlock = false;
  lines.forEach((raw, i) => {
    let line = raw;
    // ignore comments: block comments and // comments
    if (inBlock) {
      const end = line.indexOf("*/");
      if (end < 0) return;
      line = line.slice(end + 2);
      inBlock = false;
    }
    line = line.replace(/\/\*.*?\*\//g, "");
    const start = line.indexOf("/*");
    if (start >= 0) {
      inBlock = true;
      line = line.slice(0, start);
    }
    if (/\/\/\s*det-ok\b/.test(line)) return;
    const code = line.replace(/\/\/.*$/, "");
    if (!code.trim()) return;
    for (const r of RULES)
      if (r.re.test(code) && !(r.allow && r.allow.test(code)))
        hits.push({ f: path.relative(process.cwd(), f).replace(/\\/g, "/"), n: i + 1, why: r.why, src: code.trim().slice(0, 100) });
  });
}

if (!hits.length) {
  console.log(`determinism: ok (${from ? `${files.length} files imported by ${from}` : roots.join(", ")})`);
  process.exit(0);
}
for (const h of hits) console.log(`${h.f}:${h.n}  ${h.why}\n    ${h.src}`);
console.log(`\ndeterminism: ${hits.length} call(s) that differ per render tab. Fix them, or mark a deliberate one with // det-ok: <reason>.`);
process.exit(1);
