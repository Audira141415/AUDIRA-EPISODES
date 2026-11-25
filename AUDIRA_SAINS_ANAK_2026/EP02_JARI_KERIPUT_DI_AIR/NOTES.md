# NOTES — `Sains "kenapa" untuk umum & pelajar: fisika, biologi, kimia, bumi, astronomi` (`EP02`)

> Tahap 10–11. Pelajaran agar episode berikut mulai dari kualitas lebih tinggi. Simpan juga ke motion memory (`append_lesson` worked/failed/fix, `set_best`).

## Yang berhasil (worked)
- HUD bertumpuk LANGKAH 1–3 (saraf → pembuluh → bantalan) dan kartu angka per fakta (1935, 12%, 2014, 2025) membuat mekanisme mudah dibaca.
- Kamera audit 5/5: 8 CUTS + subcut dengan dip 0,16 dtk. Final: 13 cut terencana terdeteksi, 0 cut liar.

## Yang gagal (failed) + perbaikan (fix)
- Ujung jari prosedural terbaca kapsul plastik (material 3). Episode berikut: GLB tangan nyata untuk close-up.
- Adegan ban/kelereng 55–70 dtk terlalu gelap; qa-video menandai BLACK (false positive). Episode berikut: angkat exposure/rim light di latar microscopyVoid.
- G19: FilmScene.tsx belum memasang `<QaProbe />` → fix ditambahkan. `--cuts` harus memuat semua CUTS timing.ts; subtitle di-ignore `0,0.62,1,0.82`.
- Render `--jobs=6 --encoder=nvenc` gagal `write EOF` karena EP59 & EP060 render bersamaan → `--jobs=2 --encoder=x264` (358 dtk).
- Channel gate tersandung file template `src/scenes/news/PenggantiGibranWapres.tsx` (handle @audira) → `--skip-channel` beralasan. Bersihkan file template ini dari starter.

## Teknis
- Offset VO: 0 (VO 84,66 dtk, film 88 dtk, outro 3 dtk)
- Parameter render: `--jobs=2 --concurrency=2 --gl=vulkan --encoder=x264`, G18 mix, −13,7 LUFS, TP −1,8 dBFS
- Skor: juri draf 3,83 (diterima setelah 2 putaran), final self 3,83 (material 3)

## Pasca-tayang (24j / 72j / 7h)
| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |

## Draf NANOFORGE (s6, 2026-11-24)
- Juri buta putaran 1: 3.83 LOLOS; putaran 2 (setelah poles HUD): 3.67. Diterima 3.83 setelah 2 putaran.
- Lemah (juri): ujung jari prosedural terbaca kapsul plastik, ban F8 gelap & minim detail, mangkuk F9 kecil.
- G18c 13.0 LU (VO/SFX tidak berubah sejak s5). Durasi 88 dtk.

## Jadwal review (scheduled task, Auto mode)
- Upload: Rabu 25 Nov 2026 19.00 WIB
- review-jari-keriput-24h: 26 Nov 2026 19.00 WIB
- review-jari-keriput-72h: 28 Nov 2026 19.00 WIB
- review-jari-keriput-7d: 2 Des 2026 19.00 WIB
