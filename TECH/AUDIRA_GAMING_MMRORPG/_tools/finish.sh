#!/usr/bin/env bash
# Run after Cartesia credits are back: bash _tools/finish.sh [EP folders]. Voice, word lock, render, QC and docs for every episode.
set -e
ROOT=/f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_GAMING_MMRORPG
EPS=${@:-EP01_MIR4 EP02_ROHAN2 EP03_BIG_TIME EP04_NINE_CHRONICLES EP05_PIXELS}
for e in $EPS; do
  cd /f/AUDIRA-VIDEO-MOTION
  python AUDIRA_GAMING_MMRORPG/_tools/vo.py "$e" tts --speed 1.0
  python AUDIRA_GAMING_MMRORPG/_tools/vo.py "$e" build --tempo 1.0
  cd "$ROOT"
  bash _tools/render.sh "$e" 4
  (cd "$e" && ffmpeg -y -loglevel error -i FINAL_VIDEO.mp4 -vn -ar 44100 -ac 2 -c:a pcm_s16le AUDIO/master_audio.wav && python ../_tools/qc.py)
done
cd "$ROOT"
python _tools/write-docs.py
node _tools/validate-captions.mjs
