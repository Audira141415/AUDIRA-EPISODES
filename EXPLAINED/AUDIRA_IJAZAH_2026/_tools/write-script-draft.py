"""Rewrite SCRIPT.md for EP05-EP09 from script-lines.json + estimated timeline.json, keeping each file's title line.
Run from AUDIRA_IJAZAH_2026: python _tools/write-script-draft.py"""
import json, re, glob
TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}")
for d in sorted(glob.glob("EP0[5-9]*")):
    title = open(f"{d}/SCRIPT.md", encoding="utf8").readline().strip()
    L = json.load(open(f"{d}/script-lines.json", encoding="utf8"))
    T = json.load(open(f"{d}/timeline.json", encoding="utf8"))
    st = {s["id"]: s["start"] for s in T["scenes"]}
    n = sum(len(TOK.sub(lambda m: m.group(2), l["text"]).split()) for l in L)
    rows = "\n".join(f"| {int(st[l['id']]//60)}:{int(st[l['id']]%60):02d} | {l['id']} | {TOK.sub(lambda m: m.group(1), l['text'])} |" for l in L)
    end = T["speech_end"]
    out = f"""{title}

Status: final. Naskah disetujui 6 Nov 2026, suara Cartesia sonic-3 (voice 04b567df). Timecode dari suara asli.
Fakta dicek sampai Jumat 6 November 2026 sore WIB.

| Waktu | Adegan | Narasi |
|---|---|---|
{rows}
| {int(end//60)}:{int(end%60):02d} | outro | Logo AUDIRA, Created by Agus Dwi R. (3 detik) |

Kata terucap: {n}. Estimasi durasi film: {T['duration']:.0f} detik. Teks fonetik untuk Cartesia ada di `script-lines.json` (penanda {{tampil|ucapan}}).
Video: `FINAL_VIDEO.mp4` (draft bisu lama: `DRAFT_SILENT.mp4`).
"""
    open(f"{d}/SCRIPT.md", "w", encoding="utf8").write(out)
    print(d, n, T["duration"])
