"""Cetak detik mulai/akhir tiap segmen s1-s8 dari vo-words.json ke audio/vo.segments.json."""
import json, pathlib, re

EP = pathlib.Path(__file__).resolve().parent.parent
raw = json.loads((EP / "project/public/audio/vo-words.json").read_text(encoding="utf-8"))
words = raw["words"] if isinstance(raw, dict) else raw
print("keys", list(words[0].keys()), "n", len(words))
paras = [p.split() for p in re.split(r"\n\s*\n", (EP / "audio/vo_tts.txt").read_text(encoding="utf-8").strip())]
out, i = [], 0
for n, p in enumerate(paras, 1):
    seg = words[i : i + len(p)]
    i += len(p)
    txt = lambda w: w.get("text") or w.get("word")
    out.append({"id": f"s{n}", "start": round(seg[0]["start"], 2), "end": round(seg[-1]["end"], 2)})
    print(f"s{n} {seg[0]['start']:.2f}-{seg[-1]['end']:.2f} [{txt(seg[0])} .. {txt(seg[-1])}]")
(EP / "audio/vo.segments.json").write_text(json.dumps(out, indent=1), encoding="utf-8")
