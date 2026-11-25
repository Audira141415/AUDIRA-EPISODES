#!/usr/bin/env bash
# bash _tools/render.sh <EP> [workers]: build, mix, SRT, render, master. Works in <EP>/project.
# Without <EP>/audio/VO_MASTER.wav it writes draft/PREVIEW.mp4 only and never FINAL_VIDEO.mp4.
set -e
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; SERIES="$(cd "$HERE/.." && pwd)"
EP=$1; W=${2:-4}
mkdir -p /f/hf-render-tmp
cd "$SERIES/$EP/project"
mkdir -p out
node build-video.mjs
python mix.py
python "$HERE/build-srt.py"
cd hf
export TEMP='F:\hf-render-tmp' TMP='F:\hf-render-tmp'
npx hyperframes render -o ../out/raw.mp4 -f ${FPS:-30} -q standard -w "$W" > ../out/render.log 2>&1
cd ..
OUT=../draft/PREVIEW.mp4
[ -f ../audio/VO_MASTER.wav ] && OUT=../FINAL_VIDEO.mp4
python "$HERE/master.py" out/raw.mp4 "$OUT"
ls -la "$OUT"
