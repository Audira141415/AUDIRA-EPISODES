# Asset Candidates — Cara Kerja Survei Opini: Membaca Margin of Error

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya bangunan kota, karakter warga ber-rig, dan ponsel; tidak ada kertas kuesioner, grafik, atau kotak suara. Inti topik adalah grafik dan pita rentang, jadi mayoritas 2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Layar TV generik, grafik batang "±3%" yang berubah jadi "poin" | — | 2D; tanpa logo stasiun TV atau lembaga survei |
| c01_intro | Kota diorama berisi siluet warga, sorot memilih sampel | `brownstone-row-house-1b84fd` / building, `corner-shop-5aec8c` / building, `commuter-381e7f` / character (Idle/Walk) | Siluet tanpa wajah; counter "1.000 orang" berlabel ILUSTRASI |
| c02 | Batang 46% melebar jadi pita 43–49 | — | 2D infografis; label ILUSTRASI |
| c03 | Grid 100 kertas survei, 95 hijau, 5 merah | — | 2D; ikon lucide `ClipboardList` |
| c04 | Dua batang A/B, pita tumpang tindih, pita selisih ±6, stempel "TERLALU KETAT" | — | 2D; nama "Pilihan A/B" saja, warna netral (bukan warna partai) |
| c05 | Kerumunan 1.000 diiris jadi 200, pita melebar | `commuter-381e7f` / character | Atau dot-grid 2D; HUD "200 → ±6,9" |
| c06 | Ikon wording menggiring, pintu tertutup, rumah tanpa sinyal, dokumen metodologi dicentang | `smartphone-5f05e5` / ultra, `righthand-item-cf3cdf` / ultra (gagang telepon) | Dokumen generik tanpa logo KPU; HUD "PKPU 9/2022" |
| c07_payoff | Layar TV dari hook + checklist 3 pertanyaan, outro AUDIRA | — | Outro card `audira-outro-card.svg` |

Saran engine: 2D — isi utamanya grafik batang, pita rentang, grid 100 survei, dan checklist, yang paling tajam sebagai infografis 2D (DATAPHYSICAL/CERDIK); aset kota 3D hanya opsional untuk c01.
