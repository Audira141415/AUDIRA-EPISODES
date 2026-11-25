#!/usr/bin/env bash
# Usage (from BATCH01): bash _tools/mux_preview.sh ep036 -> <EP>/draft/PREVIEW.mp4 (silent preview + mastered mix)
set -e; ep=$1; d=$(ls -d EP${ep:2}-*)
python _tools/mix.py $ep
ffmpeg -y -loglevel error -i "$d/draft/PREVIEW_silent.mp4" -i "studio/public/audio/$ep/mix.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest "$d/draft/PREVIEW.mp4"
ffprobe -v error -show_entries stream=codec_type,width,height,r_frame_rate:format=duration -of compact "$d/draft/PREVIEW.mp4"
