#!/usr/bin/env bash
# bash _tools/finish-sketch.sh <EP folder> <ep0x> [workers]: builds the sketch film, renders, masters to -14 LUFS, runs QC. Run from AUDIRA_IJAZAH_2026.
set -e
ROOT=/f/AUDIRA-VIDEO-MOTION/EXPLAINED/AUDIRA_IJAZAH_2026
EP=$1; NAME=$2; W=${3:-4}
export TEMP='F:\hf-render-tmp' TMP='F:\hf-render-tmp'
cd "$ROOT/$EP"
node "../sketch/$NAME.mjs"
cd PROJECT/HyperFrames_Remotion
npx hyperframes render -o ../raw.mp4 -f ${FPS:-30} -q standard -w "$W" > ../render.log 2>&1
cd "$ROOT/$EP"
python /f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_AI_MOTION/_shared/tools/master.py PROJECT/raw.mp4 FINAL_VIDEO.mp4
ffmpeg -y -loglevel error -i FINAL_VIDEO.mp4 -vn -ar 44100 -ac 2 -c:a pcm_s16le AUDIO/master_audio.wav
ffmpeg -y -loglevel error -i FINAL_VIDEO.mp4 -vf scale=540:960 -c:v libx264 -crf 26 -preset fast -c:a aac -b:a 96k PREVIEW.mp4
python ../_tools/qc.py
d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 FINAL_VIDEO.mp4)
ffmpeg -y -loglevel error -i FINAL_VIDEO.mp4 -vf "fps=24/$d,scale=180:-1,tile=12x2" -frames:v 1 PROJECT/qc/final-sheet.jpg
ls -la FINAL_VIDEO.mp4 PREVIEW.mp4
