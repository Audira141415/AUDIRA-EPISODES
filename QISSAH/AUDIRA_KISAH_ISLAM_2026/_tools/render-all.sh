#!/usr/bin/env bash
# Renders every episode, then measures it. render.sh names the output FINAL_VIDEO.mp4 once AUDIO/VO_MASTER.wav exists.
cd /f/AUDIRA-VIDEO-MOTION/AUDIRA_KISAH_ISLAM_2026
for e in EP01_ASHABUL_KAHFI_309_TAHUN EP02_YUNUS_TIGA_KEGELAPAN EP03_PASUKAN_GAJAH_ABRAHAH EP04_MUSA_MEMBELAH_LAUT EP05_BAHTERA_NUH_950_TAHUN; do
  echo "== $e $(date +%T)"
  bash _tools/render.sh $e 4 || { echo "FAILED $e"; continue; }
  (cd $e && ffmpeg -y -loglevel error -i FINAL_VIDEO.mp4 -vn -ar 44100 -ac 2 -c:a pcm_s16le AUDIO/master_audio.wav && python ../_tools/qc.py > PROJECT/qc/qc.log 2>&1 || echo "QC FAILED $e")
done
echo ALLDONE $(date +%T)
