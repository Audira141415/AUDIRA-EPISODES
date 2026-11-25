#!/usr/bin/env bash
# Run after Cartesia credits are back: bash _tools/finish.sh [EP folders]. Voice, word lock, render, QC and docs for every episode.
set -e
ROOT=/f/AUDIRA-VIDEO-MOTION/AUDIRA_KISAH_ISLAM_2026
EPS=${@:-EP01_ASHABUL_KAHFI_309_TAHUN EP02_YUNUS_TIGA_KEGELAPAN EP03_PASUKAN_GAJAH_ABRAHAH EP04_MUSA_MEMBELAH_LAUT EP05_BAHTERA_NUH_950_TAHUN}
for e in $EPS; do
  cd /f/AUDIRA-VIDEO-MOTION
  python AUDIRA_KISAH_ISLAM_2026/_tools/vo.py "$e" tts --speed 1.0
  python AUDIRA_KISAH_ISLAM_2026/_tools/vo.py "$e" build --tempo 1.0
  cd "$ROOT"
  bash _tools/render.sh "$e" 4
  (cd "$e" && ffmpeg -y -loglevel error -i FINAL_VIDEO.mp4 -vn -ar 44100 -ac 2 -c:a pcm_s16le AUDIO/master_audio.wav && python ../_tools/qc.py)
done
cd "$ROOT"
python _tools/tag-meta.py $EPS
python _tools/write-docs.py
node _tools/validate-captions.mjs
