# ART_DIRECTION — EP21 Bug Y2K

Style: TERMINAL · Engine: Remotion 2D · 1080×1920 · Channel AUDIRA TECH (@AudiraTECH)

## Palet (kit TERMINAL)
| Peran | HEX |
|---|---|
| Latar tabung | #040806 |
| Fosfor hijau (utama) | #3DFF8C |
| Hijau redup (garis, bingkai) | #1F8A52 |
| Hijau samar (grid, hex rain) | #0E3A24 |
| Amber (angka/peringatan sedang) | #FFB547 |
| Alert magenta-merah (galat, 1900, 1901) | #FF3D7F |
| Putih fosfor (angka besar) | #D8FFE8 |

## Tipografi
- Judul/angka raksasa: VT323 ('Term Head'), 120–420 px.
- Log, label, caption: JetBrains Mono ('Term Mono') 700, 30–56 px.

## Lapisan
- BG: HexRain (opacity 0.16) + grid fosfor samar.
- MG: objek adegan (jam sistem, grid memori inti, kotak tanggal, jendela ALERT, register bit, skyline piksel).
- FG: callout kinetik (kartu data), stempel, glitch slice di tiap potongan.
- HUD: prompt rail atas `audira@tech:~$ ./y2k.sh` + penanda babak `[01/08]` (brand di dalam adegan).
- Caption karaoke: blok prompt y 1290–1520, kata aktif = blok hijau terbalik.
- Kaca: CRT (scanline, grain, vignette) paling atas sebelum signature.

## Gerak
- Kamera drift kontinu tiap adegan (scale 1→1.06 + pan pelan), glitch 0.15 dtk di tiap potongan.
- Masuk: ease-out expo / spring; teks diketik 38 cps; shake pada alert & overflow.
- Merah alert hanya untuk "salah baca" (1900, 19100, 1901, overflow).

## Safe zone
Konten adegan y 200–1260; caption 1290–1520; 380 px bawah bersih; prompt rail tipis di y 110–170.
