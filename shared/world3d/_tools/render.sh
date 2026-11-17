#!/usr/bin/env bash
# bash _tools/render.sh <EP> [workers]: build, mix, SRT, then a PREVIEW render to <EP>/draft/PREVIEW.mp4. Works in <EP>/project.
# Preview only. It never writes FINAL_VIDEO.mp4: the final goes through audira_render_batch (project <EP>/project/hf,
# 60 fps, master + metadata + signature), after the draft gate (look.json PASS + blind jury PASS + user approval).
# Rule 07: do not run this by hand before the draft gate passes.
set -e
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; SERIES="$(cd "$HERE/.." && pwd)"
EP=$1; W=${2:-4}
mkdir -p /f/hf-render-tmp
cd "$SERIES/$EP/project"
mkdir -p out ../draft
node build-video.mjs
python mix.py
python "$HERE/build-srt.py"
cd hf
export TEMP='F:\hf-render-tmp' TMP='F:\hf-render-tmp'
npx hyperframes render -o ../out/raw.mp4 -f ${FPS:-30} -q standard -w "$W" > ../out/render.log 2>&1
cd ..
OUT=../draft/PREVIEW.mp4
python "$HERE/master.py" out/raw.mp4 "$OUT"
ls -la "$OUT"
