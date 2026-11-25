#!/usr/bin/env bash
# Usage: bash _tools/qa_final.sh EP01 [...]  -> qa-gate (QA_REPORT.md), signature verify, 8-frame check sheet draft/FINAL_CHECK.jpg
cd "$(dirname "$0")/.."
for ep in "$@"; do d=$(ls -d ${ep}_*); f="$d/FINAL_VIDEO.mp4"
  (cd "$d/project" && node scripts/qa-gate.mjs ../FINAL_VIDEO.mp4 --report=../QA_REPORT.md > /dev/null 2>&1); echo "$ep qa: $(grep -m1 'Verdict' "$d/QA_REPORT.md")"
  grep -h "^| \(RED\|YELLOW\)" "$d/QA_REPORT.md"
  (cd "$d/project" && npm run -s verify -- ../FINAL_VIDEO.mp4 2>&1 | grep -iE "valid|tamper|c2pa" | head -2)
  ffprobe -v error -show_entries format=duration:stream=width,height,r_frame_rate,pix_fmt -of csv=p=0 "$f" | head -2 | tr '\n' ' '; echo
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f"); t="$d/draft/_fc"; mkdir -p "$t"; i=0
  for p in 0.01 0.12 0.25 0.4 0.55 0.7 0.85 0.985; do ffmpeg -v error -y -ss $(python -c "print($dur*$p)") -i "$f" -frames:v 1 -vf scale=270:-1 "$t/$i.png"; i=$((i+1)); done
  ffmpeg -v error -y -i "$t/%d.png" -vf tile=8x1 "$d/draft/FINAL_CHECK.jpg"; rm -rf "$t"
done
