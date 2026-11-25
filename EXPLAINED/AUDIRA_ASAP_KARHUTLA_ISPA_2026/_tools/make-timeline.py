"""Copy each episode's locked VO into the studio and write the scene clock.
Run from F:/AUDIRA-VIDEO-MOTION: python AUDIRA_ASAP_KARHUTLA_ISPA_2026/_tools/make-timeline.py [EP folders]
In:  <EP>/audio/vo.wav, <EP>/audio/timeline.json (vo.py build: scenes + display words)
Out: studio/public/audio/epNN/vo.wav and studio/src/scenes/epNN/timeline.json with
     {lead, voEnd, total, sections{HOOK..OUTRO:[s,e]}, clips[{id, section, text, start, end, words[{w,s,e}]}]}
total = voEnd + OUTRO_HOLD, so the AUDIRA outro card gets ~4 s after the last word."""
import json, shutil, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STUDIO = ROOT / "studio"
OUTRO_HOLD = 4.0
SEC = {"hook": "HOOK", "konteks": "KONTEKS", "pengembangan": "PENGEMBANGAN",
       "penjelasan": "PENJELASAN", "payoff": "PAYOFF", "outro": "OUTRO"}

eps = sys.argv[1:] or sorted(p.name for p in ROOT.glob("EP0*") if p.is_dir())
for ep in eps:
    nn = ep[2:4]
    src = json.loads((ROOT / ep / "audio" / "timeline.json").read_text(encoding="utf8"))
    lines = {l["id"]: l["text"] for l in json.loads((ROOT / ep / "docs" / "script-lines.json").read_text(encoding="utf8"))}
    clips = []
    for s in src["scenes"]:
        ws = [{"w": w["text"], "s": round(w["start"], 3), "e": round(w["end"], 3)} for w in src["words"] if w["scene"] == s["id"]]
        text = " ".join(w["w"] for w in ws)
        clips.append({"id": s["id"], "section": SEC[s["id"]], "text": text, "start": round(s["start"], 3), "end": round(s["end"], 3), "words": ws})
    vo_end = round(src["speech_end"], 3)
    out = {"lead": round(src["scenes"][0]["start"], 3), "voEnd": vo_end, "total": round(vo_end + OUTRO_HOLD, 3),
           "sections": {c["section"]: [c["start"], c["end"]] for c in clips}, "clips": clips}
    d = STUDIO / "src" / "scenes" / f"ep{nn}"
    (d / "timeline.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf8")
    a = STUDIO / "public" / "audio" / f"ep{nn}"
    a.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ROOT / ep / "audio" / "vo.wav", a / "vo.wav")
    print(ep, "total", out["total"], "words", sum(len(c["words"]) for c in clips))
