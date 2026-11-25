# Asset Candidates — Kota yang Matahariya Tidak Terbenam Selama 2 Bulan

> Backlog 2026-11-25. Dicari lewat `audira_search_assets` (katalog Polyfork). Kecocokan rendah: katalog tidak punya rumah arktik, pesawat, globe bumi, atau tulang paus.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Matahari rendah di tundra, peta Alaska, HUD 83 | deep-powder-tile-1fcec9 / prop (tanah salju) | Matahari, langit, dan peta dibuat prosedural/2D |
| c01_intro | Globe + pin 71°N, landasan kecil | globe-lamp-346cb6 / prop (kurang cocok, hanya lampu globe) | Pesawat: tidak ada hasil "airplane"; pakai siluet 2D |
| c02 | Diagram lintasan matahari 24 jam, kalender Mei-Agu | belum ada GLB cocok | Infografis 2D/shader |
| c03 | Rumah salju, langit bintang malam kutub | piste-marker-pole-7480c3 / prop, deep-powder-tile-1fcec9 / prop | Rumah/bangunan arktik belum ada; cek kit alpine-and-snow-092f66 lebih lanjut |
| c04 | Papan nama kota, kotak suara, rangka tulang paus | bone-scatter-90313d / prop (kurang cocok, kit crypt) | Papan/kotak suara dibuat prosedural; tanpa wajah orang |
| c05 | Penampang permafrost, jalan kerikil | deep-powder-tile-1fcec9 / prop | Penampang tanah prosedural |
| c06 | Bumi miring 23,4° mengitari matahari | belum ada GLB cocok | Bola prosedural + diagram |
| c07_payoff | Cincin tahun 83/66, outro | belum ada GLB cocok | Motion graphic + `audira-outro-card.svg` |

Saran engine: 2D | hybrid — topik berupa diagram (lintasan matahari, kemiringan sumbu, kalender) dan katalog GLB tidak punya aset arktik; 2D (PAPERWORLD/CHRONICLE) paling aman, 3D WORLDFORGE hanya bila dibuat prosedural untuk bola bumi dan diorama.
