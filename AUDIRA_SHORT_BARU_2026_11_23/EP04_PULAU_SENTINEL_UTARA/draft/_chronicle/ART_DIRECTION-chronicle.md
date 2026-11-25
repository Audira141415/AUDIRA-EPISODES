# ART DIRECTION — EP04 Pulau Sentinel Utara

Style: CHRONICLE
Engine: Remotion 2D murni (SVG + DOM berlapis, tanpa R3F). Kit CHRONICLE dipakai sebagai resep material & mood
(Hukum Mutlak 5): siluet dokumenter, cahaya volumetrik, peta relief gelap. Lingkungan tetap mengikuti fakta topik
(pulau karang berhutan, Teluk Benggala, Andaman). Ganti style dari PAPERWORLD (gagal juri 2 putaran, 3.83) — G21.

## Bahasa visual
- Siluet hitam pekat (#0C0A09) dengan kontur cahaya tipis: emas #F6B93B untuk penghuni pulau (filter `rim-gold`),
  cyan #8FDCEB untuk orang luar / kapal / helikopter (filter `rim-cyan`). Tidak ada wajah, tidak ada foto.
- Key light terarah dari matahari/latar: cast shadow panjang di tanah (komponen P/Layered), god rays (`Rays`) di
  S1, S3, S7, S8, S11. Langit bergradasi senja/pagi, kabut atmosferik di antara lapisan.
- Peta (S2, S9, S10): relief teal gelap #0B1F25 dengan garis pantai terang, pin emas, cincin 5 km putus-putus.
- Lapisan: BG langit + rays, MG pulau/karang/kapal, FG vegetasi siluet & figur, HUD callout, karaoke.
- Grade film: soft-light warm, vignette, grain seeded statis (Film.tsx).
- Kekerasan tidak ditampilkan. Kasus 2018 = perahu kecil memudar di luar cincin 5 km.

## Palet
- Langit senja: coral #E9806A → gold #F2B75B; pagi kabut peach #F4C9A8; malam/tsunami teal gelap #0B1F25.
- Siluet #0C0A09; kontur emas #F6B93B (suku) / cyan #8FDCEB (luar); aksen larangan coral merah #FF6B5E.
- Teks: putih #FFFFFF (Anton) + subjudul/bar emas; tanpa kartu kertas.

## Tipografi
- Judul/angka: Anton; label: Manrope 800; karaoke: Manrope 800 tanpa kotak, bayangan teks.
- Label ≥ 40 px (final 1080), semua di x 60–1020, tidak di 380 px bawah dan 180 px atas.

## Kamera
- Kamera 2D kontinu: tiap adegan satu gerak termotivasi (push-in, pan lateral, crane, parallax BG 0.2/MG 0.5/FG 1.0).
- Objek pembawa lintas adegan: garis laut + pulau dengan bentuk konsisten.

## Mood per babak
Hook pagi berkabut + rays → peta teal gelap → hutan senja berkontur emas → bangkai kapal karat cyan → arsip sepia
1880/1991 → tsunami gelap + helikopter → peta cincin larangan → outro emas hening.
