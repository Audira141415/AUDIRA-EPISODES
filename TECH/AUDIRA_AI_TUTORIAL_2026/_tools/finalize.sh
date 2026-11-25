#!/usr/bin/env bash
# Usage (from BATCH02): bash _tools/finalize.sh ep042 "<judul>"  -> tags FINAL_VIDEO.mp4 with ownership metadata, archives master.
set -e; ep=$1; title=$2; d=$(ls -d EP${ep:2}_*); slug=${d#EP??_}; today=$(date +%F)
ffmpeg -v error -y -i "$d/FINAL_VIDEO.mp4" -c copy -map_metadata -1 -metadata title="$title" -metadata artist="AUDIRA (Agus Dwi R.)" \
  -metadata copyright="© $(date +%Y) AUDIRA - Agus Dwi R. All rights reserved." -metadata comment="AUDIRA-$slug-AIT-${ep:2} | audira.my.id" \
  -metadata date="$today" -movflags +faststart+use_metadata_tags "$d/FINAL_tagged.mp4"
mv -f "$d/FINAL_tagged.mp4" "$d/FINAL_VIDEO.mp4"
a="$d/archive/$today"; mkdir -p "$a"; cp "$d/FINAL_VIDEO.mp4" "$a/"; cp studio/public/audio/$ep/vo.wav "$a/vo.wav"; cp studio/public/audio/$ep/mix.wav "$a/mix.wav"
tar -cf "$a/project-$ep.tar" -C studio/src/scenes $ep _shared -C .. Root.tsx brand 2>/dev/null || tar -cf "$a/project-$ep.tar" -C studio/src scenes/$ep scenes/_shared Root.tsx brand
ffprobe -v error -show_entries format_tags=title,artist,copyright,comment,date -of default=nw=1 "$d/FINAL_VIDEO.mp4"
