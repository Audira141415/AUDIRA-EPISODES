#!/usr/bin/env bash
# Renders every episode in turn. render.sh writes PREVIEW.mp4 until AUDIO/VO_MASTER.wav exists, then FINAL_VIDEO.mp4.
cd /f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_AI_GAME_2026
for e in ${@:-EP01_BUILD_HP EP02_MOBIL_4D EP03_NPC_OTAK EP04_AI_DEVELOPER EP05_TOP_20}; do
  echo "== $e $(date +%T)"
  bash _tools/render.sh $e 4 || { echo "FAILED $e"; continue; }
done
echo ALLDONE $(date +%T)
