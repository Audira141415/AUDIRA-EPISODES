#!/usr/bin/env bash
# bash _tools/finish-ep.sh <EP>: run once Cartesia credits are back. Voices the script, locks the timeline to real audio, then renders and QC-checks the final.
set -e
R=/f/AUDIRA-VIDEO-MOTION/EXPLAINED/karhutla-gambut-2026
cd /f/AUDIRA-VIDEO-MOTION
python karhutla-gambut-2026/_tools/vo.py "$1" tts --speed 1.0
python karhutla-gambut-2026/_tools/vo.py "$1" build --tempo 1.0
bash "$R/_tools/final.sh" "$1" 3
