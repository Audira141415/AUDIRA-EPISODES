"""Locks a silent HyperFrames draft to its Cartesia voiceover.

Usage (from F:/AUDIRA-VIDEO-MOTION): python scripts/voice-lock.py <project>

Reads <project>/voice-lock.json and <project>/video/assets/audio/vo-meta.json, then:
- warps every scene timeline so authored beats land on the spoken words,
- rewrites scene starts/durations, the progress rail and the audio tags in index.html,
- mixes the clips into assets/audio/vo.wav and writes vo-words.json,
- builds burned-in captions (compositions/captions.html, docs/CAPTIONS.md, captions.srt).
Re-runnable: the warp block and generated tags are replaced, not stacked.
"""
import json
import math
import re
import subprocess
import sys
from pathlib import Path

proj = Path(sys.argv[1])
cfg = json.loads((proj / "voice-lock.json").read_text(encoding="utf8"))

OFF = cfg.get("off", 0.15)  # voice starts this long after its scene starts
TAIL = cfg.get("tail", 0.45)  # breath after the last word before the cut
HOLD = cfg.get("hold", 1.8)  # extra hold on the final scene for the CTA
video = proj / cfg.get("video_dir", "video")
meta = json.loads((video / "assets/audio/vo-meta.json").read_text(encoding="utf8"))
voices = meta["voices"]
scenes = cfg["scenes"]
assert list(voices) == [s["id"] for s in scenes], "scene ids must match the voice clips"

# ---- scene timing from the voice ----
t = 0.0
for i, s in enumerate(scenes):
    s["start"] = round(t, 2)
    s["dur"] = round(OFF + voices[s["id"]]["duration_s"] + TAIL + (HOLD if i == len(scenes) - 1 else 0), 2)
    t += s["dur"]
total = round(t, 2)

def find(words, word):
    """Start time of a spoken word; "word#2" picks its second occurrence."""
    name, _, nth = word.partition("#")
    hits = [w for w in words if w["text"].lower().startswith(name.lower())]
    assert len(hits) >= int(nth or 1), word
    return hits[int(nth or 1) - 1]["start"]


# ---- warp each scene timeline ----
WARP_START = "    // Voice lock (scripts/voice-lock.py)"
for i, s in enumerate(scenes):
    path = video / "compositions" / f"{s['id']}.html"
    src = path.read_text(encoding="utf8")
    src = re.sub(r"// Voice lock \(scripts/voice-lock\.py\).*?window\.__timelines\[\"(s\d+)\"\] = voiced;", lambda m: f'window.__timelines["{m.group(1)}"] = tl;', src, flags=re.S)
    key = f"s{i + 1}"
    reg = f'window.__timelines["{key}"] = tl;'
    assert reg in src, (path, reg)
    words = voices[s["id"]]["words"]
    old = s["old"]
    pts = [[0, 0]]
    for a, word in s["anchors"]:
        pts.append([a, round(OFF + find(words, word), 3)])
    pts += [[old - 0.4, s["dur"] - 0.4], [old, s["dur"]]]
    for (a0, b0), (a1, b1) in zip(pts, pts[1:]):
        assert a1 > a0 and b1 > b0, (s["id"], pts)
    block = (
        f"{WARP_START}: authored beat -> spoken word, seconds in this scene\n"
        f"    const VOICE = {json.dumps(pts)};\n"
        "    const authored = (v) => {\n"
        "      for (let i = 1; i < VOICE.length; i++) {\n"
        "        const [a0, b0] = VOICE[i - 1];\n"
        "        const [a1, b1] = VOICE[i];\n"
        "        if (v <= b1) return a0 + ((a1 - a0) * (v - b0)) / (b1 - b0);\n"
        "      }\n"
        "      return VOICE[VOICE.length - 1][0];\n"
        "    };\n"
        "    const clock = { v: 0 };\n"
        "    const voiced = gsap.timeline({ paused: true });\n"
        f"    voiced.fromTo(clock, {{ v: 0 }}, {{ v: {s['dur']}, duration: {s['dur']}, ease: \"none\", onUpdate: () => tl.time(authored(clock.v)) }}, 0);\n"
        f"    window.__timelines[\"{key}\"] = voiced;"
    )
    src = src.replace(reg, block.lstrip(), 1)
    path.write_text(src, encoding="utf8")

# ---- voice mix ----
clips = []
filt = []
for i, s in enumerate(scenes):
    clips += ["-i", voices[s["id"]]["path"]]
    ms = int(round((s["start"] + OFF) * 1000))
    filt.append(f"[{i}:a]adelay={ms}|{ms}[a{i}]")
mix = "".join(f"[a{i}]" for i in range(len(scenes)))
filt.append(f"{mix}amix=inputs={len(scenes)}:normalize=0,apad=whole_dur={total}[out]")
subprocess.run(
    ["ffmpeg", "-y", "-loglevel", "error", *clips, "-filter_complex", ";".join(filt), "-map", "[out]", "-t", str(total), "-ar", "44100", "-ac", "1", str(video / "assets/audio/vo.wav")],
    check=True,
)

