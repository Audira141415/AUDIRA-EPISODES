#!/usr/bin/env bash
# bash _tools/final.sh [EP folders]: one final render at 60 fps, QC, ownership metadata. Needs <EP>/audio/VO_MASTER.wav.
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; SERIES="$(cd "$HERE/.." && pwd)"
EPS=${@:-$(cd "$SERIES" && ls -d EP0*)}
for e in $EPS; do
  echo "== $e $(date +%T)"
  FPS=60 bash "$HERE/render.sh" "$e" 6 || { echo "FAILED $e"; continue; }
  cd "$SERIES/$e/project"
  mkdir -p out/qc
  ffmpeg -y -loglevel error -i ../FINAL_VIDEO.mp4 -vn -ar 44100 -ac 2 -c:a pcm_s16le ../audio/master_audio.wav && python "$HERE/qc.py" > out/qc/qc.log 2>&1
  cd "$SERIES/$e"
  TITLE=$(python -c "import json;print(json.load(open('STATUS.json',encoding='utf8'))['data'].get('title','$e'))")
  ffmpeg -y -loglevel error -i FINAL_VIDEO.mp4 -c copy -map_metadata -1 -metadata title="$TITLE" -metadata artist="AUDIRA (Agus Dwi R.)" -metadata copyright="© 2026 AUDIRA - Agus Dwi R. All rights reserved." -metadata comment="AUDIRA-cara-kerja-benda-$e | audira.my.id" -metadata date="$(date +%F)" -movflags +faststart+use_metadata_tags FINAL_tagged.mp4 && mv -f FINAL_tagged.mp4 FINAL_VIDEO.mp4
  echo "done $e"
done
echo ALLDONE $(date +%T)
