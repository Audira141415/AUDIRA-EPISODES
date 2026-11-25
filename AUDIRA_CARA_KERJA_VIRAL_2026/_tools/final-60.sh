#!/usr/bin/env bash
# bash _tools/final-60.sh [EP folders]: after the draft gate. Rebuild, mix, SRT, one 60 fps render, master (-14 LUFS), QC, ownership metadata.
ROOT=/f/AUDIRA-VIDEO-MOTION/AUDIRA_CARA_KERJA_VIRAL_2026
EPS=${@:-EP11_KOTAK_HITAM EP12_GO_AROUND_ANGIN EP13_LIDAR_AMAZON EP14_MOBIL_LISTRIK_500 EP15_DBS_PACU_OTAK}
for e in $EPS; do
  echo "== $e $(date +%T)"
  cd "$ROOT/$e"
  mkdir -p SUBTITLES PROJECT/qc
  node build-video.mjs | tail -1 && python mix.py | tail -1 && python ../_tools/build-srt.py || { echo "BUILD FAILED $e"; continue; }
  cd "$ROOT"
  FPS=60 bash _tools/render.sh "$e" 6 || { echo "RENDER FAILED $e"; continue; }
  cd "$ROOT/$e"
  python ../_tools/qc.py > PROJECT/qc/qc.log 2>&1 || echo "QC FAILED $e"
  TITLE=$(python -c "import json;print(json.load(open('STATUS.json',encoding='utf8'))['topic'])")
  ffmpeg -y -loglevel error -i FINAL_VIDEO.mp4 -c copy -map_metadata -1 -metadata title="$TITLE" -metadata artist="AUDIRA (Agus Dwi R.)" -metadata copyright="© 2026 AUDIRA - Agus Dwi R. All rights reserved." -metadata comment="AUDIRA-cara-kerja-viral-$e | audira.my.id" -metadata date="${DATE:-2026-11-08}" -movflags +faststart+use_metadata_tags FINAL_tagged.mp4 && mv -f FINAL_tagged.mp4 FINAL_VIDEO.mp4
  cp -f SUBTITLES/subtitles.srt SUBTITLES.srt 2>/dev/null
  echo "done $e $(date +%T)"
done
echo ALLDONE $(date +%T)
