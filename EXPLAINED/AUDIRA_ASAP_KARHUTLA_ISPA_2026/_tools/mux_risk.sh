#!/usr/bin/env bash
# Usage (from the series folder): bash _tools/mux_risk.sh ep01 30.5 -> <EP>/draft/RISK_CLIP.mp4 (risk clip + matching slice of the mastered mix)
set -e; ep=$1; st=$2; d=$(ls -d EP${ep:2}_*)
python _tools/mix.py $ep
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$d/draft/RISK_CLIP_silent.mp4")
ffmpeg -y -loglevel error -i "$d/draft/RISK_CLIP_silent.mp4" -ss $st -t $dur -i "studio/public/audio/$ep/mix.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest "$d/draft/RISK_CLIP.mp4"
echo "$ep risk clip $st s + $dur s ok"
