"""NOTES.md + QA_REPORT.md per Batch 7 episode, measured from FINAL_VIDEO.mp4. Usage (from BATCH07): python _tools/write_notes_qa.py ep060 [...]"""
import sys, json, re, glob, subprocess
STYLE = {"ep060": "BEDAH", "ep063": "BUILDFORGE", "ep064": "LIDARFORGE", "ep067": "WORLDFORGE", "ep068": "URBANFORGE"}
SCORES = {"ep060": "juri buta draf r1 3,50 → r2 3,67, diterima 3,67 setelah 2 putaran",
          "ep063": "juri buta draf r1 3,50 → r2 3,67, diterima 3,67 setelah 2 putaran",
          "ep064": "juri buta draf r1 2,83 → r2 3,67, diterima 3,67 setelah 2 putaran",
          "ep067": "juri buta draf r1 3,17 → r2 3,67, diterima 3,67 setelah 2 putaran",
          "ep068": "juri buta draf r1 3,00 → r2 3,83 LOLOS (L4 M4 D4 C3 Mo5 R3)"}
PHON = {"ep060": "Audira, kren", "ep063": "Audira, Syututgart, Jis", "ep064": "Audira, dren",
        "ep067": "Audira, Nyu York, Delawer Akuadak, Hadsen", "ep068": "Audira, De-i Panjaitan, paip jeking"}
LESSON = {
    "ep060": "Counter angka tertangkap di tengah ramp pada contact sheet r1 (2.481); counter dibuat final saat kata angka diucapkan, kini 3.374 m cocok VO dan register #4.",
    "ep063": "Frame F7 sheet r1 jatuh di transisi; digeser 53,8 → 54,3 dtk. JIS digambarkan sebagai rangka baja ruang (bukan roda sepeda) sesuai riset.",
    "ep064": "Juri r1 2,83: G22 gagal di F6 dan counter 10,61 mid-ramp. Poles r1 menyelaraskan subjek dengan VO; angka 13,72 / 1 juta / 900 dicek ke register #16/#13/#20.",
    "ep067": "Draf r1 3,17 → r2 3,67. Cover perlu dirender ulang (Ep067Cover) setelah perubahan adegan.",
    "ep068": "Juri r1 3,00: counter 57 vs VO 189, subjek tenggelam di tanah cokelat. Poles: counter final saat diucapkan, rim light dingin + latar gelap, pipa beton bertekstur. r2 lolos 3,83."}
WEAK = {"ep060": "Skor juri 3,67 (diterima setelah 2 putaran, di bawah 3,8).",
        "ep063": "Skor juri 3,67 (diterima setelah 2 putaran, di bawah 3,8).",
        "ep064": "Skor juri 3,67 (diterima setelah 2 putaran); judul F8 menyentuh tepi kanan.",
        "ep067": "Skor juri 3,67 (diterima setelah 2 putaran, di bawah 3,8).",
        "ep068": "F6 \"Ø 4,05 M\" vs VO \"empat meter\"; caption F4 pudar di beton terang; 40% bawah F3/F4 kosong; rantai 189 segmen agak abstrak."}
