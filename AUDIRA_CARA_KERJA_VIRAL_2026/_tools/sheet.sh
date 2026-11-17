#!/usr/bin/env bash
# NOTE: this legacy sheet.sh tiles from an existing FINAL MP4, not from live snapshots.
# For the draft gate, use shared/world3d/_tools/sheet.sh instead (builds from HyperFrames snapshots, no MP4 needed).
# bash sheet.sh <EP> [cols]: contact sheet of FINAL_VIDEO.mp4 at one frame per n seconds, written to PROJECT/qc/sheet.jpg
R=/f/AUDIRA-VIDEO-MOTION/AUDIRA_CARA_KERJA_VIRAL_2026
cd "$R/$1" || exit 1
F=${3:-FINAL_VIDEO.mp4}
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$F")
ROWS=3
COLS=${2:-8}
N=$((ROWS * COLS))
FPS=$(python -c "print($N/$D)")
ffmpeg -y -loglevel error -i "$F" -vf "fps=$FPS,scale=270:-1,tile=${COLS}x${ROWS}:padding=4" -frames:v 1 -q:v 3 PROJECT/qc/sheet.jpg
echo "F:/AUDIRA-VIDEO-MOTION/AUDIRA_CARA_KERJA_VIRAL_2026/$1/PROJECT/qc/sheet.jpg"
