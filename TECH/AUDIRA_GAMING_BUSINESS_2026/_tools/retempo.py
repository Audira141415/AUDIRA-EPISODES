"""Second pass for the WPM target. Run from F:/AUDIRA-VIDEO-MOTION. Backs up v1, edits script lines, re-voices changed lines only, then picks atempo for the target WPM."""
import json, re, shutil, subprocess, sys
from pathlib import Path

ROOT = Path("AUDIRA_GAMING_BUSINESS_2026")
TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}")
TARGET = {"EP01_ROBLOX_CREATOR_ECONOMY": 148.5, "EP02_FORTNITE_CREATOR_ECONOMY": 149, "EP03_ESPORTS_PROFESSIONAL": 149.5, "EP04_MINECRAFT_CREATOR_BUSINESS": 149.5, "EP05_CS2_DIGITAL_ASSET_ECONOMY": 149}
EDITS = {
    "EP02_FORTNITE_CREATOR_ECONOMY": {
        "s2": [("Terbit di dalam game yang sudah punya lebih dari", "Terbit di game dengan lebih dari")],
        "s4": [("Bawa pemain baru, kamu dapat", "Bawa pemain baru, dapat")],
        "s5": [("island dapat lebih banyak dari item ketimbang payout.", "island lebih untung dari item.")],
        "s6": [("setelah bulan berakhir, dan Epic menyatakan rumusnya terus diperbarui.", "setelah bulan berakhir.")],
    },
    "EP03_ESPORTS_PROFESSIONAL": {
        "s3": [("Tiap game punya ekonomi sendiri. ", ""), ("{64,9|enam puluh empat koma sembilan}", "{65|enam puluh lima}"), ("{42,2|empat puluh dua koma dua}", "{42|empat puluh dua}"), ("{24,5|dua puluh empat koma lima}", "{24|dua puluh empat}"), ("{23,3|dua puluh tiga koma tiga}", "{23|dua puluh tiga}")],
        "s4": [("Januari lalu,", "Januari,")],
        "s5": [(" Dan hadiahnya harus dimenangkan dulu.", "")],
        "s7": [("Esports Earnings mencatat total", "Tercatat total")],
    },
    "EP05_CS2_DIGITAL_ASSET_ECONOMY": {
        "s2": [("Di halaman resmi Steam,", "Di Steam,"), (" Kurang dari nol koma tiga persen.", "")],
        "s4": [("Harga pasar itu cerita lain. Jual", "Jual")],
    },
}


def spoken(lines):
    return sum(len(TOK.sub(lambda m: m.group(2), l["text"]).split()) for l in lines)


for ep, tgt in TARGET.items():
    d = ROOT / ep
    bak = d / "PROJECT" / "v1"
    bak.mkdir(exist_ok=True)
    for f in ("FINAL_VIDEO.mp4", "script-lines.json", "timeline.json"):
        if not (bak / f).exists():
            shutil.copy2(d / f, bak / f)
    if not (bak / "clips").exists():
        shutil.copytree(d / "AUDIO/work/clips", bak / "clips")
        shutil.copy2(d / "AUDIO/work/meta.json", bak / "meta.json")
    lines = json.loads((d / "script-lines.json").read_text(encoding="utf8"))
    changed = []
    for l in lines:
        for a, b in EDITS.get(ep, {}).get(l["id"], []):
            if a in l["text"]:
                l["text"] = l["text"].replace(a, b)
                if l["id"] not in changed:
                    changed.append(l["id"])
    (d / "script-lines.json").write_text("[\n" + ",\n".join(json.dumps(l, ensure_ascii=False) for l in lines) + "\n]\n", encoding="utf8")
    if changed:
        subprocess.run([sys.executable, "AUDIRA_GAMING_BUSINESS_2026/_tools/vo.py", ep, "tts", "--speed", "1.0", "--only", *changed], check=True, stdout=subprocess.DEVNULL)
    subprocess.run([sys.executable, "AUDIRA_GAMING_BUSINESS_2026/_tools/vo.py", ep, "build", "--tempo", "1.0"], check=True, stdout=subprocess.DEVNULL)
    n = spoken(lines)
    s0 = json.loads((d / "timeline.json").read_text(encoding="utf8"))["speech_end"]
    tempo = round(s0 / (n / tgt * 60), 4)
    out = subprocess.run([sys.executable, "AUDIRA_GAMING_BUSINESS_2026/_tools/vo.py", ep, "build", "--tempo", str(tempo)], check=True, capture_output=True, text=True, encoding="utf8").stdout
    T = json.loads((d / "timeline.json").read_text(encoding="utf8"))
    flags = [x for x in out.splitlines() if "MISMATCH" in x or "LEFTOVER" in x]
    print(ep, "spoken", n, "tempo", tempo, "speech", T["speech_end"], "film", T["duration"], "wpm", round(n / T["speech_end"] * 60, 1), "redo", changed, flags)
