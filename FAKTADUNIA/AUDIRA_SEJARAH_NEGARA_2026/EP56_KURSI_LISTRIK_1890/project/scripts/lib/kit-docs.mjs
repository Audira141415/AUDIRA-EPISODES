// KIT.md contract check: every kits/<kit>/KIT.md must carry the mandatory sections of
// references/kit-md-template.md, each with real content. Used by `npm run audit:kits`
// (always first; `--docs` runs only this check, no render).

import fs from "node:fs";
import path from "node:path";

// [heading, extra test, message when the test fails]
export const KIT_SECTIONS = [
  ["Quick Start", (b) => /import\s/.test(b), "no import lines"],
  ["Palette", (b) => (b.match(/#[0-9a-fA-F]{6}\b/g) ?? []).length >= 3, "fewer than 3 hex colours"],
  ["Materials", null],
  ["Lighting & Finish", (b) => /Finish|flat/i.test(b), "no <Finish> parameters (or 'flat' reason)"],
  ["Camera (9:16 + 16:9)", (b) => /16:9/.test(b), "no 16:9 note"],
  ["Text & Readability", (b) => /SafeLabel/.test(b), "does not name <SafeLabel>"],
  ["Cover Framing", null],
  ["Avoid", null],
  ["Kit Components", null],
];

const sections = (md) => {
  const out = new Map();
  let cur = null;
  for (const line of md.replace(/\r/g, "").split("\n")) {
    const h = /^##\s+(.+?)\s*$/.exec(line);
    if (h) { cur = h[1]; out.set(cur, []); continue; }
    if (/^#\s/.test(line)) { cur = null; continue; }
    if (cur) out.get(cur).push(line);
  }
  return out;
};

/** Problems of one KIT.md text; [] when it meets the contract. */
export function checkKitMd(md) {
  const secs = sections(md);
  const problems = [];
  for (const [name, test, msg] of KIT_SECTIONS) {
    if (!secs.has(name)) { problems.push(`missing "## ${name}"`); continue; }
    const body = secs.get(name).join("\n");
    const lines = secs.get(name).filter((l) => l.trim() && !/^```/.test(l.trim())).length;
    if (lines < 2) problems.push(`"## ${name}" is empty`);
    else if (test && !test(body)) problems.push(`"## ${name}": ${msg}`);
  }
  return problems;
}

/** Check kits/<kit>/KIT.md for every kit dir (or only `only`). Returns { kit: problems[] }. */
export function auditKitDocs(kitsDir, only = null) {
  const res = {};
  for (const kit of fs.readdirSync(kitsDir).sort()) {
    if (only && !only.includes(kit)) continue;
    const f = path.join(kitsDir, kit, "KIT.md");
    if (!fs.statSync(path.join(kitsDir, kit)).isDirectory()) continue;
    res[kit] = fs.existsSync(f) ? checkKitMd(fs.readFileSync(f, "utf8")) : ["no KIT.md"];
  }
  return res;
}

/** Print red/green report; returns the number of failing kits. */
export function reportKitDocs(res) {
  const red = (s) => `\x1b[31m${s}\x1b[0m`;
  const bad = Object.entries(res).filter(([, p]) => p.length);
  for (const [kit, p] of bad) console.log(`${red("RED")}  ${kit.padEnd(20)} KIT.md: ${p.join("; ")}`);
  console.log(`KIT.md contract (references/kit-md-template.md): ${Object.keys(res).length - bad.length}/${Object.keys(res).length} ok` +
    (bad.length ? `, ${red(bad.length + " red")}` : ""));
  return bad.length;
}
