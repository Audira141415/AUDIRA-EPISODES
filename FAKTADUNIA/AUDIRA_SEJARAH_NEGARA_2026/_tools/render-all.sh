#!/usr/bin/env bash
# Renders every episode, then measures it. render.sh names the output FINAL_VIDEO.mp4 once AUDIO/VO_MASTER.wav exists.
cd /f/AUDIRA-VIDEO-MOTION/FAKTADUNIA/AUDIRA_SEJARAH_NEGARA_2026
for e in EP01_ZANZIBAR_38_MENIT EP02_PERANG_EMU_AUSTRALIA EP03_DAGEN_H_SWEDIA EP04_ALASKA_DIJUAL_RUSIA EP05_BOLIVIA_ANGKATAN_LAUT; do
  echo "== $e $(date +%T)"
  bash _tools/render.sh $e 4 || { echo "FAILED $e"; continue; }
  (cd $e && ffmpeg -y -loglevel error -i FINAL_VIDEO.mp4 -vn -ar 44100 -ac 2 -c:a pcm_s16le AUDIO/master_audio.wav && python ../_tools/qc.py > PROJECT/qc/qc.log 2>&1 || echo "QC FAILED $e")
done
echo ALLDONE $(date +%T)
