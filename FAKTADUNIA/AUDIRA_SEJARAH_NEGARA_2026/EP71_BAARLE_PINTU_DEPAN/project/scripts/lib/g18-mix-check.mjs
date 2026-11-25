// G18d: static check of an episode project's final mix script (render-final.mjs) against the G18 audio
// mixing defaults. Used by preflight. EP29 Rudy Hartono (2026-11-23) shipped with VO too quiet and SFX
// ~6 dB louder than the narrator because its render-final.mjs was copied from an old template:
// VO without loudnorm, SFX stem without trim, duck ratio 2.5 / threshold 0.1.
//
// Rule: the ducked SFX must sit at an effective -30 LUFS before the duck, whatever the stem generation:
//   stem TARGET_LUFS -20 (old sfx/cues/auto.py) + volume=-10dB   or   stem -26 (new) + volume=-4dB.
import fs from "node:fs";
import path from "node:path";

const EFFECTIVE_MAX = -29.5; // stem LUFS + trim dB must be at or below this

/** @returns {{ file: string, issues: string[] }[]} one entry per render-final.mjs found in the project */
export function checkMixScripts(dir) {
  const roots = [dir, path.join(dir, "project")];
  const out = [];
  for (const root of roots) {
    const file = path.join(root, "scripts", "render-final.mjs");
    if (!fs.existsSync(file)) continue;
    const src = fs.readFileSync(file, "utf8");
    const issues = [];
    if (/ratio=2\.5/.test(src)) issues.push("duck ratio=2.5 (graph mix lama)");
    if (!/ratio=8\b/.test(src)) issues.push("duck tanpa ratio=8");
    if (!/threshold=0\.015\b/.test(src)) issues.push("duck tanpa threshold=0.015");
    if (!/attack=5\b/.test(src)) issues.push("duck tanpa attack=5");
    if (!/loudnorm=I=-16\b/.test(src)) issues.push("VO tanpa loudnorm=I=-16 sebelum mix");
    const trim = /volume=(-?\d+(?:\.\d+)?)dB/.exec(src);
    if (!trim) issues.push("stem SFX tanpa trim volume=-XdB");
    const auto = path.join(root, "sfx", "cues", "auto.py");
    const stem = fs.existsSync(auto) ? /^TARGET_LUFS\s*=\s*(-?\d+(?:\.\d+)?)/m.exec(fs.readFileSync(auto, "utf8")) : null;
    if (trim && stem) {
      const eff = Number(stem[1]) + Number(trim[1]);
      if (eff > EFFECTIVE_MAX) issues.push(`SFX efektif ${eff} LUFS (stem ${stem[1]} + trim ${trim[1]} dB), wajib <= -30`);
    }
    if (!/G18d|G18c/.test(src)) issues.push("tanpa guard G18c/G18d (cek level sebelum render)");
    out.push({ file, issues });
  }
  return out;
}
