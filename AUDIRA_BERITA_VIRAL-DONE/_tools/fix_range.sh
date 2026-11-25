#!/usr/bin/env bash
# Usage (from anywhere): bash _tools/fix_range.sh EP01 [...]
# NVENC finals come out as yuvj420p (full range), which qa-gate rejects and some players show washed out.
# Re-encode the picture to limited-range yuv420p (NVENC cq 18), copy the audio, keep the metadata, refresh the archive copy.
cd "$(dirname "$0")/.."
for ep in "$@"; do d=$(ls -d ${ep}_*); s="$d/FINAL_VIDEO.mp4"
  [ "$(ffprobe -v error -select_streams v -show_entries stream=pix_fmt -of default=nw=1:nk=1 "$s" | head -1)" = yuvj420p ] || { echo "$ep already ok"; continue; }
  ffmpeg -v error -y -i "$s" -map 0 -map_metadata 0 -vf "scale=in_range=full:out_range=tv,format=yuv420p" -color_range tv \
    -c:v h264_nvenc -preset p5 -tune hq -rc vbr -cq 18 -b:v 0 -profile:v high -c:a copy -movflags +faststart+use_metadata_tags "$d/FINAL_fix.mp4" \
    && mv -f "$d/FINAL_fix.mp4" "$s" && for a in "$d"/archive/*/; do cp -f "$s" "$a"; done \
    && echo "$ep -> $(ffprobe -v error -select_streams v -show_entries stream=pix_fmt,color_range -of csv=p=0 "$s") $(du -m "$s" | cut -f1) MB"
done
