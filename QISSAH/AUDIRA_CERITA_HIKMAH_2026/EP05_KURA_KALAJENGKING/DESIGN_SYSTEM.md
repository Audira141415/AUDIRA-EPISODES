# DESIGN SYSTEM — EP05

## Warna
| token | hex | pakai |
|---|---|---|
| paper | #efe7d6 | latar kertas, kabut |
| ink | #161514 | garis, kalajengking, gunung dekat |
| inkSoft | #3a3834 | tempurung, batu |
| wash | #6d6a62 | tanah, batu datar |
| indigo | #2f3a48 | gunung jauh |
| moss | #4a5a3a | kulit kura-kura |
| cinnabar | #b8321f | sengat, tinta merah, stempel, kata aktif hikmah |
| deep / deepMid | #2b3b49 / #5d7282 | bawah air |
| outro | #0B3D2E | kartu outro |

## Huruf
- **Ma Shan Zheng** (kuas): judul, teks hikmah, kalimat penutup, isi stempel.
- **Shippori Mincho B1** 700/800: caption, label penutur, kicker "CERITA HIKMAH" / "HIKMAH", kredit outro.
- Nama font ditulis literal, dimuat lewat `@remotion/google-fonts` (subset latin).

## Caption (koordinat 1080×1920)
- Blok mulai y 1255: label penutur (kotak warna + huruf kapital berjarak), lalu baris 50 px di atas pita kertas semi-transparan; kata aktif berwarna penutur dan naik 3 px.
- Warna penutur: Narator #2f4a63, Kura-kura #46613a, Kalajengking #a42a1a.
- Frase maks 6 kata, dipotong di tanda baca.
- Hikmah (s9c–s9f): caption biasa diganti blok kuas besar y ~1090–1450, kata muncul saat diucapkan, kata aktif merah; "naik" terangkat, "turun" turun.

## Safe zone
Tidak ada elemen penting di atas y 180 atau di bawah y 1540. Judul y 230–600, subjek 3D y ~300–1250, caption 1255–1500.
