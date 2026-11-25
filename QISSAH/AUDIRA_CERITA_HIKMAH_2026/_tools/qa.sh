#!/usr/bin/env bash
# QA one final: copy to episode folder, probe, loudness, black frames, 8-frame contact sheet (~1200 px wide).
# usage (from series root): bash _tools/qa.sh ep05 EP05_KURA_KALAJENGKING
set -e
ep=$1; dir=$2; src=studio/out/$ep/FINAL_VIDEO.mp4; dst=$dir/FINAL_VIDEO.mp4
cp "$src" "$dst"
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate:format=duration -of compact "$dst" > $dir/.qa_probe.txt
ffmpeg -nostats -i "$dst" -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2 > $dir/.qa_loud.txt
ffmpeg -nostats -i "$dst" -vf blackdetect=d=0.5:pix_th=0.05 -an -f null - 2>&1 | grep -c black_start > $dir/.qa_black.txt || true
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$dst")
rm -rf $dir/.qaf && mkdir -p $dir/.qaf
for i in 0 1 2 3 4 5 6 7; do t=$(python -c "print(round($dur*($i*0.135+0.02),2))"); ffmpeg -v error -ss $t -i "$dst" -frames:v 1 -vf scale=300:-1 $dir/.qaf/f$i.png; done
ffmpeg -v error -y -i $dir/.qaf/f%d.png -vf tile=8x1 -frames:v 1 $dir/QA_SHEET.jpg 2>/dev/null || ffmpeg -v error -y -pattern_type sequence -start_number 0 -i $dir/.qaf/f%d.png -vf tile=8x1 -frames:v 1 $dir/QA_SHEET.jpg
rm -rf $dir/.qaf
echo "$dir"; cat $dir/.qa_probe.txt $dir/.qa_loud.txt; echo "black segments: $(cat $dir/.qa_black.txt)"
