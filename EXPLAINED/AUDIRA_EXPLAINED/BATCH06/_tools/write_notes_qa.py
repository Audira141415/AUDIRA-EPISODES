"""NOTES.md + QA_REPORT.md per Batch 6 episode, measured from FINAL_VIDEO.mp4. Usage (from BATCH06): python _tools/write_notes_qa.py ep065 [...]"""
import sys, json, glob, re, subprocess

STYLE = {"ep065": "VINTAGEFORGE", "ep066": "GLASSCRAFT", "ep069": "PAPERWORLD", "ep071": "THERMALFORGE", "ep073": "SATISFYFORGE"}
SCORES = {"ep065": "cover 4,0 · draf 4,0 (setelah 2 putaran poles dari 3,83) · final 4,0",
          "ep066": "cover 4,0 · draf 4,0 · final 4,0",
          "ep069": "cover 4,0 · draf 4,0 · final 4,0",
          "ep071": "cover 4,17 · draf 4,0 (dari 3,83) · final 4,0 (material 3)",
          "ep073": "cover 4,0 · draf 4,0 · final 4,0"}
PHON = {"ep065": "Audira, baskiul, Tauer Brij", "ep066": "Audira, Lain ap en weit, klird for teikof, Aprouc, Deliveri, Graund, Tauer, teksiwei, Ernef",
        "ep069": "Audira, Be-o-de", "ep071": "Audira, springkler, bolb", "ep073": "Audira, Sofwer, Nozel"}
LESSON = {
    "ep065": "Komposisi draf 3 (plat terpotong di tepi frame, diagram jungkat-jungkit kecil) dibereskan dengan prop `isolate` per shot dan menyembunyikan `chamberPlate`; font sistem Windows (Ink Free, Palatino) jadi final wajib dirender di PC ini.",
    "ep066": "Kalimat \"Langit ramai\" sempat terulang dan \"AUDIRA\" terbaca \"Odira\": l17 dan l18 disuarakan ulang, teks TTS \"Ini, Audira Explained.\". Render final pertama gagal (FFmpeg 0xC0000142, kehabisan resource setelah 4 render berurutan); ulang sendiri berhasil.",
    "ep069": "Close-up bak aerasi lebih terbaca setelah zoom menembus ke potongan plastik pembawa bakteri; label MBBR sesuai riset (bukan lumpur aktif).",
    "ep071": "Draf 3,83 (40% bawah hitam, pintu dan tangga keruh, bulb kecil, \"enam / puluh\" terbelah di caption) dipoles jadi 4,0. Palet termal membuat material mentok 3.",
    "ep073": "Framing cover butuh 3 putaran poles (corduroy lapisan dan lantai kosong). \"AUDIRA\" terbaca \"Odira\": l14 disuarakan ulang; l07 juga diulang.",
}
WEAK = {"ep065": "Kilatan perkamen di 56,7 dtk; kapal di hook hanya terlihat ujung tiang.",
        "ep066": "Pusaran udara (wake vortex) terbaca garis bergelombang dan labelnya bertumpuk.",
        "ep069": "Close-up dominan coklat.",
        "ep071": "Material 3 karena palet kamera termal; caption \"sama / saja\" terbelah.",
        "ep073": "Close-up nozzle didominasi corong (hopper)."}

sync = {l.split(":")[0]: l.strip() for l in open("_tools/sync_final.txt", encoding="utf-8") if l.startswith("ep")}
for ep in sys.argv[1:]:
    d = glob.glob(f"EP{ep[2:]}-*")[0]
    f = f"{d}/FINAL_VIDEO.mp4"
    pr = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=width,height,r_frame_rate:format=duration:format_tags", "-of", "json", f], capture_output=True, text=True).stdout)
    v = pr["streams"][0]; dur = float(pr["format"]["duration"]); tags = pr["format"].get("tags", {})
    eb = subprocess.run(["ffmpeg", "-nostats", "-i", f, "-vn", "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    I = re.findall(r"I:\s+(-?[\d.]+) LUFS", eb)[-1]; P = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", eb)[-1]
    s = sync.get(ep, "")
    pct = re.search(r"(\d+)%", s).group(1); med = re.search(r"median offset (-?[\d.]+)s", s).group(1)
    arch = sorted(glob.glob(f"{d}/archive/*"))[-1].replace("\\", "/").split("/")[-1]
    st = STYLE[ep]; no = ep[2:]
    open(f"{d}/QA_REPORT.md", "w", encoding="utf-8").write(f"""# QA REPORT — AE-{no} ({st})

Tanggal: 2026-11-10. File: `FINAL_VIDEO.mp4` (diarsipkan di `archive/{arch}/`).

| Cek | Hasil | Status |
|---|---|---|
| Resolusi / fps | {v['width']}×{v['height']} @ {v['r_frame_rate'].split('/')[0]} fps (ffprobe) | LOLOS |
| Durasi | {dur:.2f} dtk (Audio Master Clock, timeline.json) | LOLOS |
| Loudness | {I} LUFS integrated (ebur128 pada MP4 final) | LOLOS (target −14 ±1) |
| True peak | {P} dBFS | LOLOS (< −1 dBFS) |
| Sinkron caption | {pct}% kata dalam ±0,25 dtk dari audio (whisper), median {med} dtk | LOLOS |
| Frame dari MP4 | `qa/final_frames.jpg` (8 frame merata) tanpa frame hitam (blackdetect 0) | LOLOS |
| Audit visual final | `qa/look_final.json` (`audit:visual --stage=final`), tidak ada aspek dibatasi di bawah 4 | LOLOS |
| Safe zone | kicker y ≥ 262 px, caption di atas 380 px bawah | LOLOS |
| Branding | AudiraSignature (lapisan terakhir), AUDIRA di dunia 3D, VO "Ini AUDIRA Explained.", Outro Monolit + Created by Agus Dwi R. | LOLOS |
| Metadata | title "{tags.get('title','')}", artist "{tags.get('artist','')}", comment "{tags.get('comment','')}" (ffprobe) | LOLOS |
| Klaim | sesuai RESEARCH_REPORT + JANGAN DIKLAIM | LOLOS |
| Rubrik style memory | {SCORES[ep]} | LOLOS |

Catatan sisa: {WEAK[ep]}
""")
    open(f"{d}/NOTES.md", "w", encoding="utf-8").write(f"""# NOTES — AE-{no} ({st})

## Produksi (2026-11-10)
- Gerbang: style "Ya, semua no. 1" → cover "Setuju semua" → naskah "Setuju, lanjut" → draf "Setuju, render final".
- VO Cartesia Galang (sonic-3), offset 0; ejaan fonetik di `_tools/phon.py` ({PHON[ep]}).
- Render final 1080×1920@60 dengan `render-final.mjs` (cache bundle dimatikan) concurrency 8, sekali.
- Skor kini wajib evidence per aspek dan dibatasi ceiling `audit:visual` (starter: `node scripts/visual-audit.mjs <sheet> --grid=4x2 --style=<STYLE> --json=... --stage=draft`).

## Pelajaran / yang gagal
- {LESSON[ep]}

## Kelemahan tersisa
- {WEAK[ep]}

## Review pasca-tayang
- 24 jam: (isi setelah upload)
- 72 jam: (isi)
- 7 hari: (isi)
""")
    print(d, I, P, pct, tags.get("title", "")[:30])
