#!/usr/bin/env bash
# Renders every episode in turn. render.sh writes PREVIEW.mp4 until AUDIO/VO_MASTER.wav exists, then FINAL_VIDEO.mp4.
cd /f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_ROBLOX_FAKTA_2026
for e in ${@:-EP01_SUARA_OOF EP02_DYNABLOCKS EP03_JOHN_DOE EP04_GRAVITASI EP05_TIX}; do
  echo "== $e $(date +%T)"
  bash _tools/render.sh $e 4 || { echo "FAILED $e"; continue; }
done
echo ALLDONE $(date +%T)
