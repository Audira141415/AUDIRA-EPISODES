#!/usr/bin/env bash
# Render all Batch 1 finals sequentially (one GPU): 1080x1920@60, mastered mix laid in at offset 0.
cd "$(dirname "$0")/../studio"
export TEMP=F:/hf-render-tmp TMP=F:/hf-render-tmp
for ep in "$@"; do
  d=$(ls -d ../EP${ep:2}-*); n=${ep:2}; t0=$(date +%s)
  rm -rf out/seg
  node scripts/render-final.mjs --comp=Ep${n}Final --out="$d/FINAL_VIDEO.mp4" --vo=public/audio/$ep/mix.wav --offset=0 --concurrency=8 > "$d/draft/render-final.log" 2>&1 \
    && echo "$ep OK $(( $(date +%s)-t0 ))s" || echo "$ep FAIL (see $d/draft/render-final.log)"
done
