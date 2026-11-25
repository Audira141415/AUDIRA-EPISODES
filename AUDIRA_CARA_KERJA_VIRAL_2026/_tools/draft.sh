#!/usr/bin/env bash
# bash draft.sh <EP> [workers]: picture and sound design on an ESTIMATED timeline, no narration. Output is PREVIEW_NO_VO.mp4, never FINAL_VIDEO.mp4.
set -e
R=/f/AUDIRA-VIDEO-MOTION/AUDIRA_CARA_KERJA_VIRAL_2026
cd "$R/$1"
node build-video.mjs | tail -1
python mix.py | tail -1
mkdir -p /f/hf-render-tmp
cd PROJECT/hyperframes
export TEMP='F:\hf-render-tmp' TMP='F:\hf-render-tmp'
npx hyperframes render -o ../raw.mp4 -f 30 -q standard -w "${2:-3}" > ../render.log 2>&1
cd ../..
python /f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_AI_MOTION/_shared/tools/master.py PROJECT/raw.mp4 PREVIEW_NO_VO.mp4
ls -la PREVIEW_NO_VO.mp4
