// Topic cover from the film itself, so the thumbnail and the film's opening are the same picture.
//   Remotion:     npm run cover -- <Comp> [<WideComp>] --episode=<episode folder> [--at=0.3s|<frame>] [--framing=<module.ts>:<export>] [--force]
//   HyperFrames:  node <starter>/scripts/cover-still.mjs --hyperframes=<project>[,<wide project>] --episode=<episode folder> [--at=0.3] [--force]
//   Any MP4:      node <starter>/scripts/cover-still.mjs --from-video=<film.mp4>[,<wide.mp4>] --episode=<episode folder> [--at=0.3] [--force]
//
// Each source becomes one cover in <episode>/style/: a 9:16 frame -> cover-topic.png (short / vertical),
// a 16:9 frame -> cover-topic-wide.png (long-form; rule 09: both are shown and approved together).
// Writes <episode>/style/cover.json: { seconds, renderedAt, engine, covers: [{ source, file, width, height }], framing? }.
// --framing (Remotion) records the camera framing the hook starts from (the shot list's start).
// An existing cover is an approved thumbnail: it is only replaced with --force (re-approve it after).
// Check a film against it with npm run audit:cover -- <film.mp4> <episode>/style/cover-topic[-wide].png.
// The HyperFrames and MP4 modes need no Remotion project: run them with node from any folder.

import "./lib/tmpdir.mjs";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { sizeOf, frameFromVideo, frameFromHyperframes } from "./lib/frame-source.mjs";

const opt = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) ?? `=${d ?? ""}`).split("=").slice(1).join("=");
const comps = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const episode = opt("episode");
const videos = opt("from-video") ? opt("from-video").split(",") : [];
const hfs = opt("hyperframes") ? opt("hyperframes").split(",") : [];
if ((!comps.length && !videos.length && !hfs.length) || !episode) {
  console.error("usage: npm run cover -- <Comp> [<WideComp>] --episode=<folder> | --hyperframes=<project>[,…] --episode=<folder> | --from-video=<mp4>[,…] --episode=<folder>  [--at=0.3s] [--force]");
  process.exit(2);
}
const styleDir = path.join(path.resolve(episode), "style");
fs.mkdirSync(styleDir, { recursive: true });
const at = opt("at", "0.3s");
const atSec = parseFloat(at);
const covers = [];

const target = (w, h) => {
  const png = path.join(styleDir, w > h ? "cover-topic-wide.png" : "cover-topic.png");
  if (fs.existsSync(png) && !process.argv.includes("--force")) {
    console.error(`${png} exists (an approved cover). Re-run with --force to replace it, then ask for approval again.`);
    process.exit(1);
  }
  return png;
};

let framing, engine;
if (comps.length) {
  engine = "remotion";
  if (opt("framing")) {
    const [mod, name] = opt("framing").split(/:(?=[^\\/]+$)/);
    const m = await import(pathToFileURL(path.resolve(mod)).href);
    framing = m[name || "COVER"];
    if (framing === undefined) { console.error(`no export "${name || "COVER"}" in ${mod}`); process.exit(2); }
  }
  // Remotion is loaded only in this mode, so the HyperFrames/MP4 modes run outside a Remotion project
  const { bundle } = await import("@remotion/bundler");
  const { openBrowser, renderStill, selectComposition } = await import("@remotion/renderer");
  const { glMode } = await import("./gl.mjs");
  const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
  const gl = glMode();
  const browser = await openBrowser("chrome", { chromiumOptions: { gl } });
  for (const id of comps) {
    const composition = await selectComposition({ serveUrl, id });
    const png = target(composition.width, composition.height);
    const frame = at.endsWith("s") ? Math.round(atSec * composition.fps) : parseInt(at, 10);
    await renderStill({ composition, serveUrl, output: png, frame, puppeteerInstance: browser, chromiumOptions: { gl }, timeoutInMilliseconds: 180000 });
    covers.push({ source: id, file: path.basename(png), width: composition.width, height: composition.height });
    console.log(`cover: ${png} (${id} frame ${frame}, ${composition.width}x${composition.height})`);

    // Dual-format cover: automatically generate 3:4 profile grid crop (1080x1350)
    if (composition.width === 1080 && composition.height === 1920) {
      try {
        const cp = await import("node:child_process");
        const gridPng = path.join(styleDir, "cover_1080x1350.png");
        const ffmpegBin = process.env.FFMPEG_PATH || "ffmpeg";
        cp.spawnSync(ffmpegBin, ["-y", "-i", png, "-vf", "crop=1080:1350:0:285", gridPng], { stdio: "ignore" });
        if (fs.existsSync(gridPng)) {
          covers.push({ source: id, file: "cover_1080x1350.png", width: 1080, height: 1350, type: "profile_grid_3x4" });
          console.log(`cover: ${gridPng} (3:4 grid safe profile crop for IG/TikTok feed)`);
        }
      } catch {}
    }
  }
  await browser.close({ silent: true });
  fs.rmSync(serveUrl, { recursive: true, force: true });
} else {
  engine = hfs.length ? "hyperframes" : "video";
  const tmp = path.join(styleDir, ".cover-tmp.png");
  for (const src of [...hfs, ...videos]) {
    const isHF = hfs.includes(src);
    if (isHF) frameFromHyperframes(path.resolve(src), atSec, tmp); else frameFromVideo(path.resolve(src), atSec, tmp);
    const { width, height } = await sizeOf(tmp);
    const png = target(width, height);
    fs.renameSync(tmp, png);
    covers.push({ source: src, file: path.basename(png), width, height });
    console.log(`cover: ${png} (${isHF ? "hyperframes snapshot" : "video"} at ${atSec}s, ${width}x${height})`);
  }
}

const meta = { seconds: atSec, renderedAt: new Date().toISOString(), engine, covers, ...(framing !== undefined ? { framing } : {}) };
fs.writeFileSync(path.join(styleDir, "cover.json"), JSON.stringify(meta, null, 2) + "\n");
console.log(`meta:  ${path.join(styleDir, "cover.json")}`);
process.exit(0);
