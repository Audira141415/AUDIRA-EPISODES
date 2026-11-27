# Asset Candidates — Cara Kerja Likuifaksi: Saat Tanah Berubah Jadi Bubur

> Dicari via `audira_search_assets` (2026-11-27). Pencarian topik "likuifaksi/gempa/lumpur" = 0 hasil. Katalog punya rumah generik, petak sawah, pohon kelapa, dan rig bor. Butir pasir, saluran irigasi, dan medan lumpur tidak ada, jadi bagian itu dibuat procedural (shader/instanced mesh) atau 2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Rumah di atas tanah kering, cutaway ke pasir basah | `two-storey-family-house-c63c4a` / building, `gabled-farmhouse-c7534f` / building | Permukaan beriak = shader displacement; penampang tanah procedural |
| c01_intro | Butir pasir + air pori (makro) | — | Instanced mesh kerikil di dalam penampang berlabel HUD, bukan partikel abstrak lepas |
| c02 | Tekanan air naik, rumah miring, semburan pasir | `townhouse-row-unit-b9544b` / building, `two-storey-family-house-c63c4a` / building | Rumah dimiringkan + tenggelam sebagian; sand boil = efek sekunder |
| c03 | Penampang 3 lapis, garis air tanah, tiang bor | `core-drill-rig-3b355e` / prop | Label "3,2 m"; ikon lucide Droplets/Layers |
| c04 | Peta lembah Palu, episentrum, chip gempa susulan | — | Peta 2D generik tanpa logo; HUD "M 7,5" + timer 25 menit |
| c05 | Permukiman Petobo bergerak, blok Balaroa naik-turun | `townhouse-row-unit-b9544b` / building, `gabled-farmhouse-c7534f` / building, `palm-tree-a307da` / prop | Tanpa orang atau korban; counter "2.050 rumah" |
| c06 | Lereng sawah landai, irigasi, blok meluncur > 2 km | `rice-paddy-tile-dc727e` / prop, `palm-tree-a307da` / prop, `palm-sapling-ef7ae4` / prop | Saluran irigasi procedural; busur sudut "±1°"; garis ukur "> 2 km" |
| c07_payoff | Taman hijau zona merah, kembali ke hook, outro | `palm-tree-a307da` / prop, `rice-paddy-tile-dc727e` / prop | Papan generik "zona merah" tanpa logo; outro card `audira-outro-card.svg` |

Saran engine: 3D — penampang tanah, rumah amblas, dan blok lereng meluncur paling jelas sebagai diorama R3F (DISASTERSIM/WORLDFORGE), dengan rumah dan sawah tersedia sebagai GLB; butir pasir dan peta dibuat procedural/2D sebagai sisipan HUD.
