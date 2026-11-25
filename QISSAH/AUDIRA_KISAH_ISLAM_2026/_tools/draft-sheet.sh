#!/usr/bin/env bash
# bash _tools/draft-sheet.sh <EP> "2,15,..." : snapshots key frames and writes <EP>/PROJECT/qc/draft-sheet.jpg (1200 px wide) for review without rendering a film.
set -e
ROOT=/f/AUDIRA-VIDEO-MOTION/AUDIRA_KISAH_ISLAM_2026
P=$(bash "$ROOT/_tools/snap.sh" "$1" "$2" 2>&1 | grep -o "F:.*contact-sheet[^ ]*\.jpg" | head -1)
mkdir -p "$ROOT/$1/PROJECT/qc"
ffmpeg -y -loglevel error -i "$P" -vf scale=1200:-1 "$ROOT/$1/PROJECT/qc/draft-sheet.jpg"
echo "$ROOT/$1/PROJECT/qc/draft-sheet.jpg"
