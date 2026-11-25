// Keep kits/<kit>/src/kits/<kit> (what a new project copies) equal to starter/src/kits/<kit>.
// The starter copy is the source of truth: it is the one that is rendered, type-checked and polished.
// Run inside the skill repo (starter/ next to kits/).
//   npm run kits:check                       report, exit 1 if any kit differs
//   npm run kits:check -- --sync             copy starter -> kits for every differing file
//   npm run kits:check -- innerworks,filmnoir   only these kits
// Files that exist only in kits/ are reported and never deleted or overwritten: move them into the
// starter by hand if they are needed. kits/ is tracked in git, so a sync can be reviewed with git diff.
// (File times are not used: a git checkout resets them, so they cannot tell which side is newer.)

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const sync = args.includes("--sync");
const only = args.find((a) => !a.startsWith("--"))?.split(",").map((s) => s.toLowerCase());
const STARTER = path.resolve("src/kits"), KITS = path.resolve("../kits");
if (!fs.existsSync(KITS) || !fs.existsSync(STARTER)) {
  console.log("kits:check runs in the skill repo only (starter/ next to kits/); nothing to check here.");
  process.exit(0);
}

const walk = (d, base = d) => fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(d, e.name);
  return e.isDirectory() ? walk(p, base) : [path.relative(base, p).replace(/\\/g, "/")];
}) : [];
const norm = (f) => fs.readFileSync(f, "utf8").replace(/\r/g, "").replace(/[ \t]+$/gm, "").replace(/\n+$/, "");
const copy = (from, to) => { fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to); };

let bad = 0, copied = 0, kitOnly = 0;
const kits = fs.readdirSync(KITS).filter((k) => fs.statSync(path.join(KITS, k)).isDirectory() && (!only || only.includes(k))).sort();
for (const k of kits) {
  const a = path.join(STARTER, k), b = path.join(KITS, k, "src", "kits", k);
  if (!fs.existsSync(a)) { console.log(`${k}: not in starter/src/kits (copy the kit into the starter first)`); bad++; continue; }
  const fa = new Set(walk(a)), fb = new Set(walk(b));
  const rows = [];
  for (const f of fa) {
    const pa = path.join(a, f), pb = path.join(b, f);
    if (!fb.has(f)) rows.push({ f, kind: "missing-in-kit" });
    else if (!fs.readFileSync(pa).equals(fs.readFileSync(pb))) rows.push({ f, kind: norm(pa) === norm(pb) ? "whitespace" : "code" });
  }
  for (const f of fb) if (!fa.has(f)) rows.push({ f, kind: "only-in-kit" });
  if (!rows.length) continue;
  bad++;
  const n = (kind) => rows.filter((r) => r.kind === kind).length;
  console.log(`${k}: ${n("code")} code, ${n("whitespace")} whitespace, ${n("missing-in-kit")} missing in kit, ${n("only-in-kit")} only in kit`);
  for (const r of rows) {
    if (r.kind === "only-in-kit") { kitOnly++; console.log(`  only-in-kit    ${r.f}  (left as is)`); continue; }
    if (r.kind === "code" || r.kind === "missing-in-kit") console.log(`  ${r.kind.padEnd(14)} ${r.f}`);
    if (sync) { copy(path.join(a, r.f), path.join(b, r.f)); copied++; }
  }
}
console.log(bad ? `\n${bad} kit(s) differ from the starter${sync ? `: ${copied} file(s) copied starter -> kits${kitOnly ? `, ${kitOnly} kit-only file(s) left` : ""}` : ". Run with --sync to copy the starter versions into kits/."}` : `all ${kits.length} kits equal to the starter`);
process.exitCode = bad && (!sync || kitOnly) ? 1 : 0;
