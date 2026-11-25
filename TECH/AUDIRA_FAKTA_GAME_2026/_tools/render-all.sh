#!/usr/bin/env bash
# Renders every episode in turn. render.sh writes PREVIEW.mp4 until AUDIO/VO_MASTER.wav exists, then FINAL_VIDEO.mp4.
cd /f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_FAKTA_GAME_2026
for e in ${@:-EP01_WABAH_WOW EP02_CREEPER EP03_PACMAN_256 EP04_GANDHI_NUKLIR EP05_SPACE_INVADERS}; do
  echo "== $e $(date +%T)"
  bash _tools/render.sh $e 4 || { echo "FAILED $e"; continue; }
done
echo ALLDONE $(date +%T)
