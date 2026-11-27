# NOTES — `Sejarah peradaban Islam yang jarang diketahui` (`EP22`)

> Tahap 10–11. Pelajaran agar episode berikut mulai dari kualitas lebih tinggi. Simpan juga ke motion memory (`append_lesson` worked/failed/fix, `set_best`).

## Yang berhasil (worked)
- <...>

## Yang gagal (failed) + perbaikan (fix)
- <...>

## Teknis
- Offset VO: <...>
- Parameter render: <...>

## Pasca-tayang (24j / 72j / 7h)
| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |

## Draf tahap 8 (Sesi B s8, 2026-11-27)
- Diterima 3.67 setelah 2 putaran (juri buta r1 3.67: L4 M4 D4 C3 Mo4 R3; r2 3.50: L4 M3 D4 C3 Mo4 R3). Self r1 4.0.
- `draft/contact-sheet.jpg` = r1 (skor terbaik, frame 4/17/30/41/51/64/73.8/79.5/86 dtk). r2 di `draft/contact-sheet-r2.jpg` (frame 7 = 70.8 dtk).
- Kode sekarang = r2 (poles di atas r1): segel lilin lebih besar bercincin emas, label RuinStrip 46 px nowrap, air dermaga roughness 0.42, tinta #10162a. Poles r1: s3 key 1.6/fill 0.34, s7 fill 0.38, rak payoff emissive netral 0.1, PayoffLamp 1.3.
- Audit: look ceilings L5 M5 D5 C5 R4 (borderline @handle outro 34 px), diversity 70.7–71.6, crush ≤2.1%, clipHi 0 (outro 1.3). audit:camera s5 (45–62 dtk, 540×960) 4/5, deadPct 0, too fast 41%.
- Kelemahan juri (tidak dipoles lagi sesuai aturan): segel setengah cakram abstrak, beat tinta kurang hitam, rumah blok FG polos, rak buku plastik.

## Tahap 9 · Gerbang render final (Sesi C, s9)
- 2026-11-27: acc pengguna di chat: "Gas render" (setelah melihat contact sheet juri 3.67, durasi 95 dtk, G18c 16 LU). STATUS final approved: true.
- Render final 2026-11-27: `FINAL_EP22_BAGHDAD_1258.mp4` 1080×1920 @ 60, 95.0 dtk, 5700 frame dalam 413 dtk (`--jobs=3 --concurrency=2 --gl=vulkan --encoder=nvenc`). Run pertama ditolak memory gate (juri 3.67 < 3.8); dijalankan ulang dengan `--skip-memory-gate` beralasan (diterima 3.67 setelah 2 putaran, preseden EP57).
- QA: master −13.7 LUFS, true peak −1.8 dBFS; G18c VO −16.8 vs SFX ter-duck −33.5 = 16.7 LU. Metadata kepemilikan (title, artist, copyright, comment `AUDIRA-baghdad-1258-EP22 | audira.my.id`, date) dicek ffprobe. Signature Ed25519 VALID + C2PA. Frame MP4 dicek: hook 1258, tanggul, gambaran sastra (AudiraSignature terlihat), outro AUDIRA QISSAH + Created by Agus Dwi R. Look audit: tidak ada aspek di bawah 4.
- record_score final (self) 3.5: L4 M3 D4 C3 Mo4 R3. Verdict tool "PERLU POLES" tidak dijalankan (aturan: maksimal 2 putaran, diterima ≥ 3.5).

## Tahap 10 · Delivery
- `SOCIAL_CAPTIONS.md` 6 platform + Jadwal Upload (WIB) + Label Konten AI, lolos `audira_validate_social_captions` (0 error). Jadwal default: Rabu 16 Desember 2026, TikTok 19.00 → Threads 20.40 WIB (setelah EP21 di 15 Desember).
- Pelajaran motion memory HISTORYMAP: failed (properti meja primitif terbaca abstrak, pakai GLB nyata sejak tahap 7) dan worked (meja peta + panah kepungan + banjir tanggul terbaca tanpa suara; render jobs=3 saat GPU dibagi).
- Review tahap 11 terjadwal (jalan hanya saat aplikasi Claude terbuka): `review-baghdad-1258-24h` (17 Des 2026 19.00 WIB), `review-baghdad-1258-72h` (19 Des 19.00), `review-baghdad-1258-7d` (23 Des 19.00). Ubah bila jam upload sebenarnya berbeda.
- `SUBTITLES.srt` belum ada di folder episode.
- Bersih-bersih: hapus perantara `project/out/` (beats, beats2, draft, draft2 termasuk clip-s5.mp4, seg, smoke). Disisakan final, contact sheet, VO, dokumen.
