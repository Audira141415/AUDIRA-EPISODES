"""Build EPxxx-*/voiceover.json from _write_scripts.S (one line per sentence). TTS text gets phonetic swaps that keep word counts equal to the display text."""
import json, re, sys
sys.path.insert(0, ".")
from _write_scripts import S
sys.path.insert(0, "_tools")
from phon import PHON
for ep, (title, parts) in S.items():
    num = ep[2:5]; lines = []; n = 0
    for sec, txt in parts:
        sents = re.findall(r"[^.?!]+[.?!]", txt)
        for j, s in enumerate(sents):
            s = s.strip(); n += 1; t = s
            for a, b in PHON: t = re.sub(a, b, t)
            t = t[0].upper() + t[1:]
            assert len(t.split()) == len(s.split()), (ep, s, t)
            lines.append({"id": f"l{n:02d}", "who": "narator", "section": sec, "speed": 1.0,
                          "gap": 0.65 if j == len(sents) - 1 else 0.32, "text": t, "display": s})
    base = "F:/AUDIRA-EPISODES/EXPLAINED/AUDIRA_EXPLAINED/BATCH07/studio/public/audio/ep" + num
    req = {"model": "sonic-3", "language": "id", "voice": "04b567df-2923-4b0c-896b-4b7df0a07e1a",
           "out_dir": base + "/clips", "meta": base + "/vo-meta.json", "lead": 0.6, "tail": 4.0, "target_vo_end": 61.0, "lines": lines}
    json.dump(req, open(f"{ep}/voiceover.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(ep, len(lines), "lines;", [l["text"] for l in lines if l["text"] != l["display"]][:6])
