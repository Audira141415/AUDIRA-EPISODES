# Asset Candidates — Cara Kerja Label Gizi di Kemasan

> Dicari via `audira_search_assets` (2026-11-27). Katalog GLB tidak memiliki kemasan makanan, keripik, tabel gizi, atau rak supermarket modern; semua elemen kunci harus dibuat 2D (ilustrasi vektor/foto cutout).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Kemasan keripik generik, tabel ING close-up | — | Tidak ada GLB kemasan; ilustrasi 2D. Kemasan tanpa logo/merek nyata (rule 15) |
| c01_intro | Tabel ING membesar, tiga piring porsi keripik, timbangan | — | Infografis 2D kinetik; piring/porsi sebagai ilustrasi vektor |
| c02 | Tujuh kartu kinetik zat gizi, kolom %AKG | — | Kartu kinetik + lucide icons (`src/core/icons`) untuk energi, lemak, protein, dsb. |
| c03 | Gelas takar terisi %, infografis lingkaran AKG | — | Diagram 2D (gauge/lingkaran progres) |
| c04 | Dua kemasan generik berdampingan, kolom per 100 g disorot | — | Infografis perbandingan 2D |
| c05 | Stiker peringatan FoP: "TINGGI GULA/GARAM/LEMAK JENUH" | — | Label warning 2D (merah/oranye/kuning); tanpa logo BPOM (rule 15) |
| c06 | Checklist 3 langkah, siluet tangan membalik kemasan | — | Checklist animasi 2D + siluet tanpa wajah |
| c07_payoff | Kemasan diletakkan, tabel ING bersinar, outro AUDIRA | — | Transisi 2D → outro card |

Saran engine: **2D** — topik sepenuhnya konsep + data (tabel, diagram, infografis, kartu kinetik, label peringatan). Objek kunci (kemasan makanan, tabel gizi, stiker warning) tidak ada di katalog GLB. BONGKAR (2D) atau DATAPHYSICAL (2D) paling cocok: visual "membongkar" tabel gizi layer per layer.
