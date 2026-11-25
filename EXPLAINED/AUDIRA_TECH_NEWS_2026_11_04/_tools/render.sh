#!/usr/bin/env bash
# Usage: bash render.sh <EP folder> [workers]. Runs from anywhere. Temp frames stay on F: because C: is full.
set -e
ROOT=/f/AUDIRA-VIDEO-MOTION/EXPLAINED/AUDIRA_TECH_NEWS_2026_11_04
EP=$1; W=${2:-4}
cd "$ROOT/$EP/PROJECT/hyperframes"
export TEMP='F:\hf-render-tmp' TMP='F:\hf-render-tmp'
npx hyperframes render -o ../raw.mp4 -f 30 -q standard -w "$W" > ../render.log 2>&1
cd "$ROOT/$EP"
python /f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_AI_MOTION/_shared/tools/master.py PROJECT/raw.mp4 FINAL_VIDEO.mp4
ffmpeg -y -loglevel error -i FINAL_VIDEO.mp4 -vn -ar 44100 -ac 2 -c:a pcm_s16le AUDIO/master_audio.wav
ffmpeg -y -loglevel error -i FINAL_VIDEO.mp4 -vf scale=540:960 -c:v libx264 -crf 28 -preset fast -c:a aac -b:a 96k PREVIEW.mp4
ls -la FINAL_VIDEO.mp4 PREVIEW.mp4 AUDIO/master_audio.wav
