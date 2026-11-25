#!/usr/bin/env bash
# Usage (from the series folder): bash _tools/render_finals.sh ep01 ep02 ...
# Remixes audio, then renders each final 1080x1920@60 (jobs 6 x concurrency 2, Vulkan, NVENC; rule 07 / brain 2026-11-10) with the mastered mix at offset 0.
cd "$(dirname "$0")/.."
export TEMP=F:/hf-render-tmp TMP=F:/hf-render-tmp RENDER_TMPDIR=F:/render-tmp
for ep in "$@"; do python _tools/mix.py $ep | tail -1; done
cd studio
for ep in "$@"; do
  d=$(ls -d ../EP${ep:2}_*); n=${ep:2}; t0=$(date +%s)
  rm -rf out/seg/Ep${n}Final-*
  node scripts/render-final.mjs --comp=Ep${n}Final --out="$d/FINAL_VIDEO.mp4" --vo=public/audio/$ep/mix.wav --offset=0 --jobs=6 --concurrency=2 --gl=vulkan --encoder=nvenc --log=error > "$d/draft/render-final.log" 2>&1     && echo "$ep OK $(( $(date +%s)-t0 ))s" || echo "$ep FAIL (see $d/draft/render-final.log)"
done
echo ALLDONE