# ---- words on the film clock ----
def merge(ws):
    out = []
    i = 0
    rules = sorted(cfg.get("merges", []), key=lambda r: -len(r[0]))
    while i < len(ws):
        for seq, rep in rules:
            if [w["text"] for w in ws[i : i + len(seq)]] == seq:
                out.append({"text": rep, "start": ws[i]["start"], "end": ws[i + len(seq) - 1]["end"]})
                i += len(seq)
                break
        else:
            out.append(dict(ws[i]))
            i += 1
    return out

film_words = []
groups = []
MAX = 5
for sc, s in enumerate(scenes):
    base = s["start"] + OFF
    ws = [{"text": w["text"], "start": round(base + w["start"], 3), "end": round(base + w["end"], 3), "sc": sc} for w in merge(voices[s["id"]]["words"])]
    film_words += ws
    clause = []
    for j, w in enumerate(ws):
        clause.append(w)
        nxt = ws[j + 1] if j + 1 < len(ws) else None
        if re.search(r"[.,?!:]$", w["text"]) or not nxt or nxt["start"] - w["end"] >= 0.35:
            n = math.ceil(len(clause) / MAX)
            size = math.ceil(len(clause) / n)
            groups += [clause[k : k + size] for k in range(0, len(clause), size)]
            clause = []
(video / "assets/audio/vo-words.json").write_text(json.dumps([{k: w[k] for k in ("text", "start", "end")} for w in film_words], ensure_ascii=False, indent=1), encoding="utf8")

i = len(groups) - 1
while i >= 0:
    g = groups[i]
    if len(g) == 1:
        prev = groups[i - 1] if i > 0 else None
        nxt = groups[i + 1] if i + 1 < len(groups) else None
        if prev and prev[-1]["sc"] == g[0]["sc"] and len(prev) < MAX + 1 and g[0]["start"] - prev[-1]["end"] < 0.6:
            prev += g
            groups.pop(i)
        elif nxt and nxt[0]["sc"] == g[0]["sc"] and len(nxt) < MAX + 1 and nxt[0]["start"] - g[0]["end"] < 0.6:
            nxt[:0] = g
            groups.pop(i)
    i -= 1

emph = re.compile(cfg["emphasis"])
esc = lambda x: x.replace("&", "&amp;").replace("<", "&lt;")
rows = []
for k, g in enumerate(groups):
    start = max(0.1, g[0]["start"] - 0.05)
    end = g[-1]["end"] + 0.25
    if k + 1 < len(groups):
        end = min(end, groups[k + 1][0]["start"] - 0.05)
    rows.append((k, round(start, 2), round(end, 2), g))

caps = "\n".join(
    f'    <div id="cap-{k}" class="clip cap" data-start="{a}" data-duration="{b - a:.2f}" data-track-index="0"><span class="cap-t">'
    + " ".join(f"<em>{esc(w['text'])}</em>" if emph.match(w["text"]) else esc(w["text"]) for w in g)
    + "</span></div>"
    for k, a, b, g in rows
)
# A project may style its own captions; otherwise the shared template is used
own_tpl = proj / "captions-template.html"
tpl = (own_tpl if own_tpl.exists() else Path(__file__).parent / "captions-template.html").read_text(encoding="utf8")
(video / "compositions/captions.html").write_text(tpl.replace("{{CAPTIONS}}", caps), encoding="utf8")

fmt = lambda x: f"{int(x // 60)}:{x - int(x // 60) * 60:05.2f}"
md = [f"# CAPTIONS: {cfg['title']}", "", "Subtitle burned-in per frasa dari timestamp kata Cartesia, dibuat oleh `scripts/voice-lock.py`. **Tebal** = istilah atau angka kunci.", "", "| # | Mulai | Selesai | Teks |", "|---|---|---|---|"]
md += [f"| {k + 1} | {fmt(a)} | {fmt(b)} | " + " ".join(f"**{w['text']}**" if emph.match(w["text"]) else w["text"] for w in g) + " |" for k, a, b, g in rows]
md += ["", f"Total {len(rows)} grup.", ""]
(proj / cfg.get("captions_md", "docs/CAPTIONS.md")).write_text("\n".join(md), encoding="utf8")

def srt(x):
    ms = int(round(x * 1000))
    return f"{ms // 3600000:02}:{ms % 3600000 // 60000:02}:{ms % 60000 // 1000:02},{ms % 1000:03}"
(proj / cfg.get("srt", "captions.srt")).write_text("\n".join(f"{n + 1}\n{srt(a)} --> {srt(b)}\n" + " ".join(w["text"] for w in g) + "\n" for n, (k, a, b, g) in enumerate(rows)), encoding="utf8")

