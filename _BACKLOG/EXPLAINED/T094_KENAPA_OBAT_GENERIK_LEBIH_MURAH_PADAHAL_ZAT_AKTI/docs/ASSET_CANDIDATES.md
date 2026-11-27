# Asset Candidates — Kenapa Obat Generik Lebih Murah padahal Zat Aktifnya Sama

> Dicari via `audira_search_assets` (2026-11-27). Katalog GLB sangat terbatas untuk farmasi/kimia: tidak ada tablet obat, kotak obat, molekul, laboratorium farmasi, atau apotek. Ada sedikit aset rumah sakit dan tabung sampel. Topik ini jauh lebih cocok 2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Dua kotak obat berdampingan, label harga, molekul identik | — | Tidak ada GLB kotak obat/tablet; ilustrasi 2D (tanpa logo/merek nyata, rule 15) |
| c01_intro | Lab riset: tabung reaksi, siluet tikus, dokumen uji klinis, counter "$985 juta" | `sample-tube-rack-3a32bd` / prop (research-lab kit) | Tabung sampel satu-satunya aset lab; sisanya 2D (counter, kalender, dokumen) |
| c02 | Pabrik obat dengan gembok "PATEN", kalender 20 tahun, pabrik-pabrik baru muncul | `multi-storey-ward-block-2bac82` / building (hospital), `workshop-exhaust-modules-94599c` / building | Simbolis saja; pabrik farmasi tidak ada di katalog |
| c03 | Pabrik generik, resep molekul, uji klinis dicoret → uji BE | — | Diagram 2D lebih terbaca (fase I–III dicoret, kotak BE dengan centang) |
| c04 | Dua kurva konsentrasi obat, angka 80–125%, grafik batang 3–5% | — | Murni infografis 2D: kurva farmakokinetik, angka statistik |
| c05 | Dua tablet beda warna/bentuk, inti molekul sama, lapisan eksipien | — | Tidak ada GLB tablet/pil; 2D berlapis (inti + lapisan luar) |
| c06 | Tangga biaya R&D vs generik, panah kompetisi banyak pabrik | `convenience-store-c30e1d` / building, `three-storey-shophouse-2f6378` / building | Apotek/toko simbolis; diagram tangga biaya 2D |
| c07_payoff | Molekul berputar, dua kotak menyatu, outro AUDIRA | — | Molekul 2D/prosedural; outro card `audira-outro-card.svg` |

Saran engine: **2D** — Hampir semua visual adalah infografis (kurva, diagram, angka statistik, tangga biaya) dan ilustrasi (kotak obat, tablet, molekul) yang tidak ada di katalog GLB. Kandidat style: BONGKAR (2D, cocok untuk "membongkar" harga obat), DATAPHYSICAL (2D, banyak angka/statistik), atau BEDAH (2D, membedah struktur/mekanisme). 3D tidak disarankan karena aset farmasi nyaris tidak tersedia.
