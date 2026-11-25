#!/usr/bin/env bash
# QA + ownership metadata for one 16:9 final. usage (from series root):
#   bash _tools/qa16.sh ep08 EP08_KOPI_ASIN "Mata Cinta Kopi Asin"
# Copies studio_16x9/out/epXX/FINAL_VIDEO.mp4 into the episode folder with AUDIRA metadata (stream copy),
# then probes format, loudness, black frames and writes an 8-frame QA_SHEET.jpg (4x2, 1200 px wide).
set -e
ep=$1; dir=$2; title=$3; src=studio_16x9/out/$ep/FINAL_VIDEO.mp4; dst=$dir/FINAL_VIDEO.mp4
n=${ep#ep}
ffmpeg -v error -y -i "$src" -c copy -map_metadata -1 \
  -metadata title="Cerita Hikmah: $title" -metadata artist="AUDIRA (Agus Dwi R.)" \
  -metadata copyright="© 2026 AUDIRA - Agus Dwi R. All rights reserved." \
  -metadata comment="AUDIRA-cerita-hikmah-EP$n | audira.my.id" -metadata date="2026-11-10" \
  -movflags +faststart+use_metadata_tags "$dst"
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate:format=duration:format_tags=artist,copyright,comment -of compact "$dst"
ffmpeg -nostats -i "$dst" -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
echo "black segments: $(ffmpeg -nostats -i "$dst" -vf blackdetect=d=0.5:pix_th=0.05 -an -f null - 2>&1 | grep -c black_start || true)"
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$dst" | tr -d '\r')
tmp=$dir/.qaf; rm -rf $tmp; mkdir -p $tmp
for i in 0 1 2 3 4 5 6 7; do t=$(python -c "print(round($dur*($i*0.135+0.02),2))"); ffmpeg -v error -ss $t -i "$dst" -frames:v 1 -vf scale=300:-1 $tmp/f$i.png; done
ffmpeg -v error -y -i $tmp/f%d.png -vf tile=4x2 -frames:v 1 $dir/QA_SHEET.jpg
rm -rf $tmp; echo "$dir ok"
