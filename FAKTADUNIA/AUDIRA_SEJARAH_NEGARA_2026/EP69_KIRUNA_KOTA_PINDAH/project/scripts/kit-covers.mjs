// Reference covers for style kits (style gate), rendered from each kit's Final composition.
//   npm run kit:covers -- --out=<folder> --kits=collage,film16 [--at=0.6]
//
// For each kit: finds its <Kit>Final composition, renders the frame at --at of its length (default 60 %)
// at 1080×1920 and writes <out>/<kit>.jpg. Used when a new style is added (the MCP style sync lists
// styles without a cover); pick a better --at per kit if the default frame is weak.

import "./lib/tmpdir.mjs";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { getCompositions, openBrowser, renderStill } from "@remotion/renderer";
import { glMode } from "./gl.mjs";

const opt = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) ?? `=${d ?? ""}`).split("=").slice(1).join("=");
const out = opt("out"), kits = opt("kits").split(",").map((k) => k.trim().toLowerCase()).filter(Boolean), at = Number(opt("at", "0.6"));
if (!out || !kits.length) { console.error("usage: npm run kit:covers -- --out=<folder> --kits=collage,film16 [--at=0.6]"); process.exit(2); }
fs.mkdirSync(out, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const comps = await getCompositions(serveUrl);
const gl = glMode();
const browser = await openBrowser("chrome", { chromiumOptions: { gl } });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "kitcovers-"));
for (const k of kits) {
  const c = comps.find((x) => x.id.toLowerCase() === `${k}final`) || comps.find((x) => x.id.toLowerCase() === `${k}preview`);
  if (!c) { console.error(`${k}: no ${k}Final composition in src/Root.tsx`); continue; }
  const png = path.join(tmp, `${k}.png`);
  await renderStill({ composition: c, serveUrl, output: png, frame: Math.round(c.durationInFrames * at), puppeteerInstance: browser, chromiumOptions: { gl }, timeoutInMilliseconds: 180000 });
  const jpg = path.join(out, `${k}.jpg`);
  spawnSync("ffmpeg", ["-v", "error", "-y", "-i", png, "-vf", "scale=1080:1920", "-q:v", "3", jpg]);
  console.log(`${jpg}  (${c.id} frame ${Math.round(c.durationInFrames * at)})`);
}
await browser.close({ silent: true });
fs.rmSync(tmp, { recursive: true, force: true });
fs.rmSync(serveUrl, { recursive: true, force: true });
process.exit(0);
