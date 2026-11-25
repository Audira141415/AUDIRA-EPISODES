#!/usr/bin/env bash
# bash _tools/snap.sh <EP> <times>: rebuilds the episode and prints the contact-sheet path.
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; SERIES="$(cd "$HERE/.." && pwd)"
mkdir -p /f/hf-render-tmp
cd "$SERIES/$1/project" && node build-video.mjs && cd hf && export TEMP='F:\hf-render-tmp' TMP='F:\hf-render-tmp'; npx hyperframes snapshot --no-end --at "$2" 2>&1 | grep -E "contact-sheet|rror" | cut -c1-220
