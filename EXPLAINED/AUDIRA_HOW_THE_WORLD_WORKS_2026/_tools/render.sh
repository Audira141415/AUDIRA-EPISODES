#!/usr/bin/env bash
# Usage: bash render.sh <EP folder> [workers]. Temp frames stay on F: because C: is full.
set -e
ROOT=/f/AUDIRA-VIDEO-MOTION/EXPLAINED/AUDIRA_HOW_THE_WORLD_WORKS_2026
EP=$1; W=${2:-4}
mkdir -p /f/hf-render-tmp
cd "$ROOT/$EP/PROJECT/hyperframes"
export TEMP='F:\hf-render-tmp' TMP='F:\hf-render-tmp'
npx hyperframes render -o ../raw.mp4 -f 30 -q standard -w "$W" > ../render.log 2>&1
cd "$ROOT/$EP"
python /f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_AI_MOTION/_shared/tools/master.py PROJECT/raw.mp4 FINAL_VIDEO.mp4
ffmpeg -y -loglevel error -i FINAL_VIDEO.mp4 -vn -ar 44100 -ac 2 -c:a pcm_s16le AUDIO/master_audio.wav
ls -la FINAL_VIDEO.mp4 AUDIO/master_audio.wav
