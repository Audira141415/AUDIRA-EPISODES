# NOTES — Maraton Paling Kacau, Olimpiade St. Louis 1904 (`EP02`)

Seri SPORTFACTS (@AudiraSportFacts) · style **VINTAGEFORGE** · engine Remotion + R3F · label memori `fakta-olahraga-EP02` · slug `maraton-paling-kacau-1904`.

> Tahap 10–11. Pelajaran agar episode berikut mulai dari kualitas lebih tinggi. Juga tersimpan di motion memory (`append_lesson`).

## Gerbang kualitas
- **Juri draf: 3.5, tidak lolos** (ambang 3.8). Batas 2 putaran juri sudah habis.
- Final tetap dirender **atas perintah pengguna** ("lanjut render") dengan `--skip-memory-gate`. Ini keputusan pengguna, bukan auto-accept.
- **Juri buta final (2026-11-23): rata-rata 3.83, LOLOS.** Skor: lighting 4, material 4, depth 3 (mentok ceiling 3), composition 4, motion 4, readability 4. Sheet: `final/contact-sheet-final.jpg` (8 frame: 1.0 / 12.2 / 20.6 / 38 / 47 / 57.2 / 69.5 / 86 dtk).
- G22 theme check final: bersih, semua subjek frame cocok kata VO.

## Yang berhasil (worked)
- **PoolLight spotlight**: kolam cahaya hangat di subjek, latar sepia lebih redup. Juri menyebutnya bukti lighting 4 (frame 7: pelari + anjing).
- **Cam lift 0.09**: kamera sedikit naik, motion audit 4 (deadPct 0, longestHold 0, medianSpeed 0.168).
- **Weave kain** pada baju pelari: material terbaca vintage, bersama kayu/kuningan kereta dan botol kaca strychnine.
- **Overlay 2D ringan** (kartu callout serif: 32 PELARI, RUTE 40 KM, DISKUALIFIKASI, STRYCHNINE, 3:28:53, LEN TAUNYANE): cerita terbaca tanpa suara (readability 4).

## Yang gagal (failed) + perbaikan (fix)
- **Depth datar** (ceiling 3: separasi subjek 37.9 vs cover 74.3). Latar dinding/tanah kosong, sedikit haze dan oklusi foreground (frame 4, 6). Fix berikut: rim light, haze, DOF, atau prop foreground di setiap adegan.
- Frame 2 (start): pelari depan dan papan "KA" terpotong di tepi kiri. Fix: geser framing atau mundurkan kamera.
- Kartu rute (frame 3) teks kecil "7 BUKIT · 1 TITIK AIR RESMI · ±MIL 12" terlalu kecil di layar ponsel. Fix: naikkan ukuran teks kartu minimal 1,3×.
- Motion: fastPct 11% dan 3.3 jerk/10 dtk (klip draf). Fix: perlambat transisi cepat di 0–3 dtk dan 11 dtk.

## Teknis
- Final: `FINAL_EP02.mp4`, 88,1 dtk, 1080×1920 @ 60, 5286 frame, render 1393,9 dtk (6 paralel, concurrency 2, vulkan, nvenc).
- Audio: in −15,6 LUFS / TP −2,4 → out **−13,6 LUFS, TP −1,8 dBFS** (gain +2,0 dB). Mix G18 dengan `--sfx` + `--vo`.
- Metadata: title, artist, copyright, comment `AUDIRA-maraton-paling-kacau-1904-EP02 | audira.my.id`, date. Tanda tangan Ed25519 (key 498c3302271aadce) VALID, C2PA tertanam.
- Perantara dihapus 2026-11-23: `studio/out/ep02-draft`, salinan `studio/out/ep02`.

## Jadwal upload
Selasa 24 Nov 2026 (WIB): TikTok 19.00 → Instagram Reels 19.20 → YouTube Shorts 19.40 → Facebook Reels 20.00 → X 20.20 → Threads 20.40.

## Review terjadwal
| Titik | Waktu (WIB) | taskId |
|-------|-------------|--------|
| 24 jam | Rabu 25 Nov 2026 19.00 | `review-maraton-paling-kacau-1904-24h` |
| 72 jam | Jumat 27 Nov 2026 19.00 | `review-maraton-paling-kacau-1904-72h` |
| 7 hari | Selasa 1 Des 2026 19.00 | `review-maraton-paling-kacau-1904-7d` |

Task hanya berjalan saat aplikasi Claude terbuka; bila tertutup, task jalan saat aplikasi dibuka lagi.

## Pasca-tayang (24j / 72j / 7h)
| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |
