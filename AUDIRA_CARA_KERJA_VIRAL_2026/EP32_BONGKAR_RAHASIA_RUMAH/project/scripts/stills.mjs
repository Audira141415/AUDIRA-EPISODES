// Visual QA: bundle once, render chosen frames of a composition, tile them into a contact sheet.
//   node scripts/stills.mjs <outDir> <frame,frame,...> <compositionId> [scale]
// Frames may also be a share of the film (e.g. 50%). Writes _meta.json (fps, size, frames) next to the stills.
// Frames may be given in seconds with an "s" suffix (e.g. 4.5s), using the composition's fps.

import "./lib/tmpdir.mjs";
import path from "node:path";
import fs from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { context } from "./lib/memory.mjs";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { glMode, isWebGLError, switchToSoftware, tolerateClosedTargets } from "./gl.mjs";

tolerateClosedTargets();

const [outDir, list, id, scaleArg = "1"] = process.argv.slice(2);
if (!outDir || !list || !id) {
  console.error("usage: node scripts/stills.mjs <outDir> <frame,frame,...|4.5s,...> <compositionId> [scale]");
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

// Layout probe (lib/layout-probe.js): measures every DOM text block per frame for audit:layout.
// Bundled through a generated entry in <project>/.audira so "remotion" resolves from this project.
// AUDIRA_LAYOUT=off renders the plain entry.
const probe = process.env.AUDIRA_LAYOUT !== "off";
let entryPoint = path.resolve("src/index.ts");
const probeDir = path.resolve(".audira");
if (probe) {
  fs.mkdirSync(probeDir, { recursive: true });
  fs.copyFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "lib/layout-probe.js"), path.join(probeDir, "layout-probe.js"));
  entryPoint = path.join(probeDir, "probe-entry.ts");
  fs.writeFileSync(entryPoint, ['import "./layout-probe.js";', 'import "../src/index.ts";', ''].join("\n"));
}
const layout = [];
const onBrowserLog = (log) => {
  const t = log?.text ?? "";
  if (t.startsWith("AUDIRA_LAYOUT ")) { try { layout.push(JSON.parse(t.slice(14))); } catch {} }
  else if (t.startsWith("AUDIRA_LAYOUT_ERROR ")) console.error(`(layout probe: ${t.slice(20)})`);
};
const serveUrl = await bundle({ entryPoint, ignoreRegisterRootWarning: probe, publicDir: path.resolve("public") });
if (probe) fs.rmSync(probeDir, { recursive: true, force: true });
// bundles are ~50 MB each; never leave them in the temp dir, even when a render throws
const cleanup = () => fs.rmSync(serveUrl, { recursive: true, force: true });
process.on("exit", cleanup);
const composition = await selectComposition({ serveUrl, id });
const last = composition.durationInFrames - 1;
const frames = list.split(",").map((t) =>
  Math.min(last, Math.max(0, t.endsWith("%") ? Math.round((parseFloat(t) / 100) * last)
    : t.endsWith("s") ? Math.round(parseFloat(t) * composition.fps) : parseInt(t, 10))));
// A contact sheet always shows the outro card (directive 00 stage 8): add one when the list stops before the last 3 s.
// AUDIRA_OUTRO_TILE=off keeps the list as given (cover or single-frame checks).
{
  const lastFrame = composition.durationInFrames - 1;
  if (process.env.AUDIRA_OUTRO_TILE !== "off" && frames.length > 1 && !frames.some((f) => f >= lastFrame - Math.round(3 * composition.fps))) {
    frames.push(Math.max(0, lastFrame - Math.round(1.5 * composition.fps)));
    console.log(`outro tile added: frame ${frames.at(-1)}`);
  }
}
// sizes for callers (npm run draft) so they need not bundle again
fs.writeFileSync(path.join(outDir, "_meta.json"), JSON.stringify({ id, fps: composition.fps, durationInFrames: composition.durationInFrames, width: composition.width, height: composition.height, frames }));
const files = [];
const renderAll = async (gl) => {
  // one browser for all stills: WebGL contexts are expensive to create and tear down
  const puppeteerInstance = await openBrowser("chrome", { chromiumOptions: { gl } });
  try {
    files.length = 0;
    for (const frame of frames) {
      const output = path.join(outDir, `f${String(frame).padStart(4, "0")}.png`);
      await renderStill({ composition, serveUrl, output, frame, scale: Number(scaleArg), chromiumOptions: { gl }, timeoutInMilliseconds: 180000, puppeteerInstance, ...(probe ? { onBrowserLog } : {}) });
      files.push(output);
      process.stdout.write(`${frame} `);
    }
  } finally {
    // after a WebGL crash the tab may already be gone; closing must not hide the original error
    await puppeteerInstance.close({ silent: true }).catch(() => {});
  }
};
const gl = glMode();
try {
  await renderAll(gl);
} catch (e) {
  if (gl === "swangle" || !isWebGLError(e)) throw e;
  await renderAll(switchToSoftware());
}
console.log();
cleanup();
if (probe) {
  // keep the last measurement per rendered frame (a retry after a GL fallback measures again)
  const per = new Map(layout.map((m) => [m.frame, m]));
  const rows = frames.map((fr) => per.get(fr) ?? { frame: fr, missing: true });
  fs.writeFileSync(path.join(outDir, "_layout.json"), JSON.stringify({ id, width: composition.width, height: composition.height, frames: rows }));
  const n = rows.filter((x) => !x.missing).length;
  console.log(`layout: ${n}/${rows.length} frame(s) measured, ${rows.reduce((a, x) => a + (x.items?.length ?? 0), 0)} text block(s) (${path.join(outDir, "_layout.json")})`);
}

// contact sheet (needs ffmpeg; skipped if missing)
try {
  const w = Math.round(composition.width * Number(scaleArg)), h = Math.round(composition.height * Number(scaleArg));
  const cols = Math.min(4, files.length), rows = Math.ceil(files.length / cols), n = cols * rows;
  if (n > 1) {
    const inputs = files.flatMap((f) => ["-i", f]);
    const pads = Array.from({ length: n - files.length }, () => ["-f", "lavfi", "-i", `color=c=black:s=${w}x${h}`]).flat();
    const filter =
      Array.from({ length: n }, (_, i) => `[${i}:v]scale=${w}:${h},setsar=1[v${i}]`).join(";") + ";" +
      Array.from({ length: n }, (_, i) => `[v${i}]`).join("") +
      `xstack=inputs=${n}:layout=` + Array.from({ length: n }, (_, i) => `${(i % cols) * w}_${Math.floor(i / cols) * h}`).join("|") +
      `,scale='min(2160,iw)':-2`;
    execFileSync("ffmpeg", ["-v", "error", "-y", ...inputs, ...pads, "-filter_complex", filter, "-frames:v", "1", path.join(outDir, "_sheet.jpg")]);
    console.log(`sheet: ${path.join(outDir, "_sheet.jpg")}`);
  }
} catch {
  console.log("(contact sheet skipped: ffmpeg not available)");
}

// motion memory: measure these stills against the style cover and record the run (see lib/memory.mjs)
{
  const ctx = context({ comp: id });
  if (ctx.style && process.env.AUDIRA_MEMORY !== "off") {
    const r = spawnSync(process.execPath, [path.join(path.dirname(fileURLToPath(import.meta.url)), "visual-audit.mjs"), outDir,
      `--comp=${id}`, "--source=stills", `--json=${path.join(outDir, "look.json")}`, `--sheet=${path.join(outDir, "compare.jpg")}`], { encoding: "utf8" });
    const capped = (r.stdout?.match(/PERLU POLES:[^\n]*/) || [])[0];
    if (r.status === 0 || r.status === 1) console.log(`audit: ${ctx.style} ${capped ?? "no aspect capped below 4"} (${path.join(outDir, "look.json")})`);
    else console.error(`(audit skipped: ${String(r.stderr || r.error?.message || "").trim().split("\n")[0]})`);
  }
}
// a render that failed on the GPU path leaves its timeout timer behind; do not wait for it
process.exit(0);
