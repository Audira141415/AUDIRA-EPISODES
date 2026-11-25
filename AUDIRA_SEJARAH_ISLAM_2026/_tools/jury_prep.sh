#!/usr/bin/env bash
# Usage: bash _tools/jury_prep.sh EP05  -> runs audit:visual on draft/DRAFT_SHEET.jpg (4x2 grid) and writes
# draft/jury_input.json with the ceilings and reasons the blind jury may see (plus camera.json motion if present).
cd "$(dirname "$0")/.."; d=$(ls -d ${1}_*)
(cd "$d/project" && node scripts/visual-audit.mjs ../draft/DRAFT_SHEET.jpg --grid=${2:-4x2} --json=../draft/look_sheet.json > /dev/null 2>&1)
python - "$d" <<'PY'
import json,sys,os
d=sys.argv[1]; L=json.load(open(f"{d}/draft/look_sheet.json",encoding="utf8"))
out={"ceilings":L.get("ceilings"),"reasons":L.get("reasons")}
c=f"{d}/project/out/draft/camera.json"
if os.path.exists(c):
    C=json.load(open(c,encoding="utf8")); out["camera"]={k:C[k] for k in C if k in("score","motion","summary","cuts","parked","jerks","verdict")} or C
json.dump(out,open(f"{d}/draft/jury_input.json","w",encoding="utf8"),ensure_ascii=False,indent=1)
print(json.dumps(out,ensure_ascii=False)[:1500])
PY
