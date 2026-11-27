# Asset Candidates — Cara Kerja Skala Gempa: Beda Magnitudo dan Intensitas

> Dicari via `audira_search_assets` (2026-11-27). Katalog tidak memiliki seismograf, bangunan rusak/reruntuhan, patahan bumi, atau model geologi. Topik ini sangat infografis-driven.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Dua rumah: goyang vs runtuh, angka "32×" | `two-storey-family-house-c63c4a` / building, `townhouse-row-unit-b9544b` / building | Rumah utuh vs rumah "miring" (animasi kode); reruntuhan tidak ada di katalog, buat prosedural. HUD "32× ENERGI" |
| c01_intro | Dua panel: seismograf + peta zona intensitas | — | Seismograf 2D (ilustrasi jarum + kertas); peta Indonesia generik 2D dengan zona warna. Tidak ada GLB seismograf |
| c02 | Seismograf drum 1935, gelombang amplitudo naik 10× | — | Seluruhnya 2D: animasi jarum seismograf, grafik amplitudo logaritmik. Tanpa wajah (rule 15) |
| c03 | Patahan bumi terbelah, panah luas + geser | `rock-terrain-blob-ff95a3` / prop | Patahan bumi prosedural/2D lebih jelas; batu sebagai hiasan permukaan saja |
| c04 | Tangga energi M5→M6→M7, ikon kedalaman/jarak/tanah | — | Infografis 2D murni: tangga energi, ikon lucide (ArrowDown, MapPin, Layers) |
| c05 | Peta Indonesia + lingkaran konsentris MMI I–XII | — | Peta 2D generik (batas tanpa logo); skala Romawi vertikal; warna merah→kuning→hijau |
| c06 | Peta Indonesia, titik Aceh + Cianjur menyala | — | Peta 2D sama dengan c05; callout HUD per gempa |
| c07_payoff | Infografis utuh magnitudo vs intensitas, outro AUDIRA | — | Layar split 2D; outro card `audira-outro-card.svg` |

Saran engine: **2D** — topik ini 90% infografis (formula, tangga energi, peta intensitas, skala MMI), dan katalog GLB tidak memiliki aset relevan (seismograf, reruntuhan, patahan). Style DATAPHYSICAL atau SCALEFORGE (2D mode) paling cocok. 3D hanya masuk akal untuk diorama kota goyang di hook, tapi sisanya tetap 2D.
