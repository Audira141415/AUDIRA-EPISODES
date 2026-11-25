import json, shutil
from pathlib import Path
SEC = {"hook":"HOOK","konteks":"KONTEKS","pengembangan":"PENGEMBANGAN","penjelasan":"PENJELASAN","payoff":"PAYOFF","outro":"OUTRO"}
src = json.loads(Path("audio/timeline.json").read_text(encoding="utf8"))
clips = []
for s in src["scenes"]:
    ws = [{"w": w["text"], "s": round(w["start"],3), "e": round(w["end"],3)} for w in src["words"] if w["scene"] == s["id"]]
    clips.append({"id": s["id"], "section": SEC[s["id"]], "text": " ".join(w["w"] for w in ws), "start": s["start"], "end": s["end"], "words": ws})
ve = round(src["speech_end"], 3)
out = {"lead": clips[0]["start"], "voEnd": ve, "total": round(ve + 4.0, 3), "sections": {c["section"]: [c["start"], c["end"]] for c in clips}, "clips": clips}
Path("project/src/scenes/ep19/timeline.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf8")
shutil.copy2("audio/vo.wav", "project/public/audio/ep19/vo.wav")
for c in clips:
    print(c["id"], " ".join(f'{i}:{w["w"]}@{w["s"]}' for i, w in enumerate(c["words"])))
print("total", out["total"])
