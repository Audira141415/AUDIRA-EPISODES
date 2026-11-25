#!/usr/bin/env bash
# Renders every episode, then measures it. render.sh names the output FINAL_VIDEO.mp4 once AUDIO/VO_MASTER.wav exists.
cd /f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_GAMING_MMRORPG
for e in EP05_PIXELS EP01_MIR4 EP02_ROHAN2 EP03_BIG_TIME EP04_NINE_CHRONICLES; do
  echo "== $e $(date +%T)"
  bash _tools/render.sh $e 4 || { echo "FAILED $e"; continue; }
  (cd $e && ffmpeg -y -loglevel error -i FINAL_VIDEO.mp4 -vn -ar 44100 -ac 2 -c:a pcm_s16le AUDIO/master_audio.wav && python ../_tools/qc.py > PROJECT/qc/qc.log 2>&1 || echo "QC FAILED $e")
done
echo ALLDONE $(date +%T)
