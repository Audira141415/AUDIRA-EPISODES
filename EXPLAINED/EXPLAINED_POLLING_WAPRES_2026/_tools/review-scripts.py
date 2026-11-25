"""Writes _review/REVIEW_SCRIPTS.md (each <EP>/docs/SCRIPT.md is written by its builder) from project/script-lines.json + timeline.json. Run from anywhere."""
import json, re
from pathlib import Path
SERIES = Path(__file__).resolve().parent.parent
TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}")
NAMES = {"s1": "Hook", "s2": "Konteks", "s3": "Konteks", "s4": "Pengembangan", "s5": "Pengembangan", "s6": "Penjelasan", "s7": "Payoff", "s8": "Outro"}
out = ["# Review naskah: Cara Pembuatan\n", "Teks tampil di layar dan subtitle. Ejaan fonetik untuk suara Cartesia dicatat di `project/script-lines.json` dan tidak tampil.\n"]
for ep in sorted(SERIES.glob("EP0*")):
    L = json.loads((ep / "project/script-lines.json").read_text(encoding="utf8"))
    T = json.loads((ep / "project/timeline.json").read_text(encoding="utf8"))
    st = json.loads((ep / "STATUS.json").read_text(encoding="utf8"))["data"]
    words = sum(len(TOK.sub(r"\1", l["text"]).split()) for l in L)
    lo, hi = words / 150 * 60, words / 135 * 60
    sc = {s["id"]: s for s in T["scenes"]}
    md = [f"## {ep.name}: {st.get('title','')}\n", f"Style **{st.get('style')}**. {words} kata, estimasi {lo:.0f}–{hi:.0f} dtk pada 135–150 WPM (timeline perkiraan: {T['speech_end']:.0f} dtk suara + outro).\n"]
    for l in L:
        s = sc[l["id"]]
        md.append(f"- **{l['id']} · {NAMES.get(l['id'],'')}** ({s['start']:.0f}–{s['end']:.0f} dtk): {TOK.sub(r'\1', l['text'])}")
    out += md + [""]
    print(ep.name, words, f"{lo:.0f}-{hi:.0f}s")
(SERIES / "_review").mkdir(exist_ok=True)
(SERIES / "_review/REVIEW_SCRIPTS.md").write_text("\n".join(out) + "\n", encoding="utf8")
