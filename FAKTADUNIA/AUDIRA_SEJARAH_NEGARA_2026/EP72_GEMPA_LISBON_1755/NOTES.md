# NOTES — EP72 Gempa Lisbon 1755 (MOSAICFORGE, Remotion + R3F)

## Tahap 8 draf (s5, 2026-11-24)
- Putaran juri 1: 3.33 PERLU POLES (L3 M3 D4 C3 Mo5 R2). G22 gagal: F1 hook hanya mural azulejo (dibaca "dinding ubin generik"), F4 api kecil.
- Poles: backdrop tessera menghadap kamera di semua adegan (flat planes 36% -> 25%); hook pakai kamera miring + 3 rumah GLB miniatur bergetar di depan mural; api atap size 1.05, menyebar 39.3 + 0.12 dtk per rumah; fasad S11 lengkap 78.2 dtk; S8/S11 hemi 0.45, key raking lebih kuat.
- Putaran juri 2: **3.83 LOLOS** (L4 M3 D4 C3 Mo5 R4). Self 3.67.
- Sisa lemah (juri): hook F1 masih tampak dinding ubin + atap terpotong; material dibatasi ceiling 3 (outro card + papan dermaga datar); figur toy terbaca plastik.

## Tahap 9 final (s6, 2026-11-24)
- Acc pengguna "Gas render" setelah contact sheet draf 3.83, durasi 89,5 dtk, G18c lolos.
- Render: percobaan 1 gagal di channel gate (file sisa template `src/scenes/news/PenggantiGibranWapres.tsx` handle "@audira", bukan bagian LisbonFinal) → `--skip-channel` dengan alasan. Percobaan 2 `--concurrency=2` crash `part 2 failed ... Error: write EOF`. Percobaan 3 `--concurrency=1 --jobs=6` sukses: 5370 frame dalam 228 dtk.
- Audio: G18c VO -16,1 LUFS, SFX ter-duck -32,2 LUFS, selisih 16,1 LU. Master -13,6 LUFS, TP -1,8 dBFS.
- `FINAL_EP72_GEMPA_LISBON.mp4` 1080×1920 @ 60, 89,51 dtk; metadata kepemilikan dicek ffprobe; tanda tangan Ed25519 VALID (`.sig.json`).
- Cek frame: `draft/FINAL_SHEET.jpg` (11 frame), outro AUDIRA tampil, tidak ada frame hitam.
- Skor final: self 3.83, **juri buta 3.83 LOLOS** (L4 M3 D4 C4 Mo5 R3). Kelemahan juri: beberapa beat tidak menunjukkan isi VO (F1 mural ubin, F8 rangka gaiola tanpa pasukan, F9 bidang ubin untuk kuesioner); figur manekin tampak plastik polos.
- Dibersihkan: klip cek draf, `_stills`, segmen render, raw final tanpa tag.

## Tahap 10 delivery (s6)
- `SOCIAL_CAPTIONS.md` 6 platform + Jadwal Upload (WIB) + Label Konten AI, validator ok.
- `SUBTITLES.srt` dari vo-words.json, ejaan fonetik TTS dikembalikan (1755, Marquis, Baixa, gaiola).
- Jadwal default Senin 18 Januari 2027 19.00 WIB (lanjut urutan harian seri dari EP60 6 Jan 2027).
- Lessons: MOSAICFORGE failed (beat abstrak / figur plastik), GLOBAL fix (render concurrency 1, channel gate file sisa template).

## Review terjadwal
- `review-gempa-lisbon-1755-24h` (19 Jan 2027 19.00 WIB)
- `review-gempa-lisbon-1755-72h` (21 Jan 2027 19.00 WIB)
- `review-gempa-lisbon-1755-7d` (25 Jan 2027 19.00 WIB)
Jika upload diundur, ubah jadwal dengan update_scheduled_task.