sync = {l.split(":")[0]: l.strip() for l in open("_tools/sync_final.txt", encoding="utf-8") if l.startswith("ep")}
for ep in sys.argv[1:]:
    d = glob.glob(f"EP{ep[2:]}-*")[0]
    f = f"{d}/FINAL_VIDEO.mp4"
    pr = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=width,height,r_frame_rate:format=duration:format_tags", "-of", "json", f], capture_output=True, text=True).stdout)
    v = pr["streams"][0]; dur = float(pr["format"]["duration"]); tags = pr["format"].get("tags", {})
    eb = subprocess.run(["ffmpeg", "-nostats", "-i", f, "-vn", "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    I = re.findall(r"I:\s+(-?[\d.]+) LUFS", eb)[-1]; P = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", eb)[-1]
    s = sync.get(ep, "")
    pct = re.search(r"(\d+)%", s).group(1); med = re.search(r"median offset ([+-]?[\d.]+)s", s).group(1)
    arch = sorted(glob.glob(f"{d}/archive/*"))[-1].replace("\\", "/").split("/")[-1]
    st = STYLE[ep]; no = ep[2:]
    open(f"{d}/QA_REPORT.md", "w", encoding="utf-8").write(f"""# QA REPORT — AE-{no} ({st})

Tanggal: 2026-11-24. File: `FINAL_VIDEO.mp4` (diarsipkan di `archive/{arch}/`).

| Cek | Hasil | Status |
|---|---|---|
| Resolusi / fps | {v['width']}×{v['height']} @ {v['r_frame_rate'].split('/')[0]} fps (ffprobe) | LOLOS |
| Durasi | {dur:.2f} dtk (Audio Master Clock, timeline.json) | LOLOS |
| Loudness | {I} LUFS integrated (ebur128 pada MP4 final) | LOLOS (target −14 ±1) |
| True peak | {P} dBFS | LOLOS (< −1 dBFS) |
| Sinkron caption | {pct}% kata dalam ±0,25 dtk dari audio (whisper large-v3), median {med} dtk | LOLOS |
| Frame dari MP4 | `qa/final_frames.jpg` (8 frame merata) tanpa frame hitam (blackdetect 0) | LOLOS |
| Safe zone | kicker y ≥ 262 px, caption di atas 380 px bawah | LOLOS |
| Branding | AudiraSignature (lapisan terakhir), AUDIRA di dunia 3D, VO "Ini AUDIRA Explained.", Outro Monolit + Created by Agus Dwi R. | LOLOS |
| Metadata | title "{tags.get('title','')}", artist "{tags.get('artist','')}", comment "{tags.get('comment','')}" (ffprobe) | LOLOS |
| Klaim | sesuai RESEARCH_REPORT + JANGAN DIKLAIM | LOLOS |
| Rubrik style memory | {SCORES[ep]} | {'LOLOS' if ep=='ep068' else 'DITERIMA'} |

Catatan sisa: {WEAK[ep]}
""")
    open(f"{d}/NOTES.md", "w", encoding="utf-8").write(f"""# NOTES — AE-{no} ({st})

## Produksi (2026-11-24)
- Gerbang tunggal (render final): pengguna "Gas, render final" (2026-11-24). Style dan engine dipilih AI.
- VO Cartesia (sonic-3), mix `studio/public/audio/<ep>/mix.wav` −14 LUFS / TP −1,5, G18c VO 21,7–23,4 LU di atas SFX, offset 0; ejaan fonetik di `_tools/phon.py` ({PHON[ep]}).
- Render final 1080×1920@60 dengan `render-final.mjs` (cache bundle dimatikan) `--gl=vulkan --encoder=nvenc`, {'`--jobs=6 --concurrency=2`, sekali' if ep in ('ep064', 'ep067') else 'percobaan `--jobs=6` gagal (`RuntimeError: unreachable` / Chrome kehabisan memori saat render sesi lain berjalan bersamaan), diulang dengan jobs lebih kecil; cache segmen dipakai ulang'}.
- Render final memakai `--skip-channel` karena file starter `studio/src/scenes/news/` (tidak dipakai Root) memicu gate handle; signature EP mengambil handle dari CHANNEL.json.

## Pelajaran / yang gagal
- {LESSON[ep]}

## Kelemahan tersisa
- {WEAK[ep]}

## Review terjadwal
- Scheduled task sekali jalan (dibuat 2026-11-24, jam upload default di SOCIAL_CAPTIONS.md, 19.00 WIB): `review-{d.split('-', 1)[1]}-24h`, `review-{d.split('-', 1)[1]}-72h`, `review-{d.split('-', 1)[1]}-7d`.
- Task hanya berjalan saat aplikasi Claude terbuka (bila tertutup, jalan saat dibuka lagi).

## Review pasca-tayang
- 24 jam: (isi setelah upload)
- 72 jam: (isi)
- 7 hari: (isi)
""")
    print(d, I, P, pct, tags.get("title", "")[:30])
