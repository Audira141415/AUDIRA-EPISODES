#!/usr/bin/env bash
# bash _tools/sheet.sh <EP>: rebuild (no TTS), mix, then the 9-frame draft/contact-sheet.jpg (hook, mid s2-s8, outro). No MP4.
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; SERIES="$(cd "$HERE/.." && pwd)"
e="$1"; mkdir -p /f/hf-render-tmp
cd "$SERIES/$e/project" && node build-video.mjs && python mix.py || exit 1
T=$(python -c "import json;T=json.load(open('timeline.json'));S=T['scenes'];v=[min(S[0]['end']-0.3,S[0]['start']+3.5)]+[(s['start']+s['end'])/2 for s in S[1:]];v=v[:8]+[T['speech_end']+1.2];print(','.join(f'{x:.2f}' for x in v))")
echo "snap $T"
cd hf
export TEMP='F:\hf-render-tmp' TMP='F:\hf-render-tmp'
SHEET=$(npx hyperframes snapshot --no-end --at "$T" 2>&1 | grep -o '[^ ]*contact-sheet[^ ]*\.jpg' | head -1)
cd "$SERIES/$e"; mkdir -p draft
if [ -n "$SHEET" ]; then python -c "
from PIL import Image;im=Image.open(r'''$SHEET''');r=1200/im.width;im.resize((1200,int(im.height*r))).convert('RGB').save('draft/contact-sheet.jpg',quality=85)"; echo "sheet ok $e/draft/contact-sheet.jpg"; else echo "NO SHEET for $e"; exit 1; fi
