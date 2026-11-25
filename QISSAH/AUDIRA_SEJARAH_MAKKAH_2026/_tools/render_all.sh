#!/usr/bin/env bash
# Usage (from anywhere): bash _tools/render_all.sh EP01 EP02 ...
# Renders each episode's long-form master (1920x1080@30) and both shorts (1080x1920@60) one at a time,
# with the mixed audio; render-final masters to -14 LUFS / TP -1. Logs go to <EP>/draft/render-*.log.
cd "$(dirname "$0")/.."
export RENDER_TMPDIR=F:/render-tmp
declare -A NAME=([EP01]=Kabah [EP02]=Haram [EP03]=Zamzam [EP04]=Kiswah [EP05]=Makkah)
for ep in "$@"; do
  d=$(ls -d ${ep}_*); n=${NAME[$ep]}
  for job in ${JOBS:-"Wide:FINAL_LONG.mp4:full.wav:6:2" "Short01:FINAL_SHORT_01.mp4:short01_full.wav:6:2" "Short02:FINAL_SHORT_02.mp4:short02_full.wav:6:2"}; do
    IFS=: read c o a j k <<< "$job"; t0=$(date +%s)
    (cd "$d/project" && rm -rf out/seg && node scripts/render-final.mjs --comp=${n}${c}Final --out="../$o" --vo=public/audio/$a \
      --jobs=$j --concurrency=$k --gl=vulkan --encoder=nvenc > "../draft/render-$c.log" 2>&1) \
      && echo "$ep $c OK $(( $(date +%s)-t0 ))s" || echo "$ep $c FAIL (see $d/draft/render-$c.log)"
  done
done
echo ALLDONE
