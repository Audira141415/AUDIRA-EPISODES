// Writes <ep>/video/index.html for the Roblox series: the film composition, captions, voice,
// music bed and every SFX cue from <ep>/scripts/cues.json ([id, sound, scene, localTime]),
// with tracks allocated so no two cues share a lane. Also loops the MusicGen seed to length.
// Usage (from the repo root): node scripts/ep-assemble.mjs <ep-dir> [bgmVolume]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const EP = process.argv[2];
const BGM_VOL = process.argv[3] || "0.12";
const P = (f) => join(EP, f);
const SC = JSON.parse(readFileSync(P("scripts/scenes.json"), "utf8"));
const TOTAL = SC.TOTAL;
const LEN = { "whoosh-short": 0.57, whoosh: 0.57, typing: 1.5, pop: 0.72, "impact-bass-1": 2.1, click: 0.36, ping: 1.32, sparkle: 1.8, chime: 2.5, error: 0.9, "glitch-1": 0.6, "glitch-2": 0.6, "glitch-3": 0.6 };
const VOL = { "whoosh-short": 0.28, whoosh: 0.28, typing: 0.2, pop: 0.28, "impact-bass-1": 0.3, click: 0.34, ping: 0.22, sparkle: 0.2, chime: 0.28, error: 0.24, "glitch-1": 0.2, "glitch-2": 0.2, "glitch-3": 0.2 };

const cues = JSON.parse(readFileSync(P("scripts/cues.json"), "utf8"))
  .map(([id, snd, sc, t]) => ({ id, snd, start: +(SC[sc].start + t).toFixed(2) }))
  .sort((a, b) => a.start - b.start);
const trackEnd = { 6: -1, 7: -1, 8: -1, 9: -1, 10: -1 };
const tags = cues.map((c) => {
  const dur = +Math.min(LEN[c.snd], TOTAL - c.start).toFixed(2);
  const tr = Object.keys(trackEnd).find((k) => trackEnd[k] <= c.start - 0.01);
  if (!tr) throw new Error("no free track at " + c.start);
  trackEnd[tr] = c.start + dur;
  return `      <audio id="sfx-${c.id}" class="clip" src="assets/sfx/${c.snd}.mp3" data-start="${c.start}" data-duration="${dur}" data-track-index="${tr}" data-volume="${VOL[c.snd]}"></audio>`;
});

const seed = P("video/assets/bgm/seed.wav");
if (existsSync(seed)) {
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-stream_loop", "-1", "-i", seed, "-t", String(TOTAL), "-af", `afade=t=in:d=0.6,afade=t=out:st=${(TOTAL - 3).toFixed(2)}:d=3`, "-ar", "44100", P("video/assets/bgm/track.wav")]);
}

const bg = JSON.parse(readFileSync(P("scripts/vo-config.json"), "utf8")).ground || "#000";
writeFileSync(
  P("video/index.html"),
  `<!doctype html>
<html lang="id" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      html,
      body {
        margin: 0;
        width: 1080px;
        height: 1920px;
        overflow: hidden;
        background: ${bg};
      }
      #root {
        width: 100%;
        height: 100%;
      }
      #stage-ground {
        position: absolute;
        inset: 0;
        background: ${bg};
      }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1080" data-height="1920">
      <div id="stage-ground"></div>
      <!-- The whole film, every beat locked to the Cartesia word timestamps (scripts/beats.txt) -->
      <div id="film" data-composition-id="film" data-composition-src="compositions/film.html" data-start="0" data-duration="${TOTAL}" data-track-index="1" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index: 2"></div>
      <!-- Captions built from vo-words.json (scripts/ep-build-vo.mjs) -->
      <div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="${TOTAL}" data-track-index="3" data-track-kind="captions" data-width="1080" data-height="1920" style="z-index: 10"></div>
      <!-- Voiceover: Cartesia sonic-3, voice Galang -->
      <audio id="vo" class="clip" data-start="0" data-duration="${TOTAL}" data-track-index="4" src="assets/audio/vo.wav"></audio>
      <!-- Music bed: MusicGen (facebook/musicgen-small) seed, looped -->
      <audio id="bgm" class="clip" src="assets/bgm/track.wav" data-start="0" data-duration="${TOTAL}" data-track-index="5" data-volume="${BGM_VOL}"></audio>
      <!-- SFX on visible actions -->
${tags.join("\n")}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`
);
console.log(`${EP}: ${TOTAL}s, ${tags.length} sfx`);
