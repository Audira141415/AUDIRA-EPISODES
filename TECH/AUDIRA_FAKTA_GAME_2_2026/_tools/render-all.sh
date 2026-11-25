#!/usr/bin/env bash
# Renders every episode in turn. render.sh writes PREVIEW.mp4 until AUDIO/VO_MASTER.wav exists, then FINAL_VIDEO.mp4.
cd /f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_FAKTA_GAME_2_2026
for e in ${@:-EP01_KONAMI_CODE EP02_KUBURAN_ET EP03_NAMA_MARIO EP04_NINTENDO_1889 EP05_TETRIS}; do
  echo "== $e $(date +%T)"
  bash _tools/render.sh $e 4 || { echo "FAILED $e"; continue; }
done
echo ALLDONE $(date +%T)
