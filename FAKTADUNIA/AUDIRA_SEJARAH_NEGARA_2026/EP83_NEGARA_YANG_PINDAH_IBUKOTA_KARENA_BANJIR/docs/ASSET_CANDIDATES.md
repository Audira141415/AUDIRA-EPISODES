# Asset Candidates — Negara yang Pindah Ibukota karena Banjir

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Kota pesisir dihantam badai, puing | `driftwood-wrack-pile-a505a5` (prop), `palm-tree-a307da` (prop), `wooden-fence-section-d72055` (prop) | Rumah kayu khas tidak ada di katalog; pakai shophouse + material kayu |
| c01_intro | Peta Amerika Tengah, pin Belize City, awan badai | — (peta 2D/HUD) | Peta & spiral badai lebih jelas sebagai layer 2D |
| c02 | Rumah setinggi laut, garis air pasang 4,3 m | `two-storey-shophouse-183790` (building), `three-storey-shophouse-2f6378` (building), `rowboat-c42d85` (vehicle) | Air pakai plane shader naik; penggaris HUD |
| c03 | Rute ke pedalaman, konstruksi kota baru | `tower-crane-mast-1784a3` (building), `tower-crane-top-d8d9c9` (vehicle), `crane-banksman-3994e0` (character), `dawn-redwood-001c29` (prop) | Gedung pemerintahan tidak ada ("government capitol" 0 hasil); pakai `apartment-block-6445af` sebagai stand-in |
| c04 | Pesisir Jakarta turun, banjir rob | `apartment-block-6445af` (building), `street-tile-c7e3cf` (prop), `sunken-fishing-boat-061c70` (vehicle) | Diorama tanah turun bertahap + penggaris HUD |
| c05 | Peta Indonesia, lokasi konstruksi IKN di hutan | `mobile-crane-671d3f` (vehicle), `site-traffic-cone-d3ce94` (prop), `builder-s-skip-191d35` (prop), `fern-clump-90ff4b` (prop) | Peta Indonesia 2D; tidak memakai logo resmi IKN |
| c06 | Tiga kartu negara + cap "BUKAN BANJIR" | — (kartu HUD 2D, bendera disederhanakan) | Tanpa wajah tokoh nyata |
| c07_payoff | Split: Belmopan jadi vs Nusantara dibangun, papan AUDIRA | `tower-crane-top-d8d9c9` (vehicle), `palm-tree-a307da` (prop), `wide-shophouse-089f20` (building) | Papan proyek bertulisan AUDIRA = brand di dalam adegan |

Saran engine: hybrid — peta, rute, timeline, dan kartu mitos paling jelas di 2D (HISTORYMAP/CHRONICLE), sedangkan air pasang naik dan diorama tanah turun lebih kuat sebagai adegan 3D GLB.
