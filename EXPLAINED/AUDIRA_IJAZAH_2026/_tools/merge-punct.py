"""Merges standalone punctuation caption words into the previous word. Run from the episode folder after vo.py build."""
import json

T = json.load(open("timeline.json", encoding="utf8"))
out = []
for w in T["words"]:
    if out and w["text"].strip(".,:;?!”") == "" and out[-1]["scene"] == w["scene"]:
        out[-1]["text"] += w["text"]
        out[-1]["end"] = w["end"]
    else:
        out.append(w)
print("words", len(T["words"]), "->", len(out))
T["words"] = out
json.dump(T, open("timeline.json", "w", encoding="utf8"), ensure_ascii=False, indent=0)
