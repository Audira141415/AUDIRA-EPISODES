#!/usr/bin/env bash
# bash _tools/draft-sketch.sh <EP folder> <ep0x> [workers]: silent draft from the estimated timeline (no voice yet).
# Writes DRAFT_SILENT.mp4 and PROJECT/qc/draft-sheet.jpg. Run from AUDIRA_IJAZAH_2026.
set -e
ROOT=/f/AUDIRA-VIDEO-MOTION/EXPLAINED/AUDIRA_IJAZAH_2026
EP=$1; NAME=$2; W=${3:-4}
export TEMP='F:\hf-render-tmp' TMP='F:\hf-render-tmp'
mkdir -p /f/hf-render-tmp
cd "$ROOT/$EP"
mkdir -p AUDIO PROJECT/qc
d=$(python -c "import json;print(json.load(open('timeline.json'))['duration'])")
ffmpeg -y -loglevel error -f lavfi -i anullsrc=r=44100:cl=stereo -t "$d" AUDIO/mix.wav
node "../sketch/$NAME.mjs"
cd PROJECT/HyperFrames_Remotion
npx hyperframes render -o ../draft.mp4 -f 30 -q draft -w "$W" > ../render.log 2>&1
cd "$ROOT/$EP"
cp PROJECT/draft.mp4 DRAFT_SILENT.mp4
d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 DRAFT_SILENT.mp4)
ffmpeg -y -loglevel error -i DRAFT_SILENT.mp4 -vf "fps=24/$d,scale=180:-1,tile=12x2" -frames:v 1 PROJECT/qc/draft-sheet.jpg
ffprobe -v error -show_entries stream=width,height,r_frame_rate -show_entries format=duration -of csv=p=0 DRAFT_SILENT.mp4
