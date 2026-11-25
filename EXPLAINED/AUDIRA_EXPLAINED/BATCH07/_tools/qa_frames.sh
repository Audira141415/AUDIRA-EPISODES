#!/usr/bin/env bash
# Usage (from BATCH07): bash _tools/qa_frames.sh ep060 [...] -> EPxxx/qa/final_frames.jpg (8 frames) + blackdetect count
for ep in "$@"; do
  d=$(ls -d EP${ep:2}-*); f="$d/FINAL_VIDEO.mp4"; mkdir -p "$d/qa"
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
  ffmpeg -v error -y -i "$f" -vf "fps=8/$dur,scale=270:-1,tile=8x1" -frames:v 1 "$d/qa/final_frames.jpg"
  nb=$(ffmpeg -nostats -i "$f" -vf blackdetect=d=0.5:pix_th=0.05 -an -f null - 2>&1 | grep -c black_start)
  echo "$ep frames ok, black segments: $nb"
done
