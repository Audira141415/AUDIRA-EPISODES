# DESIGN SYSTEM — EP06 Jessica

## Warna
| Token | Hex | Pakai |
|---|---|---|
| paper | #FAF6EF | dasar kertas, kartu caption, margin |
| ink | #2E2925 | teks caption |
| narator | #3F6F96 | label + kata aktif narator |
| budi | #55606F | label + kata aktif Budi |
| jessica | #D0603F | label + kata aktif Jessica |
| hikmah | #C0563F | baris "Tidak selalu ada lain kali." |
| ochre | #E8AB48 | garis di bawah judul, gaun Jessica |
| night sky | #4A5F8E | langit malam |
| grief | #8C98AC | langit duka |
| outro | #0B3D2E | latar outro |

## Tipografi
- Judul, hikmah, penutup: **Fraunces** italic 500/600 (serif buku cerita), `@remotion/google-fonts/Fraunces`.
- Caption, label, kicker: **Nunito** 800 (bulat, mudah dibaca), `@remotion/google-fonts/Nunito`.
- Nama font ditulis literal ("Fraunces", "Nunito").

## Caption
- Kartu kertas krem 90% dengan sudut tak rata (radius 38/30/42/28), garis tepi grafit tipis, bayangan lembut.
- Label pembicara 24 px kapital spasi 5; teks 48 px, maksimal 7 kata per frasa; kata aktif berwarna pembicara dan naik 3 px.
- Posisi: top 1265 px (blok ~1265-1450) pada kanvas 1080x1920.

## Safe zone (1080x1920)
- Tidak ada yang penting di atas y 180 atau di bawah y 1540. Judul mulai y 230.
- Subjek 3D di y ~300-1250 (kamera melihat sedikit di bawah wajah agar subjek naik).
- Kartu hikmah top 1160, kartu penutup top 1180; outro di tengah.
