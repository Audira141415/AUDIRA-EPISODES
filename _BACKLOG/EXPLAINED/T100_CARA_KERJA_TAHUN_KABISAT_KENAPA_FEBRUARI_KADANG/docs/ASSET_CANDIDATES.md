# Asset Candidates — Cara Kerja Tahun Kabisat: Kenapa Februari Kadang 29 Hari

> Dicari via `audira_search_assets` (2026-11-27). Katalog GLB tidak punya model globe Bumi, Matahari, scroll Romawi, atau katedral Eropa yang cocok. Topik ini sangat abstrak (angka, aturan, kalender) sehingga 2D jauh lebih efektif.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Globe Bumi mengorbit Matahari, counter angka | `classroom-globe-16a96e` / prop (globe dekoratif, bukan planet) | Globe hanya simbolis; orbit + counter lebih terbaca di 2D prosedural |
| c01_intro | Kalender Februari, counter 6 jam × 4 | `wall-clock-0c555c` / prop | Kalender dan counter = tipografi kinetik 2D |
| c02 | Scroll Romawi, peta Mediterania, "46 SM" | `lefthand-item-30f012` / ultra (buku), `bookshelf-5e881a` / ultra | Tidak ada scroll/peta Romawi di katalog; ilustrasi 2D lebih tepat |
| c03 | Counter drift, equinox bergeser, timeline 1.600 tahun | — | Murni infografis data: angka menumpuk, diagram geser. 2D |
| c04 | Bulla kepausan, aturan ÷4/÷100/÷400, Oktober 1582 loncat 10 hari | — | Tidak ada GLB katedral/bulla; 2D tipografi bertahap lebih jelas |
| c05 | Dua kolom 2000 ✓ vs 2100 ✗, counter drift 3.236 tahun | — | Infografis perbandingan, murni 2D |
| c06 | Tiga panel kalender: bulan sabit, 13 bulan Ethiopia, era Jepang | — | Ikon simbolis 2D per kalender |
| c07_payoff | Globe orbit, counter, fade ke outro | `classroom-globe-16a96e` / prop | Outro card `audira-outro-card.svg` |

Saran engine: **2D** — topik ini 90% angka, aturan, dan infografis (counter, diagram, tipografi kinetik). GLB yang tersedia (globe, jam) hanya dekoratif dan tidak menambah kejelasan. Style 2D seperti CHRONICLE, CERDIK, atau TIMEFORGE sangat cocok: timeline sejarah + data callout.
