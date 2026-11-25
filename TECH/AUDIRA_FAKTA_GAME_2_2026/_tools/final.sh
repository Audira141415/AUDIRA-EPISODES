#!/usr/bin/env bash
# bash _tools/final.sh [EP folders]: one final render at 60 fps, QC, ownership metadata. Needs AUDIO/VO_MASTER.wav.
ROOT=/f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_FAKTA_GAME_2_2026
EPS=${@:-EP01_KONAMI_CODE EP02_KUBURAN_ET EP03_NAMA_MARIO EP04_NINTENDO_1889 EP05_TETRIS}
for e in $EPS; do
  echo "== $e $(date +%T)"
  cd "$ROOT"
  FPS=60 bash _tools/render.sh "$e" 6 || { echo "FAILED $e"; continue; }
  cd "$ROOT/$e"
  ffmpeg -y -loglevel error -i FINAL_VIDEO.mp4 -vn -ar 44100 -ac 2 -c:a pcm_s16le AUDIO/master_audio.wav && mkdir -p PROJECT/qc && python ../_tools/qc.py > PROJECT/qc/qc.log 2>&1
  TITLE=$(python -c "import json;print(json.load(open('STATUS.json',encoding='utf8'))['topic'])")
  ffmpeg -y -loglevel error -i FINAL_VIDEO.mp4 -c copy -map_metadata -1 -metadata title="$TITLE" -metadata artist="AUDIRA (Agus Dwi R.)" -metadata copyright="© 2026 AUDIRA - Agus Dwi R. All rights reserved." -metadata comment="AUDIRA-fakta-game-2-$e | audira.my.id" -metadata date="2026-11-08" -movflags +faststart+use_metadata_tags FINAL_tagged.mp4 && mv -f FINAL_tagged.mp4 FINAL_VIDEO.mp4
  cp -f SUBTITLES/SUBTITLE.srt SUBTITLES.srt 2>/dev/null
  echo "done $e"
done
echo ALLDONE $(date +%T)
