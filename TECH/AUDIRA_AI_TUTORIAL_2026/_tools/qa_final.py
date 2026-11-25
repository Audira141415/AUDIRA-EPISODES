"""QA of FINAL_VIDEO.mp4 per episode: specs, loudness, ownership tags, and an 8-frame sheet pulled from the MP4 itself
(not from stills: InstancedMesh/cache bugs only show in the encoded file). Writes EPxx_*/qc/final_sheet.jpg + QA_REPORT.md.
Usage (from AUDIRA_AI_TUTORIAL_2026): python _tools/qa_final.py ep01 [ep02 ...]"""
import sys, json, glob, subprocess, os
from PIL import Image

EXTRA = {"ep04": [48.6]}  # EP04: check the "CONTOH" label on the video bracket (47.4-50.6 s)


def run(a):
    return subprocess.run(a, capture_output=True, text=True, encoding="utf-8", errors="replace")


for ep in sys.argv[1:]:
    n = ep[2:]; d = glob.glob(f"EP{n}_*")[0]; f = f"{d}/FINAL_VIDEO.mp4"; os.makedirs(f"{d}/qc", exist_ok=True)
    tl = json.load(open(f"studio/src/scenes/{ep}/timeline.json", encoding="utf-8"))
    p = json.loads(run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_type,width,height,r_frame_rate:format=duration:format_tags",
                        "-of", "json", f]).stdout)
    v = [s for s in p["streams"] if s["codec_type"] == "video"][0]
    dur = float(p["format"]["duration"]); tags = p["format"].get("tags", {})
    q = run(["ffmpeg", "-hide_banner", "-i", f, "-map", "0:a", "-af", "ebur128=peak=true", "-f", "null", "-"]).stderr
    I = q[q.rfind("I:"):].split()[1]; TP = q[q.rfind("Peak:"):].split()[1]
    S = tl["sections"]
    times = [1.5, sum(S["konteks"]) / 2, S["langkah"][0] + 3, sum(S["langkah"]) / 2, sum(S["penjelasan"]) / 2,
             sum(S["payoff"]) / 2, S["outro"][0] + 2, tl["total"] - 1.5] + EXTRA.get(ep, [])
    ims = []
    for i, t in enumerate(times):
        o = f"{d}/qc/f{i}.jpg"
        run(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{t:.2f}", "-i", f, "-frames:v", "1", "-vf", "scale=270:480", o])
        ims.append(Image.open(o).convert("RGB")); os.remove(o)
    sheet = Image.new("RGB", (270 * len(ims), 480))
    for i, im in enumerate(ims): sheet.paste(im, (270 * i, 0))
    sheet.save(f"{d}/qc/final_sheet.jpg", quality=85)
    ok = (v["width"], v["height"]) == (1080, 1920) and v["r_frame_rate"] == "60/1" and abs(dur - tl["total"]) < 0.3 \
        and abs(float(I) + 14) <= 1.0 and float(TP) < -1.0
    rep = [f"# QA_REPORT — {d}", "", f"- Resolusi: {v['width']}×{v['height']} · fps: {v['r_frame_rate']} · durasi: {dur:.2f} dtk (timeline {tl['total']} dtk)",
           f"- Loudness: {I} LUFS integrated · true peak {TP} dBTP (target −14 LUFS, < −1 dBTP)",
           f"- Metadata: title='{tags.get('title', '-')}', artist='{tags.get('artist', '-')}', comment='{tags.get('comment', '-')}'",
           f"- Frame dari MP4 final (detik {', '.join(f'{t:.1f}' for t in times)}): `qc/final_sheet.jpg`",
           f"- Subtitle: `SUBTITLES.srt` · Outro AUDIRA mulai {S['outro'][1] + 0.2:.1f} dtk · AudiraSignature dibungkus di Root.tsx",
           f"- Status otomatis: {'LOLOS' if ok else 'CEK MANUAL'}", ""]
    open(f"{d}/QA_REPORT.md", "w", encoding="utf-8").write("\n".join(rep))
    print(d, f"{v['width']}x{v['height']}@{v['r_frame_rate']}", f"{dur:.2f}s", f"I={I}", f"TP={TP}", "title" if "title" in tags else "NO-TAGS", "LOLOS" if ok else "CEK")
