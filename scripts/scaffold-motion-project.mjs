// AUDIRA Motion Project Scaffolder
// Instantly scaffolds a studio-grade 9:16 vertical motion video project
// Usage: node scripts/scaffold-motion-project.mjs <project-name>
import { mkdirSync, writeFileSync, copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const projectName = process.argv[2];
if (!projectName) {
  console.error("Usage: node scripts/scaffold-motion-project.mjs <project-name>");
  process.exit(1);
}

const baseDir = join(process.cwd(), projectName);
const dirs = [
  "",
  "research",
  "script",
  "storyboard",
  "video",
  "video/compositions",
  "video/assets",
  "video/assets/voice",
  "video/assets/sfx",
  "video/assets/bgm",
  "video/assets/brand"
];

dirs.forEach((d) => mkdirSync(join(baseDir, d), { recursive: true }));

// 1. voiceover.json
const voJson = {
  model: "sonic-3",
  language: "id",
  voice: "04b567df-2923-4b0c-896b-4b7df0a07e1a",
  out_dir: "video/assets/voice",
  lines: [
    { id: "s1-hook", text: "Tuliskan hook pembuka 3 detik pertama di sini." },
    { id: "s2-fakta", text: "Fakta utama dan data terverifikasi di sini." },
    { id: "s3-konteks", text: "Penjelasan mendalam dan analisis konteks di sini." },
    { id: "s4-dampak", text: "Dampak langsung dan signifikansi isu di sini." },
    { id: "s5-klimaks", text: "Poin krusial atau tantangan terbesar di sini." },
    { id: "s6-penutup", text: "Kesimpulan dan call to action penutup di sini." }
  ]
};
writeFileSync(join(baseDir, "voiceover.json"), JSON.stringify(voJson, null, 2));

// 2. cues.json (SFX cue plan)
const cuesJson = [
  ["cue-1", "impact-bass-1", "s1", 0.1],
  ["cue-2", "whoosh-short", "s1", 1.2],
  ["cue-3", "pop", "s2", 0.3],
  ["cue-4", "ping", "s3", 0.5],
  ["cue-5", "whoosh-cinematic", "s4", 0.1],
  ["cue-6", "chime", "s6", 2.0]
];
writeFileSync(join(baseDir, "cues.json"), JSON.stringify(cuesJson, null, 2));

// 3. hyperframes.json
const hfJson = {
  $schema: "https://hyperframes.heygen.com/schema/hyperframes.json",
  registry: "https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry",
  paths: {
    blocks: "compositions",
    components: "compositions/components",
    assets: "assets"
  },
  media: {
    autoProxy: true
  },
  authoringSkill: "hyperframes"
};
writeFileSync(join(baseDir, "video/hyperframes.json"), JSON.stringify(hfJson, null, 2));

// 4. video/index.html (with Studio Motion Kit + Safe Zones + GSAP)
const indexHtml = `<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>${projectName} — AUDIRA MOTION</title>
    <link rel="stylesheet" href="../../shared/styles/studio-motion.css" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script src="../../shared/scripts/studio-motion-kit.js"></script>
  </head>
  <body>
    <div id="stage" data-composition-id="main" data-width="1080" data-height="1920">
      <!-- Ambient Studio Layers -->
      <div class="ambient-grain"></div>
      <div class="ambient-vignette"></div>
      <div class="ambient-grid"></div>

      <!-- Main Visual Scenes Track -->
      <div id="visual-track" data-track-index="1" style="position: absolute; inset: 0; z-index: 2;"></div>

      <!-- Word-by-Word Karaoke Subtitles Track -->
      <div id="captions-track" data-track-index="3" style="z-index: 95;"></div>

      <!-- AUDIRA Outro Card -->
      <div id="outro-card" style="position: absolute; bottom: 80px; left: 0; right: 0; display: none; z-index: 97; text-align: center;">
        <img src="../../shared/assets/brand/audira-outro-card.svg" width="600" />
      </div>

      <!-- Audio Master Tracks -->
      <audio id="vo" class="clip" data-track-index="4" src="assets/audio/vo.wav"></audio>
      <audio id="bgm" class="clip" data-track-index="5" data-volume="0.12" src="assets/bgm/track.wav"></audio>
    </div>

    <script>
      const tl = gsap.timeline({ paused: true });
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = tl;

      // Master Studio Camera Drift
      StudioMotion.cameraDrift("#visual-track", 90, { scaleTo: 1.05 });
    </script>
  </body>
</html>
`;
writeFileSync(join(baseDir, "video/index.html"), indexHtml);

console.log(`✅ Project [${projectName}] successfully scaffolded with AUDIRA Studio Motion Kit!`);

