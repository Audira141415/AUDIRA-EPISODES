#!/usr/bin/env bash
# bash final.sh <EP> [workers]: rebuild comp, mix, SRT, render, master, QC.
set -e
R=/f/AUDIRA-VIDEO-MOTION/EXPLAINED/AUDIRA_HOW_THE_WORLD_WORKS_2026
cd "$R/$1"
node build-video.mjs | tail -1
python mix.py | tail -2
python ../_tools/build-srt.py
bash ../_tools/render.sh "$1" "${2:-3}"
python ../_tools/qc.py > /dev/null
python ../_tools/qc-line.py
