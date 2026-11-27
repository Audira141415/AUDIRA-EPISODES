# Asset Candidates — Perjalanan Listrik dari Pembangkit ke Colokan Rumahmu

> Dicari via `audira_search_assets` (2026-11-27). Katalog hanya punya tiang listrik kota, lampu, rumah, dan genset kecil. Tidak ada pembangkit listrik, menara transmisi (SUTET/SUTT), gardu induk, trafo, saklar, atau colokan: semua itu harus dibuat 2D/procedural (bukan boxGeometry polos sebagai visual utama).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Saklar ditekan, lampu kamar menyala, masuk ke dalam kabel tembaga | `floor-lamp-f0ba3f` / ultra | Saklar dan penampang kabel: ilustrasi 2D. HUD "±0,2 mm/s (hitungan sendiri)" |
| c01_intro | Penampang kabel, gelombang energi melesat, elektron bergetar | — | Diagram 2D/shader; HUD "≈ kecepatan cahaya", "50 Hz" |
| c02 | Pembangkit generik, generator cutaway, trafo penaik | `standby-generator-enclosure-9d48f6` / building (simbolis), `site-generator-298792` / prop (simbolis) | Pembangkit besar dan trafo penaik tidak ada di katalog; cutaway 2D. Tanpa logo PLN |
| c03 | Dua kabel: arus besar panas vs tegangan tinggi dingin; diagram I²R | — | Infografis 2D; label "hitungan sendiri" |
| c04 | Menara transmisi berbaris, peta Jawa–Bali dengan jaring pembangkit | — | Menara lattice dan peta: 2D/procedural. HUD "72.655 kms (akhir 2024)" |
| c05 | Gardu induk, kabel 20 kV di tiang, trafo distribusi ujung gang, rumah | `utility-pole-574130` / prop, `timber-utility-pole-a93693` / prop, `townhouse-row-unit-b9544b` / building, `street-lamp-29f365` / prop | Trafo tiang ditambah sebagai ilustrasi; ikon peringatan bahaya, tanpa orang memanjat |
| c06 | Pita energi menipis, donat susut 8,55% | — | Infografis 2D; "per 2024" |
| c07_payoff | Colokan + charger generik, rute mundur sampai pembangkit, outro | `utility-pole-574130` / prop, `townhouse-row-unit-b9544b` / building | Charger tanpa merek; outro card `audira-outro-card.svg` |

Saran engine: 2D — topik ini skema/diagram (tangga tegangan, penampang kabel, I²R, peta jaringan) dan katalog GLB tidak punya pembangkit, menara transmisi, gardu induk, maupun trafo; CHAINREACTION/CIRCUITFORGE 2D lebih aman daripada URBANFORGE 3D.
