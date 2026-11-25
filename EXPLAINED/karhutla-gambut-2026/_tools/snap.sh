#!/usr/bin/env bash
# bash snap.sh <EP> <times>: rebuilds and prints the newest contact sheet path.
cd /f/AUDIRA-VIDEO-MOTION/EXPLAINED/karhutla-gambut-2026/$1 && node build-video.mjs | tail -1 && cd PROJECT/hyperframes && export TEMP='F:\hf-render-tmp' TMP='F:\hf-render-tmp'; npx hyperframes snapshot --no-end --at "$2" 2>&1 | grep -E "contact-sheet|Error|rror:" | sed 's/ (grid.*//' | cut -c1-260
