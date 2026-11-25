# DESIGN SYSTEM: Api Bawah Tanah

## Warna

| Token | Hex | Pakai |
| --- | --- | --- |
| Arang | `#120C09` | Latar panel |
| Bara | `#FF6A1F` | Kata aktif, tepi panel, data panas |
| Kabut | `#F2B84B` | Tag sumber, catatan |
| Air | `#6FDCEC` | Semua yang terkait air |
| Tulang | `#F4EBDD` | Teks utama |

Bara dan Air adalah pasangan makna film ini, jadi Air hanya muncul untuk air.

## Tipografi

| Peran | Font | Ukuran |
| --- | --- | --- |
| Judul dan angka | Barlow Condensed 800 | 68-158 px |
| Keterangan | Barlow 600-700 | 33 px |
| Tag dan data | JetBrains Mono 700 | 25-26 px |
| Subtitle | Barlow Condensed 800 | 72 px |

`font-family` ditulis literal karena variabel CSS rusak saat render HyperFrames.

## Safe zone

Panel mulai 190 px dari atas, sisi kanan 110 px. Subtitle berakhir di 1540 px, di atas batas bawah 380 px.

## Penutup

Logo `stacked-reversed.svg` dari kit Monolit AMD di atas hijau hutan `#0B3D2E`, dengan tulisan Created by Agus Dwi R. File `shared/assets/brand/audira-outro-card.svg` tidak dipakai karena masih memuat logo lama.
