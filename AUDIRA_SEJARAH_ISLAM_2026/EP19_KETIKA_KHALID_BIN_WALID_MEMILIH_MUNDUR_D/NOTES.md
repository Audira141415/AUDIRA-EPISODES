# NOTES — `Sejarah peradaban Islam yang jarang diketahui` (`EP19`)

> Tahap 10–11. Pelajaran agar episode berikut mulai dari kualitas lebih tinggi. Simpan juga ke motion memory (`append_lesson` worked/failed/fix, `set_best`).

## Yang berhasil (worked)
- Satu meja peta 3D Madinah–Mu'tah–Syria dengan adegan yang berganti (panji, kitab, lentera, 9 pedang patah, karavan mundur, tenda Syria) memenuhi multi-scene tanpa figur manusia dan tanpa darah.
- Lighting, material, depth, motion 4 di juri buta; render:final audit tidak ada aspek di bawah 4.

## Yang gagal (failed) + perbaikan (fix)
- Readability 2 di juri buta (2 putaran): beat abstrak (air mata, sumber berselisih, makna) dibawa kartu teks; finale dari utara menaruh label peta di pita karaoke. Diterima 3.50 setelah 2 putaran (aturan tahap 8). Lain kali: satu objek 3D tegas per beat abstrak, label peta jauh dari y 1200–1450.
- SUBTITLES.srt dari audira_generate_srt menulis angka terucap (enam ratus dua puluh sembilan) dan memotong tahun 638 di dua cue; diperbaiki manual ke digit.

## Teknis
- Offset VO: VO 87.86 dtk, film 91 dtk (5460 frame @ 60). Awal scene: s1 0.06, s2 7.04, s3 17.46, s4 29.13, s5 41.42, s6 54.04, s7 61.87, s8 77.52.
- Parameter render: `npm run render:final -- --comp=KhalidFinal --out=../FINAL_EP19_KHALID_MUNDUR.mp4 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=6 --concurrency=2 --gl=vulkan --encoder=nvenc --skip-memory-gate=<alasan 3.50 setelah 2 putaran>`; 197 dtk render.
- Master: −13.7 LUFS, true peak −1.8 dBFS; G18c VO −16.6 vs SFX ter-duck −31.3 = 14.7 LU.
- Metadata kepemilikan ditulis dan dicek ffprobe (title, artist, copyright, comment AUDIRA-khalid-mundur-EP19, date 2026-11-26).
- Skor final (self) 3.67: lighting 4, material 4, depth 4, composition 3, motion 4, readability 3.

## Final & delivery (s8, 2026-11-26)
- Final: FINAL_EP19_KHALID_MUNDUR.mp4 (1080×1920 @ 60, 91.0 dtk). Acc render dari pengguna 2026-11-26.
- Caption: SOCIAL_CAPTIONS.md lolos validator; tayang Jumat 11 Desember 2026 mulai 19.00 WIB.
- File perantara dihapus: draft/clip-40-58.mp4, project/out/clip-40-58.mp4, project/out/beats3, smoke, cover2.
- Scheduled task review: review-khalid-mundur-24h, review-khalid-mundur-72h, review-khalid-mundur-7d.

## Pasca-tayang (24j / 72j / 7h)
| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |

## Draf s7 (2026-11-26) — diterima 3.50 setelah 2 putaran
- Juri buta putaran 1 dan 2: lighting 4, material 4, depth 4, composition 3, motion 4, readability 2 (rata 3.50). Self 4.0.
- Kelemahan: beat abstrak (F6 air mata, F9 sumber berselisih, F14 peristiwa tercatat) dibawa kartu teks di atas peta miring; finale 82–86 dtk dari utara menaruh Mu'tah/Syria di pita karaoke.
- Perbaikan s7: relief ×0.3, label peta pin ▲/▼ + anti-tabrakan + clamp, karavan/kolom diperbesar, label PASUKAN MUNDUR 46–56 dtk, suar cahaya + busur emas tinggi di finale, plakat AUDIRA menghadap kamera (t ≥ 52), CATATAN SUMBER 38 px.
- Audio: sfx.wav −28 LUFS; G18c VO −16.6 vs SFX ter-duck −31.3 = 14.7 LU. Kamera klip 40–58 dtk: 4/5 (draft/camera.json).
- Cover: style/cover-topic.png = KhalidCover 2 dtk.

## Review terjadwal
- review-khalid-mundur-24h: Sabtu 12 Desember 2026, 19.00 WIB
- review-khalid-mundur-72h: Senin 14 Desember 2026, 19.00 WIB
- review-khalid-mundur-7d: Jumat 18 Desember 2026, 19.00 WIB
- Dasar: upload Jumat 11 Desember 2026, 19.00 WIB (slot pertama). Bila upload diundur, geser dengan update_scheduled_task.
