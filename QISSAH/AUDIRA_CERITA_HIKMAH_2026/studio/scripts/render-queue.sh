#!/usr/bin/env bash
# Render finals one after another (they share out/seg). usage: bash scripts/render-queue.sh ep03 ep02 ...
export TEMP='F:\hf-render-tmp' TMP='F:\hf-render-tmp'
for e in "$@"; do
  E=${e^}; rm -rf out/seg; mkdir -p out/$e
  node scripts/render-final.mjs --comp=${E}Final --out=out/$e/FINAL_VIDEO.mp4 --vo=public/audio/$e/full.wav --offset=0 --concurrency=8 > out/$e/final.log 2>&1 && echo "$e ok" || echo "$e FAILED"
done
