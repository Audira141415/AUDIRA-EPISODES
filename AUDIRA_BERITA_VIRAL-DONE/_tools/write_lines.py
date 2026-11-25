"""Write <EP>/docs/script-lines.json from the approved scripts in write_scripts.py (approved 2026-11-11).
Moves punctuation that follows a {display|spoken} group inside both sides, so vo.py's word matcher
sees the same tokens Cartesia returns. Run: python _tools/write_lines.py"""
import json, re, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import write_scripts as W  # noqa: E402  (also rewrites docs/SCRIPT.md, harmless)

IDS = ["hook", "konteks", "pengembangan", "penjelasan", "payoff", "outro"]
PUNCT = re.compile(r"\{([^|}]*)\|([^}]*)\}([.,:;?!]+)")

for ep, (_style, texts) in W.EPS.items():
    out = [{"id": i, "text": PUNCT.sub(lambda m: "{%s%s|%s%s}" % (m.group(1), m.group(3), m.group(2), m.group(3)), t)}
           for i, t in zip(IDS, texts)]
    p = W.SERIES / ep / "docs" / "script-lines.json"
    p.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf8")
    print(ep, "lines", len(out))
