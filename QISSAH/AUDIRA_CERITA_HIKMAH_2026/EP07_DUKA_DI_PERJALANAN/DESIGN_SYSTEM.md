# DESIGN SYSTEM — EP07

## Warna
| Token | Hex | Pakai |
|---|---|---|
| void | #06070A | latar, bayangan |
| asphalt | #14161A | jalan basah |
| tungsten | #FFE2B0 | lampu jalan, kicker judul, teks HIKMAH |
| moon | #A7BAD3 | rim light |
| red | #FF1E2D | lampu merah, garis judul; highlight hikmah #FF5560 |
| amber / green | #FFAE1A / #25E08A | fase lampu |
| outro | #0B3D2E | kartu outro |
| caption Narator / Jack / Bobby | #E9E1CF / #F0C27A / #9FC1E6 | label pembicara dan kata aktif |

## Tipografi (via @remotion/google-fonts)
- Judul dan caption: **Playfair Display** 700/900 (kata "Perjalanan" italic).
- Kicker dan label pembicara: **Special Elite** (huruf mesin ketik).
- Tulisan tangan catatan: **Caveat** 500 (digambar ke tekstur kanvas 3D).

## Tata letak 16:9 (1920x1080)
- Margin aman aksi 5%. Judul di tengah atas (y 70–270 px).
- Pita caption mulai y = 80% tinggi frame (bawah ~22%): label pembicara di atas, kalimat maksimal 78% lebar, kata aktif berwarna sesuai pembicara.
- Momen hikmah (s8a–s8d): caption bawah disembunyikan. Kalimat italic besar (70 px) tampil di tengah, maksimal 60% lebar, dengan kicker "HIKMAH" dan garis merah.
- AudiraSignature (lapisan terakhir) berpindah antar 4 titik. Di urutan seed "cerita-hikmah-ep07", posisinya kanan-tengah saat judul dan saat hikmah, jadi tidak menimpa judul atau pita caption.
- Outro 3 dtk terakhir: logo `brand/stacked-reversed.svg` (tinggi 300 px) di atas #0B3D2E.
