# Design System: Selembar Kertas

## Warna

| Token | Hex | Pakai |
|---|---|---|
| Tinta | `#1E1B18` | Teks, label atas |
| Kertas | `#F7F1E2` | Kartu dan caption |
| Cap merah | `#C8321F` | Kata aktif, terdakwa, cap |
| Hijau temuan | `#1F6B4B` | Keterangan saksi, hasil uji |
| Kraft | `#C9AD85` | Meja |
| Oranye kerumunan | `#E2501F` | 18 persen |
| Hijau hutan brand | `#0B3D2E` | Outro |

## Tipografi

| Peran | Font |
|---|---|
| Kutipan dan judul | EB Garamond 800 |
| Angka | Oswald 700 |
| Label perkara | IBM Plex Mono 700 |
| Caption | Archivo Black |
| Contoh huruf yang dibahas | Times New Roman |

Nama font ditulis langsung di tiap aturan CSS, karena font lewat variabel CSS gagal saat render.

## Layout 1080 x 1920

- Area atas aman 180 px, panel mulai 238 px.
- Panel berhenti di tepi kanan 110 px dari bingkai, agar tidak tertutup tombol platform.
- Caption berakhir di 1540 px, jadi 380 px bawah tetap kosong.
- Subjek 3D diletakkan di bawah panel dan di atas caption.

## Gerak

- Panel berputar turun dari tepi atasnya seperti map yang dibalik.
- Benda 3D bangkit dari lantai dengan pantulan kecil.
- Kata aktif berubah merah dan naik 5 px sesaat.