# ---- progress rail ----
prog = video / "compositions/progress.html"
p = prog.read_text(encoding="utf8") if prog.exists() else None
# One rail segment per scene between the hook and the close, unless rail_count says fewer
if p is not None:
    mid = scenes[1 : 1 + cfg.get("rail_count", len(scenes) - 2)]
    spans = ",\n".join(f'      ["#pg-f{n + 1}", {s["start"]}, {s["dur"]}]' for n, s in enumerate(mid))
    p = re.sub(r"const spans = \[\n.*?\n    \];", f"const spans = [\n{spans},\n    ];", p, flags=re.S)
    p = re.sub(r'(tl\.fromTo\("#pg-rail", \{ opacity: 0 \}, \{ opacity: 1, duration: 0\.3 \}, )[\d.]+\);', rf"\g<1>{mid[0]['start']});", p)
    p = re.sub(r'(tl\.to\("#pg-rail", \{ opacity: 0, duration: 0\.3 \}, )[\d.]+\);', rf"\g<1>{scenes[1 + len(mid)]['start']});", p)
    prog.write_text(p, encoding="utf8")

# ---- index.html ----
idx = video / "index.html"
h = idx.read_text(encoding="utf8")
for n, s in enumerate(scenes):
    h = re.sub(rf'(<div id="s{n + 1}" [^>]*data-start=")[\d.]+(" data-duration=")[\d.]+', rf"\g<1>{s['start']:g}\g<2>{s['dur']:g}", h)
h = re.sub(r'(<div id="root" data-composition-id="main" data-start="0" data-duration=")[\d.]+', rf"\g<1>{total:g}", h)
h = re.sub(r'(<div id="progress" [^>]*data-duration=")[\d.]+', rf"\g<1>{total:g}", h)
h = h.replace("<!-- Scenes (silent draft: timings estimated from the script, re-locked to the voice later) -->", "<!-- Scenes: timings locked to the voiceover by scripts/voice-lock.py -->")
h = re.sub(r"\n+      <!-- Captions -->.*?(?=\n    </div>\n    <script>)", "", h, flags=re.S)

sfx_meta = {"whoosh-short": 0.57, "whoosh": 0.57, "pop": 0.72, "click": 0.36, "ping": 1.32, "error": 0.9, "chime": 2.5, "impact-bass-1": 2.1, "glitch-1": 0.7, "glitch-2": 0.7, "glitch-3": 0.7, "sparkle": 1.2, "typing": 1.5}
sfx_meta.update(cfg.get("sfx_meta", {}))
audio = [
    "",
    "",
    "      <!-- Captions -->",
    f'      <div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="{total:g}" data-track-index="3" data-track-kind="captions" data-width="1080" data-height="1920" style="z-index: 10"></div>',
    "",
    f"      <!-- Voiceover: Cartesia sonic-3, voice {cfg.get('voice_label', 'Audira')} -->",
    f'      <audio id="vo" class="clip" data-start="0" data-duration="{total:g}" data-track-index="4" src="assets/audio/vo.wav"></audio>',
    f"      <!-- Music bed: {cfg.get('bgm_label', 'MusicGen (facebook/musicgen-small), generated locally')} -->",
    f'      <audio id="bgm" class="clip" src="assets/bgm/track.wav" data-start="0" data-duration="{total:g}" data-track-index="5" data-volume="{cfg.get("bgm_volume", 0.13)}"></audio>',
    "",
    "      <!-- SFX on visible actions -->",
]
busy = {}  # lane -> end time of its last cue


def lane_for(at, dur):
    """First SFX lane (6+) free at this time, so no two cues overlap on a track."""
    lane = 6
    while busy.get(lane, -1) > at:
        lane += 1
    busy[lane] = at + dur
    return lane


cues = []
for n, s in enumerate(scenes[1:], 1):
    cues.append((max(0, s["start"] - 0.35), f"sfx-cut-{n}", cfg.get("cut_sfx", "whoosh-short"), cfg.get("cut_vol", 0.28)))
# Authored-time cues are mapped through the same warp as their scene
for n, s in enumerate(scenes):
    words = voices[s["id"]]["words"]
    pts = [[0, 0]] + [[a, OFF + find(words, wd)] for a, wd in s["anchors"]] + [[s["old"] - 0.4, s["dur"] - 0.4], [s["old"], s["dur"]]]
    def fwd(a):
        for (a0, b0), (a1, b1) in zip(pts, pts[1:]):
            if a <= a1:
                return b0 + (b1 - b0) * (a - a0) / (a1 - a0)
        return pts[-1][1]
    for c, (a, name, vol) in enumerate(s.get("sfx", [])):
        cues.append((s["start"] + fwd(a), f"sfx-{n + 1}-{c + 1}", name, vol))
for at, cid, name, vol in sorted(cues):
    audio.append(f'      <audio id="{cid}" class="clip" src="assets/sfx/{name}.{cfg.get("sfx_ext", "mp3")}" data-start="{at:.2f}" data-duration="{sfx_meta[name]}" data-track-index="{lane_for(round(at, 2), sfx_meta[name])}" data-volume="{vol}"></audio>')
h = h.replace("\n    </div>\n    <script>", "\n".join(audio) + "\n    </div>\n    <script>", 1)
idx.write_text(h, encoding="utf8")

print(f"{proj}: {len(scenes)} scenes, {total}s, {len(rows)} caption groups")
for s in scenes:
    print(f"  {s['id']:16} {s['start']:7.2f} +{s['dur']:.2f}")
