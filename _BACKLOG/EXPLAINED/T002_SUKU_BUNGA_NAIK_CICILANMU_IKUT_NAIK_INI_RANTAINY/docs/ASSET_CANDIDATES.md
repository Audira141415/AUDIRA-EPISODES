# Asset Candidates — Suku Bunga Naik, Cicilanmu Ikut Naik — Ini Rantainya

> Dicari via `audira_search_assets` (2026-11-26). Rule 15: tanpa wajah orang nyata, tanpa logo BI/OJK/BP Tapera/bank komersial; pakai name plate teks.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Meja rapat + kursi, rantai menuju rumah | `meeting-chair-731ce0` / prop; `dining-table-7af83a` / prop; `townhouse-row-unit-b9544b` / building | Rantai dibuat dari mesh link sederhana atau ilustrasi 2D; tanpa tokoh |
| c01_intro | Papan angka BI-Rate, kalender, grafik tangga | — | 2D: papan flip-digit + chart tangga dari tabel #2 |
| c02 | Dua gedung bank + aliran koin antarbank | `monolith-office-tower-422420` / building; `gold-coin-29afc1` / prop; `gold-coin-stack-a9ef52` / prop | Gedung tanpa signage; label "Pasar Uang Antarbank" sebagai HUD |
| c03 | Brankas bank, tuas Deposito/Kredit, papan SBDK | `iron-vault-safe-8b8f29` / prop; `coin-hoard-heap-07b6e4` / prop | Papan tarif SBDK dibuat 2D/teks |
| c04 | Rumah tapak + garis waktu fixed → floating | `townhouse-row-unit-b9544b` / building; `two-storey-shophouse-183790` / building | Garis waktu + gembok sebagai elemen 2D |
| c05 | Rumah subsidi + perisai | `townhouse-row-unit-b9544b` / building | Perisai efek 2D; tanpa logo Tapera |
| c06 | Kalkulator/simulasi, tumpukan koin 12 bulan, jam pasir | `gold-coin-stack-a9ef52` / prop; `spilled-coin-pile-caccf6` / prop; `coin-pouch-be4dd8` / ultra | Label "SIMULASI" wajib di layar |
| c07_payoff | Seluruh rantai menyala + papan AUDIRA in-world | gabungan aset c00–c05 | Brand AUDIRA di papan adegan (anti-reupload) |

Saran engine: 2D — topik berupa rantai sebab-akibat dan angka (infografis, chart tangga, simulasi cicilan), cocok dengan CHAINREACTION/DATAPHYSICAL 2D; katalog GLB tidak punya aset bank/rapat yang spesifik, jadi 3D hanya opsional untuk prop koin/brankas/rumah (hybrid).
