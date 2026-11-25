#!/usr/bin/env bash
# After the cover + script gate: bash _tools/voice-draft.sh [EP folders]
# Cartesia voice, word lock, rebuild on real timing, mix, SRT, then an 8-frame contact sheet in draft/. No MP4.
set -e
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; SERIES="$(cd "$HERE/.." && pwd)"
EPS=${@:-$(cd "$SERIES" && ls -d EP0*)}
mkdir -p /f/hf-render-tmp
for e in $EPS; do
  echo "== $e $(date +%T)"
  python "$HERE/vo.py" "$e" tts --speed 1.0
  python "$HERE/vo.py" "$e" build --tempo 1.0
  cd "$SERIES/$e/project"
  node build-video.mjs
  python mix.py
  python "$HERE/build-srt.py"
  # hook, the middle of scenes 2-8, outro
  T=$(python -c "import json;T=json.load(open('timeline.json'));S=T['scenes'];v=[min(S[0]['end']-0.3,S[0]['start']+3.5)]+[(s['start']+s['end'])/2 for s in S[1:]];v=v[:8]+[T['speech_end']+1.2];print(','.join(f'{x:.2f}' for x in v))")
  echo "snap $T"
  cd hf
  export TEMP='F:\hf-render-tmp' TMP='F:\hf-render-tmp'
  SHEET=$(npx hyperframes snapshot --no-end --at "$T" 2>&1 | grep -o '[^ ]*contact-sheet[^ ]*\.jpg' | head -1)
  cd "$SERIES/$e"
  mkdir -p draft
  if [ -n "$SHEET" ]; then python -c "
from PIL import Image;im=Image.open(r'''$SHEET''');r=1200/im.width;im.resize((1200,int(im.height*r))).convert('RGB').save('draft/contact-sheet.jpg',quality=85)"; echo "sheet ok"; else echo "NO SHEET for $e"; fi
done
echo ALLDONE $(date +%T)
