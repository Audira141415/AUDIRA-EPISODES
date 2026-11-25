#!/usr/bin/env bash
# Run once from AUDIRA_PASANG_MOTION_2026: copies the reusable pipeline and fills each episode's HyperFrames project.
set -e
V=/f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_AI_MOTION_VIRAL
G=/f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_AI_GAME_2026
for f in audio_lib.py build-srt.py hflib.mjs vo.py qc.py qc-preview.py estimate.py shell.mjs stt-check.py; do cp "$V/_tools/$f" _tools/; done
cp "$G/_tools/lib3d.js" _tools/lib3d.js
sed -i 's/AUDIRA_AI_MOTION_VIRAL/AUDIRA_PASANG_MOTION_2026/g' _tools/vo.py
sed -i 's/data-(?:at|in|out|a)=/data-(?:at|in|out|a|t)=/' _tools/hflib.mjs
sed -i 's/AI MOTION TANPA RIBET &middot; EP ${o.ep}/${o.series}/' _tools/shell.mjs
BASE=$V/EP05_MOTION_GRAPHICS/PROJECT/HyperFrames_Remotion
for d in EP01_PASANG_SKILL EP02_SAMBUNG_MESH EP03_JADI_STUDIO; do
  P=$d/PROJECT/HyperFrames_Remotion
  mkdir -p "$P/assets/audio" "$P/assets/brand" "$P/assets/img" "$P/assets/lib" "$P/assets/video" "$P/compositions" "$d/PROJECT/qc" "$d/AUDIO/work" "$d/SUBTITLES"
  cp "$BASE"/assets/lib/*.js "$P/assets/lib/"
  rm -f "$P/assets/lib/world3d.js"
  cp "$BASE/assets/brand/stacked-reversed.svg" "$P/assets/brand/"
  cp "$BASE/assets/img/grain.png" "$P/assets/img/"
  cp "$BASE/hyperframes.json" "$P/"
done
SMOKE=/f/AUDIRA-VIDEO-MOTION/_install-test/film1/out/smoke/_sheet.jpg  # layout-check: optional (one-time install test output)
SMOKE_DST=EP01_PASANG_SKILL/PROJECT/HyperFrames_Remotion/assets/img/smoke.jpg
if [ -f "$SMOKE" ]; then cp "$SMOKE" "$SMOKE_DST"; elif [ ! -f "$SMOKE_DST" ]; then echo "missing $SMOKE (run the install test first)" >&2; exit 1; fi
S=/f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_STYLE_SHOWCASE_2026/deliver/video
VD=EP03_JADI_STUDIO/PROJECT/HyperFrames_Remotion/assets/video
for c in 01-pixelstory 04-paperworld 05-innerworks 09-cyberforge 11-clayworld 18-circuitforge 27-retrowave 14-glasscraft; do cp "$S/$c.mp4" "$VD/"; done
python _tools/write-scripts.py
python _tools/estimate.py
