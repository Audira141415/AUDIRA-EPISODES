#!/usr/bin/env bash
# Usage (from anywhere): bash _tools/finalize.sh EP01 [...]
# For each finished episode: write ownership metadata into FINAL_LONG / FINAL_SHORT_01 / FINAL_SHORT_02,
# run qa-gate on each (QA_REPORT_*.md), tile 8 frames of each MP4 into draft/FINAL_CHECK_*.jpg,
# and archive the source (scenes, brand, Root.tsx, voice, mixes) under archive/<date>/.
cd "$(dirname "$0")/.."
today=$(date +%F); year=$(date +%Y)
declare -A TITLE=(
 [EP01]="Ka'bah Dibangun Ulang Berkali-kali | Sejarah Makkah EP01"
 [EP02]="Masjidil Haram Terus Meluas | Sejarah Makkah EP02"
 [EP03]="Rahasia Sumur Zamzam | Sejarah Makkah EP03"
 [EP04]="Kiswah, Kain Penutup Ka'bah | Sejarah Makkah EP04"
 [EP05]="Makkah Dulu dan Kini | Sejarah Makkah EP05")
for ep in "$@"; do
  d=$(ls -d ${ep}_*); n=${ep#EP}
  for f in FINAL_LONG FINAL_SHORT_01 FINAL_SHORT_02; do
    src="$d/$f.mp4"; [ -f "$src" ] || { echo "$ep $f MISSING"; continue; }
    kind=${f#FINAL_}; t="${TITLE[$ep]}"; [ $kind = LONG ] || t="$t (Short ${kind#SHORT_})"
    ffmpeg -v error -y -i "$src" -c copy -map_metadata -1 -metadata title="$t" -metadata artist="AUDIRA (Agus Dwi R.)" \
      -metadata copyright="© $year AUDIRA - Agus Dwi R. All rights reserved." -metadata comment="AUDIRA-sejarah-makkah-EP$n-$kind | audira.my.id" \
      -metadata date="$today" -movflags +faststart+use_metadata_tags "$d/${f}_tagged.mp4" && mv -f "$d/${f}_tagged.mp4" "$src"
    w=""; [ $kind = LONG ] && w="--wide"
    (cd "$d/project" && node scripts/qa-gate.mjs "../$f.mp4" $w --report="../QA_REPORT_$kind.md" > /dev/null 2>&1); echo "$ep $f qa exit $?: $(grep -m1 -iE 'verdict|hasil|result|status' "$d/QA_REPORT_$kind.md" | head -c 160)"
    dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$src")
    tmp="$d/draft/_fc"; mkdir -p "$tmp"; i=0
    for p in 0.02 0.12 0.25 0.4 0.55 0.7 0.85 0.985; do
      ffmpeg -v error -y -ss $(python -c "print($dur*$p)") -i "$src" -frames:v 1 -vf scale=$([ $kind = LONG ] && echo 480:-1 || echo 270:-1) "$tmp/$i.png"; i=$((i+1))
    done
    ffmpeg -v error -y -i "$tmp/%d.png" -vf tile=$([ $kind = LONG ] && echo 4x2 || echo 8x1) "$d/draft/FINAL_CHECK_$kind.jpg"; rm -rf "$tmp"
  done
  a="$d/archive/$today"; mkdir -p "$a"
  cp "$d/audio/vo.wav" "$a/vo.wav"; cp "$d/project/public/audio/"{full,short01_full,short02_full}.wav "$a/"
  tar -cf "$a/project-src.tar" -C "$d/project" src/scenes src/brand src/Root.tsx public/brand
  ffprobe -v error -show_entries format_tags=title,artist,comment -of default=nw=1 "$d/FINAL_LONG.mp4" | head -3
done
