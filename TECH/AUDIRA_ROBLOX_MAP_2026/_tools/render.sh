#!/usr/bin/env bash
# bash _tools/render.sh <EP> [workers] : build, mix, render, master. Without AUDIO/VO_MASTER.wav it writes PREVIEW.mp4 only and never FINAL_VIDEO.mp4.
set -e
ROOT=/f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_ROBLOX_MAP_2026
EP=$1; W=${2:-4}
mkdir -p /f/hf-render-tmp
cd "$ROOT/$EP"
node build-video.mjs
python mix.py
python ../_tools/build-srt.py
cd PROJECT/HyperFrames_Remotion
export TEMP='F:\hf-render-tmp' TMP='F:\hf-render-tmp'
npx hyperframes render -o ../raw.mp4 -f ${FPS:-30} -q standard -w "$W" > ../render.log 2>&1
cd "$ROOT/$EP"
OUT=PREVIEW.mp4
[ -f AUDIO/VO_MASTER.wav ] && OUT=FINAL_VIDEO.mp4
python /f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_AI_MOTION/_shared/tools/master.py PROJECT/raw.mp4 "$OUT"
ls -la "$OUT"
