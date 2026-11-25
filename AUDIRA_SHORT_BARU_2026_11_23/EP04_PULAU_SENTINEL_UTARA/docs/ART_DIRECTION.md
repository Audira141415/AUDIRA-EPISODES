# ART DIRECTION — EP04 Pulau Sentinel Utara

Style: PAINTERLY
Engine: Remotion 2D murni (SVG + DOM berlapis, tanpa R3F). Kit PAINTERLY dipakai sebagai resep material & mood
(Hukum Mutlak 5): lukisan minyak/gouache, golden hour hangat, bayangan violet dingin, painted rims, sapuan kuas.
Lingkungan tetap mengikuti fakta topik (pulau karang berhutan, Teluk Benggala, Andaman). Ganti style dari CHRONICLE
(gagal juri 2 putaran, 3.67) — G21. Acuan: `style/cover-reference-painterly.jpg`.

## Bahasa visual
- Filter cat global `#paint` (Film.tsx) di pembungkus semua adegan: tepi bergoyang (displacement) + 2 lapis
  variasi nilai sapuan. Teks, callout, dan karaoke berada di luar filter supaya tetap tajam.
- Tekstur: anyaman kanvas (overlay 0.22) + sapuan terang/gelap (`Strokes`, blend normal) supaya area gelap juga
  bertekstur cat.
- Cahaya: key light hangat kiri-atas (soft-light emas), bayangan violet rgba(62,36,96,.46), rim emas #FFB45E di
  penghuni pulau, rim cyan #9FE3F0 di orang luar. God rays di S1, S3, S7, S8, S11.
- Figur: siluet violet gelap #2B1C2E tanpa wajah. Tidak ada foto, tidak ada kekerasan. Kasus 2018 = perahu kecil
  memudar di luar cincin 5 km.
- Beat visual wajib: S8 ombak tsunami naik di cakrawala lalu surut + palem tumbang & papan; S9 kuman hijau besar
  datang dari perahu luar dan tertahan di cincin 5 km; S2 pin Sentinel besar + "TELUK BENGGALA".
- Lapisan: BG langit + rays, MG pulau/karang/kapal, FG vegetasi & figur, HUD callout, karaoke (top 1396).

## Palet
- Golden hour: coral #E9806A → gold #F2B75B → peach #F4C9A8; arsip 1880 amber/umber kaya (#E2B877 → #A87A4A),
  bukan krem keruh.
- Bayangan violet #3E2460; laut teal-biru #2F6A80 → #142C3C; peta teal gelap #15434B.
- Aksen larangan coral merah #FF6B5E; kuman hijau sakit #9BC53D inti gelap #2F3A12.
- Teks: putih #FFFFFF (Anton) dengan stroke gelap; saturasi grade 1.32.

## Tipografi
- Judul/angka: Anton; label: Manrope 800; karaoke: Manrope 800 tanpa kotak, bayangan teks.
- Label ≥ 40 px (final 1080), semua di x 60–1020, tidak di 380 px bawah dan 180 px atas.

## Kamera
- Kamera 2D kontinu: tiap adegan satu gerak termotivasi (push-in, pan lateral, parallax BG 0.2/MG 0.5/FG 1.0).
- Objek pembawa lintas adegan: garis laut + pulau dengan bentuk konsisten.

## Mood per babak
Hook senja berkabut + rays → peta teal → hutan golden hour → bangkai kapal karat → arsip amber 1880 →
kelapa 1991 senja → tsunami gelap + ombak + helikopter → peta cincin larangan + kuman → 2018 riak → outro emas hening.
