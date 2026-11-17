#!/usr/bin/env bash
# bash _tools/final.sh [EP folders]: prepare and check finals. It never renders.
# Before the render: build-video.mjs, mix.py and SUBTITLES.srt for each episode (needs <EP>/audio/VO_MASTER.wav).
# The final itself is rendered only by audira_render_batch (project <EP>/project/hf, 60 fps, -14 LUFS master,
# metadata + signature). Run this again after the batch: when <EP>/FINAL_VIDEO.mp4 exists it runs qc.py into
# <EP>/project/out/qc/ (qc.log + metrics.json).
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; SERIES="$(cd "$HERE/.." && pwd)"
EPS=${@:-$(cd "$SERIES" && ls -d EP0*)}
for e in $EPS; do
  echo "== $e $(date +%T)"
  [ -f "$SERIES/$e/audio/VO_MASTER.wav" ] || { echo "SKIP $e: no audio/VO_MASTER.wav (VO not locked)"; continue; }
  cd "$SERIES/$e/project" || { echo "FAILED $e"; continue; }
  if [ -f ../FINAL_VIDEO.mp4 ]; then
    mkdir -p out/qc
    ffmpeg -y -loglevel error -i ../FINAL_VIDEO.mp4 -vn -ar 44100 -ac 2 -c:a pcm_s16le ../audio/master_audio.wav && python "$HERE/qc.py" > out/qc/qc.log 2>&1 && echo "qc $e: out/qc/qc.log" || echo "QC FAILED $e"
  else
    { node build-video.mjs && python mix.py && python "$HERE/build-srt.py"; } || { echo "FAILED $e"; continue; }
    echo "ready $e: render with audira_render_batch (project $e/project/hf, 60 fps, title/slug/ep), then run final.sh $e again for QC"
  fi
done
echo ALLDONE $(date +%T)
