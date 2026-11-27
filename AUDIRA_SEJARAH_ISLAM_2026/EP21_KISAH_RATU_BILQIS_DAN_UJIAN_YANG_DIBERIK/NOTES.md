# NOTES — Kisah Ratu Bilqis dan Ujian yang Diberikan Nabi Sulaiman (`EP21`)

> Tahap 10–11. Style HD2D, Remotion + R3F 3D. Final `FINAL_EP21_RATU_BILQIS.mp4` (1080×1920 @ 60, 91.83 dtk).

## Gerbang render final
- Acc pengguna 2026-11-27 (sesi C s8): "Gas render", setelah melihat contact sheet, skor juri 3.83, durasi 91.8 dtk, G18c.

## Yang berhasil (worked)
- Juri buta draf LOLOS 3.83 (L4 M4 D4 C3 Mo5 R3) di putaran pertama; motion 5 dari 9 set diorama terpisah dengan 8 hard cut di bawah veil lentera.
- Adab visual: semua tokoh sprite pixel tanpa wajah, Sulaiman tidak tampil dekat.
- Plafon highlight di root film (`filter: brightness(0.975)`, puncak 255 jadi 248) menurunkan clipHi semua frame ke 0 tanpa terlihat lebih gelap; ceilings tetap 5.

## Yang gagal (failed) + perbaikan (fix)
- Render final ditolak gate G14: rig 4/5. Penyebab: pose pembuka segmen sesudah cut terlalu jauh dari key kedua (±1 m dalam 0,7–1,1 dtk) di set saba, camp, desert. Fix: pose pembuka didekatkan ke key kedua; semua segmen 5/5. Audit per segmen: `out/rigseg.ts` dibundel esbuild, `npm run audit:rig -- out/rigseg.mjs s<i> --frames=<n>`.
- Render final ditolak gate look.json: clipHi > 0 di 4 frame (kilau sparkle + teks putih outro). Fix: plafon brightness 0.975 di root `BilqisFilm`, lalu `npm run draft -- BilqisPreview --out=../draft`.
- Pelajaran: jalankan rig audit per segmen dan cek clipHi = 0 di sesi B sebelum handover, bukan baru di gerbang final.
- Catatan juri yang tidak dipoles: blur tilt-shift berat di F2/F7, chip PERANG/HADIAH menimpa pin BILQIS di F4, sub-label pixel kecil.

## Teknis
- Offset VO: 0 (VO 88.19 dtk, film 91.81 dtk termasuk outro).
- Parameter render: `audira_render_batch` → render-final.mjs `--jobs=7 --concurrency=2 --gl=vulkan --encoder=nvenc --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav`, ±4 menit.
- Audio: VO −16.8 LUFS, SFX ter-duck −31.7 LUFS, gap G18c 14.9 LU; master −13.8 LUFS, true peak −1.8 dBFS.
- Metadata ffprobe: title, artist "AUDIRA (Agus Dwi R.)", copyright, comment `AUDIRA-ratu-bilqis-ujian-EP21 | audira.my.id`, date 2026-11-27. Tanda tangan C2PA Ed25519 valid.

## Jadwal & review pasca-tayang
- Tayang: Selasa, 15 Desember 2026, mulai 19.00 WIB (TikTok dulu; lihat SOCIAL_CAPTIONS.md).
- Scheduled task: `review-ratu-bilqis-ujian-24h` (16 Des 19.00), `review-ratu-bilqis-ujian-72h` (18 Des 19.00), `review-ratu-bilqis-ujian-7d` (22 Des 19.00).

## Pasca-tayang (24j / 72j / 7h)
| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |
