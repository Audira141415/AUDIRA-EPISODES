#!/usr/bin/env bash
# Run after the scripts are approved: bash _tools/finish.sh [EP folders]. Voice, word lock, render, QC and docs for every episode.
set -e
ROOT=/f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_ROBLOX_FAKTA_2026
EPS=${@:-EP01_SUARA_OOF EP02_DYNABLOCKS EP03_JOHN_DOE EP04_GRAVITASI EP05_TIX}
for e in $EPS; do
  cd /f/AUDIRA-VIDEO-MOTION
  python AUDIRA_ROBLOX_FAKTA_2026/_tools/vo.py "$e" tts --speed 1.0
  python AUDIRA_ROBLOX_FAKTA_2026/_tools/vo.py "$e" build --tempo 1.0
  cd "$ROOT"
  bash _tools/render.sh "$e" 4
  (cd "$e" && ffmpeg -y -loglevel error -i FINAL_VIDEO.mp4 -vn -ar 44100 -ac 2 -c:a pcm_s16le AUDIO/master_audio.wav && python ../_tools/qc.py)
done
cd "$ROOT"
python _tools/write-docs.py
