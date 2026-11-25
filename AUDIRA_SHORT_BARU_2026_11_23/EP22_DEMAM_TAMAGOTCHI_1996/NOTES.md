# NOTES — EP22 Demam Tamagotchi 1996

Style: PIXELSTORY · Channel: AUDIRA TECH (@AudiraTECH) · Engine: Remotion 2D (kit pixelstory)
Offset VO: 0 dtk (detik film = detik VO). VO 82,6 dtk + outro, film 86,726 dtk.

## Hasil
- Draf: self 4.17, juri buta 4.0 LOLOS putaran 1 (lighting 4, material 4, depth 4, composition 3, motion 5, readability 4).
- audit:camera klip 0–18 dtk: 5/5 (parked 0 %, median speed 0,09). audit:visual: tanpa cap.
- SFX: 53 suara, stem −20 LUFS, timing dari `public/audio/ep22/vo.words.json`.

## Pelajaran
- worked/fix: `NearLayer` mengunci FG ke y layar 1530 + lampu pantul bawah; menyelesaikan "bawah frame gelap kosong" yang menggagalkan EP05/EP06.
- failed: composition 3, subjek mikro (telur digital) terlalu kecil di kelas, pegboard, dan panggung; kepala murid tampak belakang terpotong; tag BIP menimpa kepala.
- render:final butuh `--skip-channel="<alasan>"` di batch short tanpa SERIES.json.
- Context: sesi 7 habis tepat setelah Film.tsx; tulis file panjang lebih awal per sesi.

## Review terjadwal (tahap 11)
- review-demam-tamagotchi-1996-24h (24 Nov 2026 21.00 WIB)
- review-demam-tamagotchi-1996-72h (26 Nov 2026 21.00 WIB)
- review-demam-tamagotchi-1996-7d (30 Nov 2026 21.00 WIB)
Task hanya berjalan saat aplikasi Claude terbuka (bila tertutup, jalan saat dibuka lagi).

## Final (2026-11-23)
- `FINAL_VIDEO.mp4` (= `project/out/ep22/FINAL_EP22.mp4`) 1080×1920 @ 60, 5204 frame, −13,6 LUFS, TP −1,9 dBFS, metadata + Ed25519/C2PA VALID.
- qa_video PASS; LONCAT di 31,8 dtk (cangkang kembali pink + LCD hantu pada "Versi") dan 66,7 dtk (stamp RUGI ¥6 MILIAR) disengaja → `--allow`.
- File perantara (stills, klip draf) dihapus; tersisa contact sheet, cover, VO, SFX, dokumen.
