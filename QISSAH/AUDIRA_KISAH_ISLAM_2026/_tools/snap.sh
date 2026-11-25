#!/usr/bin/env bash
# bash snap.sh <EP> <times>: rebuilds and prints the contact sheet paths.
cd /f/AUDIRA-VIDEO-MOTION/AUDIRA_KISAH_ISLAM_2026/$1 && node build-video.mjs && cd PROJECT/HyperFrames_Remotion && export TEMP='F:\hf-render-tmp' TMP='F:\hf-render-tmp'; npx hyperframes snapshot --no-end --at "$2" 2>&1 | grep -E "contact-sheet|rror" | cut -c1-220
