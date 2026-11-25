// Renders preview/character_animation_showcase.html to MP4 and GIF using Puppeteer and FFmpeg
import puppeteer from "puppeteer-core";
import { spawn } from "node:child_process";
import { resolve, join } from "node:path";
import { existsSync, mkdirSync } from "node:fs";

const BROWSER_PATH = existsSync("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe")
  ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  : "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const WIDTH = 540; // 540x960 for fast preview render
const HEIGHT = 960;
const FPS = 25;
const DURATION = 6.8; // 6.8 seconds
const TOTAL_FRAMES = Math.round(FPS * DURATION);

const HTML_URL = "file:///" + resolve("preview/character_animation_showcase.html").replace(/\\/g, "/");
const OUT_MP4 = resolve("preview/character_showcase.mp4");
const OUT_GIF = resolve("preview/character_showcase.gif");
const AUDIO_FILE = resolve("video/assets/voice/s1-hook.wav");

console.log("Launching headless browser at:", BROWSER_PATH);
const browser = await puppeteer.launch({
  executablePath: BROWSER_PATH,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
});

const page = await browser.newPage();
await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
await page.goto(HTML_URL, { waitUntil: "networkidle0" });

console.log(`Rendering ${TOTAL_FRAMES} frames @ ${FPS} FPS (${DURATION}s)...`);

// Spawn ffmpeg to encode MP4 directly from stdin raw video
const ffmpeg = spawn("ffmpeg", [
  "-y",
  "-f", "image2pipe",
  "-vcodec", "mjpeg",
  "-r", String(FPS),
  "-i", "-",
  "-i", AUDIO_FILE,
  "-c:v", "libx264",
  "-pix_fmt", "yuv420p",
  "-c:a", "aac",
  "-b:a", "192k",
  "-shortest",
  OUT_MP4
]);

ffmpeg.stderr.on("data", () => {}); // silence pipe

for (let i = 0; i < TOTAL_FRAMES; i++) {
  const time = i / FPS;
  // Seek GSAP timeline precisely to time
  await page.evaluate((t) => {
    if (window.tl) window.tl.seek(t);
  }, time);

  const screenshot = await page.screenshot({ type: "jpeg", quality: 85 });
  ffmpeg.stdin.write(screenshot);
  if (i % 25 === 0) process.stdout.write(`Frame ${i}/${TOTAL_FRAMES} (${(time).toFixed(1)}s)\n`);
}

ffmpeg.stdin.end();
await new Promise((res) => ffmpeg.on("close", res));
console.log("✅ MP4 render complete ->", OUT_MP4);

await browser.close();

// Also generate a lightweight animated GIF for instant viewing
console.log("Generating animated GIF preview...");
const gifProc = spawn("ffmpeg", [
  "-y",
  "-i", OUT_MP4,
  "-t", "4.5",
  "-vf", "fps=15,scale=360:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
  OUT_GIF
]);
await new Promise((res) => gifProc.on("close", res));
console.log("✅ Animated GIF complete ->", OUT_GIF);

