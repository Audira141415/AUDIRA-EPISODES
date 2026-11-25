# NOTES — EP58 Mongolia, Kuda Lebih Banyak dari Manusia

Style: POLYVERSE (Remotion + R3F 3D). WORLDFORGE gagal juri 2× (3,33) sebelumnya (G21 → POLYVERSE).

## Draf
- WORLDFORGE r2: juri buta 3,33 (L3 M2 D4 C3 Mo5 R3) → < 3,5 setelah 2 putaran → ganti style. Arsip di `style/_worldforge/`.
- POLYVERSE r1: juri buta LOLOS 3,83 (L4 M4 D3 C3 Mo5 R4), self 4,0. Aset low-poly faset cocok dengan bahasa visual style, jadi material tidak lagi terlihat "murah".
- Klip kamera pertama kosong (frame hitam) karena RAM penuh → render ulang dengan `--concurrency=1` → motion 5.
- qa-scene PASS; qa-video 2 KEDIP salju dekat lensa ditandai ok (`draft/qa/qa-video.review.json`).

## Final (2026-11-24)
- Acc pengguna "Gas render final" (2026-11-24).
- `FINAL_EP58_MONGOLIA_KUDA.mp4`: 1080×1920 @ 60, 5160 frame, 86,0 dtk, −13,7 LUFS, TP −1,8 dBFS. Metadata kepemilikan + Ed25519/C2PA ditulis (ffprobe dicek s7).
- Render final perlu `--skip-channel`: scaffold `PenggantiGibranWapres.tsx` (sisa template) membawa handle channel yang salah.
- Juri buta final 3,83 (L3 M4 D3 C4 Mo5 R4), contact sheet `draft/final_qa/FINAL_SHEET.jpg`. Ceiling look final: lighting 3, depth 3 (`FINAL_EP58_MONGOLIA_KUDA.look.json`, pemisahan subjek 24 vs cover 38).
- Kelemahan menurut juri: frame senja pasukan gelap/underlit, frame luas wilayah hanya stepa kosong (angka dibawa kartu saja), kata caption abu-abu kontras rendah di layar HP.

## Audio
- VO Cartesia 83,17 dtk (terkunci), film 86 dtk, offset VO 0. Mix G18 (VO loudnorm −16, SFX stem −26 LUFS + `volume=-4dB`, duck ratio 8). G18c: gap 12,6 LU.

## Pelajaran
- worked: POLYVERSE untuk topik hewan/alam stepa — flatShading `Facets`, MOODS pastel (zenith #3f4f98 → horizon peach), siang exposure 0,96 / env 0,32 / sun #ffbf8a 3,9, filter CSS contrast 1,07 + saturate 1,12.
- failed: lighting & depth mentok 3 — butuh rim light / haze / value contrast antara kuda dan tanah; adegan senja terlalu gelap.
- fix: klip kamera kosong saat RAM penuh → `--concurrency=1`.
- fix: hapus komposisi scaffold sisa template (atau pakai `--skip-channel`) sebelum render final.

## Upload & review
- Jadwal: Senin, 4 Januari 2027, mulai 19.00 WIB (lihat `SOCIAL_CAPTIONS.md`).
- Jam upload dikonfirmasi pengguna (s7): Senin, 4 Januari 2027, 19.00 WIB.
- File perantara dihapus s7 (project/out/seg, dbg, t1–t3, draft/_stills, klip draf MP4, qa-clean.mp4, sfx_prev.wav). Sisa: final, contact sheet, VO, docs.

## Review terjadwal
- `review-mongolia-kuda-24h` — Selasa, 5 Januari 2027, 19.00 WIB
- `review-mongolia-kuda-72h` — Kamis, 7 Januari 2027, 19.00 WIB
- `review-mongolia-kuda-7d` — Senin, 11 Januari 2027, 19.00 WIB
Task hanya jalan saat aplikasi Claude terbuka (bila tertutup, jalan saat dibuka lagi).
