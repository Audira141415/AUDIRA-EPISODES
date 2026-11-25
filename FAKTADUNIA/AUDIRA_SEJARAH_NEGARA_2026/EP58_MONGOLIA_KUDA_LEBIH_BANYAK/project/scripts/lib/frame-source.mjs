// One frame from a film that is not a Remotion composition: an MP4 from any engine, or a HyperFrames
// project (npx hyperframes snapshot). Used by cover-still.mjs and thumbs.mjs with --from-video / --hyperframes.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { size as mbSize, duration as mbDuration } from "./media.mjs";

const isVideo = (f) => /\.(mp4|mov|mkv|webm|avi|ts|m4v)$/i.test(f);

/** Width and height of a video or image.  Async: MediaBunny for video, ffprobe for images. */
export async function sizeOf(file) {
  if (isVideo(file)) return mbSize(file);
  const r = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", file], { encoding: "utf8" });
  const [w, h] = r.stdout.trim().split(",").map(Number);
  return { width: w, height: h };
}

/** Duration in seconds of a video.  Async: MediaBunny for video, ffprobe for audio. */
export async function durationOf(file) {
  if (isVideo(file) || /\.(mp3|wav|flac|ogg|aac|m4a)$/i.test(file)) return mbDuration(file);
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" });
  return Number(r.stdout.trim()) || 0;
}

/** Write the frame at `seconds` of an MP4 to `png`. */
export function frameFromVideo(video, seconds, png) {
  const r = spawnSync("ffmpeg", ["-v", "error", "-y", "-ss", String(seconds), "-i", video, "-frames:v", "1", png], { encoding: "utf8" });
  if (r.status !== 0 || !fs.existsSync(png)) throw new Error(`ffmpeg could not read ${video} at ${seconds}s: ${r.stderr}`);
  return png;
}

/** Write the frame at `seconds` of a HyperFrames project to `png` (npx hyperframes snapshot). */
export function frameFromHyperframes(project, seconds, png) {
  // each run writes .hyperframes/artifacts/snapshots/<run id>/frame-00-at-<t>s.png (plus the last frame)
  const dir = path.join(project, ".hyperframes", "artifacts", "snapshots");
  const t0 = Date.now() - 1000;
  const r = spawnSync("npx", ["hyperframes", "snapshot", "--at", String(seconds)], { cwd: project, encoding: "utf8", shell: process.platform === "win32" });
  if (r.status !== 0) throw new Error(`hyperframes snapshot failed: ${(r.stderr || r.stdout).trim().split("\n").slice(-3).join(" ")}`);
  const found = [];
  const walk = (d) => { if (!fs.existsSync(d)) return; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/^frame-00-at-.*\.png$/i.test(e.name) && fs.statSync(p).mtimeMs >= t0) found.push(p); } };
  walk(dir);
  found.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  if (!found.length) throw new Error(`hyperframes snapshot wrote no frame-00 PNG under ${dir}`);
  fs.copyFileSync(found[0], png);
  return png;
}
