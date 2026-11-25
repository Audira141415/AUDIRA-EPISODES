"""Writes QA_REPORT.md for EP02-EP04 from PROJECT/qc/metrics.json. Run from AUDIRA_IJAZAH_2026."""
import json
from pathlib import Path

for e in ("EP02_FAKTA_RUANG_SIDANG", "EP03_UJI_LABFOR", "EP04_SIDANG_MEMANAS"):
    m = json.load(open(f"{e}/PROJECT/qc/metrics.json"))
    v = m["video"]
    Path(e, "QA_REPORT.md").write_text(f"""# QA Report: {e}

Metrik mentah ada di `PROJECT/qc/metrics.json`.

| Cek | Target | Hasil |
|---|---|---|
| Resolusi | 1080 x 1920 | {v['width']} x {v['height']} |
| Frame rate | 60 fps | {v['r_frame_rate']} |
| Durasi | Sekitar 90 detik | {float(v['duration']):.1f} detik |
| Error decode | 0 | {m['decode_errors']} |
| Freeze lebih dari 2,5 detik | 0 | {m['freezes_over_2.5s']} |
| Frame hitam | 0 | {len(m['black_segments'])} |
| Loudness | -14 LUFS | {m['lufs']} LUFS |
| Puncak sejati | Di bawah -1 dBTP | {m['true_peak_dbfs']} dBTP |
| Suara | Sekitar -16 LUFS | {m['vo_lufs']} LUFS |
| Musik | Sekitar 15 dB di bawah suara | {m['music_lufs']} LUFS |
| Kata caption berisi suara | Tinggi | {m['caption_words_with_voice_pct']} persen |
| Selisih awal kata terbesar | Di bawah 0,2 detik | {m['caption_onset_max_gap_s']} detik |

Diperiksa dari frame MP4: font, area aman, dan warna. Caption: `audira_validate_social_captions` menghasilkan `ok: true`.

Belum diperiksa: pelafalan dan mix belum didengar manusia, video belum ditonton utuh, dan perkembangan setelah 5 November 2026 sekitar 19.00 WIB, termasuk isi sesi Dokter Tifa.
""", encoding="utf8")
    print(e, "ok")
