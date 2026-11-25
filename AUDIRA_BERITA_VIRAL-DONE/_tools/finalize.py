"""Tag FINAL_VIDEO.mp4 with ownership metadata, QA it, archive the master.
Run from the series folder: python _tools/finalize.py ep01 [ep02 ...]
QA: ffprobe size/fps/duration, ebur128 loudness of the MP4, 6 frames pulled from the MP4 into _qa/<ep>-final.jpg."""
import datetime, json, shutil, subprocess, sys, tarfile
from pathlib import Path

SERIES = Path(__file__).resolve().parent.parent
TITLES = {
    "ep01": "Gibran Niat Mundur dari Wapres: Mundur atau Bertahan?",
    "ep02": "19 Pahlawan Nasional Baru 2026: Dari Hoegeng sampai Kakek Presiden",
    "ep03": "2 Juta Serangan Siber Sehari ke Indonesia: Diblokir, Bukan Dibobol",
    "ep05": "GTA 6 Butuh 212 GB: Kenapa Pre-load Dibuka 9 Hari Sebelum Rilis?",
    "ep06": "Kalau Wapres Mundur, Siapa Gantinya? Sejarah Kursi Wapres yang Pernah Kosong",
    "ep09": "Wapres Mundur, Masih Dapat Pensiun? Hak Mantan Wapres Menurut UU 7/1978",
    "ep10": "Hatta 1956 vs Agnew 1973: Kisah Wakil Presiden yang Mundur",
}
today = datetime.date.today().isoformat()
run = lambda a: subprocess.run(a, capture_output=True, text=True, encoding="utf8", errors="replace")
(SERIES / "_qa").mkdir(exist_ok=True)
for ep in sys.argv[1:]:
    d = next(SERIES.glob(f"EP{ep[2:]}_*"))
    src, tmp = d / "FINAL_VIDEO.mp4", d / "FINAL_tagged.mp4"
    slug = d.name.split("_", 1)[1].lower().replace("_", "-")
    r = run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-c", "copy", "-map_metadata", "-1",
             "-metadata", f"title={TITLES[ep]}", "-metadata", "artist=AUDIRA (Agus Dwi R.)",
             "-metadata", f"copyright=© {today[:4]} AUDIRA - Agus Dwi R. All rights reserved.",
             "-metadata", f"comment=AUDIRA-{slug}-EP{ep[2:]} | audira.my.id", "-metadata", f"date={today}",
             "-movflags", "+faststart+use_metadata_tags", str(tmp)])
    if r.returncode:
        print(ep, "TAG FAIL", r.stderr[-300:]); continue
    tmp.replace(src)
    p = json.loads(run(["ffprobe", "-v", "error", "-print_format", "json", "-show_streams", "-show_format", str(src)]).stdout)
    v = next(s for s in p["streams"] if s["codec_type"] == "video")
    tags = p["format"].get("tags", {})
    q = run(["ffmpeg", "-hide_banner", "-i", str(src), "-af", "ebur128=peak=true", "-f", "null", "-"]).stderr
    I = q[q.rfind("I:"):].split()[1]; TP = q[q.rfind("Peak:"):].split()[1]
    dur = float(p["format"]["duration"])
    # 6 frames from the MP4 itself: hook, 4 through the film, outro card
    ts = [0.5] + [dur * f for f in (0.2, 0.4, 0.6, 0.8)] + [dur - 1.0]
    frames = []
    for i, t in enumerate(ts):
        f = SERIES / "_qa" / f"{ep}-f{i}.jpg"
        run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", str(src), "-frames:v", "1", "-vf", "scale=270:480", str(f)])
        frames.append(str(f))
    run(["ffmpeg", "-v", "error", "-y"] + sum([["-i", f] for f in frames], []) +
        ["-filter_complex", "hstack=inputs=6", str(SERIES / "_qa" / f"{ep}-final.jpg")])
    for f in frames:
        Path(f).unlink(missing_ok=True)
    a = d / "archive" / today
    a.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, a / "FINAL_VIDEO.mp4")
    for n in ("vo.wav", "mix.wav"):
        shutil.copy2(SERIES / "studio" / "public" / "audio" / ep / n, a / n)
    with tarfile.open(a / f"project-{ep}.tar", "w") as tar:
        for rel in (f"src/scenes/{ep}", "src/scenes/_shared", "src/Root.tsx", "src/brand", f"public/audio/music/{ep}-bed.wav"):
            tar.add(SERIES / "studio" / rel, arcname=rel)
    print(f"{ep}: {v['width']}x{v['height']} {v['r_frame_rate']} {dur:.2f}s I={I} LUFS TP={TP} | title={tags.get('title','?')[:40]} | artist={tags.get('artist','?')}")
