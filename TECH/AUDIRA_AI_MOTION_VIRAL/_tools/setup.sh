#!/usr/bin/env bash
# Run once from AUDIRA_AI_MOTION_VIRAL: copies the reusable pipeline from the MMORPG series and fills each episode's HyperFrames project.
set -e
SRC=/f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_GAMING_MMRORPG
ROOT=/f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_AI_MOTION_VIRAL
cd "$ROOT"
for f in audio_lib.py build-srt.py hflib.mjs lib3d.js remix.sh shell.mjs vo.py qc.py validate-captions.mjs estimate.py; do cp -n "$SRC/_tools/$f" _tools/; done
python _tools/write-scripts.py
BASE=$SRC/EP01_MIR4/PROJECT/HyperFrames_Remotion
for d in EP0*; do
  P=$d/PROJECT/HyperFrames_Remotion
  mkdir -p "$P/assets/audio" "$P/assets/brand" "$P/assets/fonts" "$P/assets/img" "$P/assets/lib" "$P/compositions" "$d/PROJECT/qc"
  cp -n "$BASE"/assets/lib/*.js "$P/assets/lib/" 2>/dev/null || true
  cp -n "$BASE"/assets/brand/stacked-reversed.svg "$P/assets/brand/"
  cp -n "$BASE"/assets/img/grain.png "$P/assets/img/"
  cp -n "$BASE"/hyperframes.json "$P/"
done
python _tools/estimate.py
