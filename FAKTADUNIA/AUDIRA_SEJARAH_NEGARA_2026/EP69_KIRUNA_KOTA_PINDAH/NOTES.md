# NOTES — EP69 Kiruna, Kota yang Dipindah karena Tambang (HD2D, Remotion + R3F)

## Tahap 8 draf (s4, 2026-11-24)
- Juri buta putaran 1: **4.17 LOLOS** (L4 M4 D5 C3 Mo5 R4), self 4.17. Kelemahan: frame 38.5 dtk subjek pusat lama/baru kurang jelas, papan PUSAT BARU terpotong; hook 2 dtk gereja terpotong tepi kiri.

## Tahap 9 final (s5, 2026-11-24)
- G18c awal gagal: VO -16.0 LUFS, SFX ter-duck -27.4 LUFS, gap 11.4 LU (< 12). Stem SFX stereo vs VO mono. Fix: `sfx/cues/auto.py` TARGET_LUFS -26 -> -27, `PYTHONUTF8=1 npm run sfx` (tanpa PYTHONUTF8 crash cp1252). Ulang: SFX -28.4, gap **12.4 LU lolos**. Stem lama di scratchpad sesi (tidak diarsip).
- Acc pengguna "Gas render final" setelah contact sheet draf 4.17, durasi 83.6 dtk, G18c lolos.
- Render percobaan 1 gagal di channel gate: file sisa template `src/scenes/news/PenggantiGibranWapres.tsx` handle "@audira". Fix: prop handle dihapus. Percobaan 2 sukses: `--jobs=3 --concurrency=2 --gl=vulkan --encoder=nvenc` (GPU dibagi sesi EP68–72), 5016 frame dalam 1655 dtk, tanpa segmen gelap.
- Master: **-13.6 LUFS, TP -1.9 dBFS**. `FINAL_EP69_KIRUNA_KOTA_PINDAH.mp4` 1080×1920 @ 60, 83.60 dtk. Metadata kepemilikan dicek ffprobe; Ed25519 VALID + C2PA tertanam. `npm run deliver`: GREEN (yellow tersisa: handle ekspresi di `src/templates/MultiSceneDirector.tsx`, template tidak dipakai KirunaFinal).
- Cek frame: `qa/FINAL_SHEET.jpg` (8 frame), outro AUDIRA Fakta Dunia tampil, tanpa frame hitam.
- Skor final: self 4.33; **juri buta 3.67** (L4 M4 D4 C3 Mo3 R4) "PERLU POLES". Kelemahan juri: f4 (37 dtk) shot top-down gereja terpotong tepi; f3 (25 dtk) subjek tambang kecil di frame gelap; f6 (65 dtk) gereja terpotong kiri, kabut; f7 (75 dtk) papan "DI.." terpotong; f1 dan f5 sudut hero hampir sama. Final tidak dirender ulang (render final sekali, sudah di-acc); keputusan poles + render ulang diserahkan ke pengguna.
- Dibersihkan: FINAL_VIDEO.mp4 tanpa tag, `draft/CHECK_44-62s.mp4`, `draft/_stills`, `project/out/seg`.

## Tahap 10 delivery (s5)
- `SOCIAL_CAPTIONS.md` 6 platform + Jadwal Upload (WIB) + Label Konten AI, validator ok.
- `SUBTITLES.srt` dari `project/public/audio/vo-words.json` (29 cue; angka tertulis sebagai kata ucap).
- Jadwal default Jumat 15 Januari 2027 19.00 WIB (lanjut urutan harian seri dari EP60 6 Jan 2027).
- Lessons: HD2D failed (komposisi/motion final) + worked (kartu data + tilt-shift), GLOBAL fix (G18c stem -27, PYTHONUTF8, channel gate file sisa template, jobs 3 saat GPU dibagi).

## Review terjadwal
- `review-kiruna-kota-pindah-24h` (16 Jan 2027 19.00 WIB)
- `review-kiruna-kota-pindah-72h` (18 Jan 2027 19.00 WIB)
- `review-kiruna-kota-pindah-7d` (22 Jan 2027 19.00 WIB)
