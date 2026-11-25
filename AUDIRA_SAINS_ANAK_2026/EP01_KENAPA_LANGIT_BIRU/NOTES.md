# NOTES — `Sains "kenapa" untuk umum & pelajar: fisika, biologi, kimia, bumi, astronomi` (`EP01`)

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

## Draf s5 (2026-11-24)
- Juri buta: ronde 1 = 3.17 (composition 2: crop tepi papan/molekul/mata, rover di pojok). Ronde 2 = 3.50 → **diterima 3.50 setelah 2 putaran** (aturan 2026-11-23). Aspek lemah: lighting 3, material 3, depth 3, composition 3 (Mars dune polos, cahaya lembut tanpa bayangan panjang).
- Perbaikan s5: Subtitle `width: max-content` (abs + translateX(-50%) membungkus ke 4 baris), kamera Tyndall wide (dist 56/50), hook & Mars senja FOV 46 dengan rover utuh, molekul dirapatkan, bola mata mundur (dist 21/18.5), papan AUDIRA SAINS utuh (dist 16/15), kartu NITROGEN mulai 21.5 (lama).
- G18c: VO −27.5 LUFS mentah → loudnorm −16; SFX stem −26 −4 dB = −30 → VO 14 LU di atas SFX.

## Final s5 (2026-11-24)
- Acc pengguna: "Gas render final" (2026-11-24). Final: `FINAL_LANGIT_BIRU.mp4` 1080×1920 @60, 91 dtk (5460 frame), 157 MB.
- Audio: masuk −16,2 LUFS → keluar **−13,6 LUFS, true peak −1,9 dBFS**. G18c: VO −16,1 / SFX ter-duck −31,4 → gap 15,3 LU.
- Metadata (ffprobe ok): title, artist "AUDIRA (Agus Dwi R.)", copyright, comment `AUDIRA-kenapa-langit-biru-EP01 | audira.my.id`, date. Tanda tangan Ed25519 VALID + C2PA.
- G19: `src/core/scene/FilmScene.tsx` tidak memasang `<QaProbe />` (Stage3D memasangnya) → qa-scene "probe sent nothing". Ditambah satu baris. qa-scene PASS (0 solid ditandai, jadi cek tembus kosong). qa-video 60 CHECK semua dirancang (plate subtitle ganti frasa, kartu crossfade, counter ±1→±8, potongan adegan, outro) → `draft/qa-video.review.json` → PASS.
- Render: gate memori di-override (`--skip-memory-gate`, juri 3.50 setelah 2 putaran), gate channel di-override (`--skip-channel`, temuan hanya di file kit `PenggantiGibranWapres.tsx`). Percobaan pertama OOM Chrome (`--concurrency=2` saat render lain jalan) → ulang `--jobs=6 --concurrency=1`, ±37 fps.
- Skor final (self) 3.50: lighting 3, material 3, depth 3, composition 3, motion 5, readability 4.
- Delivery: `SOCIAL_CAPTIONS.md` lolos validator, `SUBTITLES.srt` 32 cue. Jadwal upload dikonfirmasi pengguna: Rabu 25 Nov 2026 19.00 WIB. Scheduled task tahap 11: `review-kenapa-langit-biru-24h` (26 Nov 19.00), `review-kenapa-langit-biru-72h` (28 Nov 19.00), `review-kenapa-langit-biru-7d` (2 Des 19.00), mode Auto.
- File perantara (`project/out/s4*`, `s5*`, `draft/qa-clean.mp4`) belum dihapus: tunggu pengguna menyetujui hasil final.
- File perantara dihapus 2026-11-24 atas persetujuan pengguna: project/out/s4*, s5*, draft/qa-clean.mp4. Tersisa final, contact sheet, VO, dokumen.
