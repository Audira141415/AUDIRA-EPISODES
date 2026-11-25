# Asset Candidates — Plankton: Makhluk Tak Kasat Mata yang Menghasilkan Setengah Oksigen Bumi

> Dicari via `audira_search_assets` (2026-11-25). Katalog tidak punya GLB plankton, diatom, krill, atau paus: sel mikroskopis perlu dibuat prosedural (mesh sel bertekstur, bukan `Points`) atau ilustrasi 2D berlapis.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Pantai, permukaan laut, tetes air | `beach-parasol-fd4530`/prop, `driftwood-log-89a68f`/prop, `dry-soft-sand-tile-4a1df7`/prop | Zoom ke tetes air = transisi ke dunia mikro |
| c01_intro | Laut terbuka + plankton hanyut | `dive-marker-buoy-21beb7`/prop, `moon-jellyfish-0fa43c`/animal | Ubur-ubur = contoh plankton besar (penghanyut); plankton mikro prosedural |
| c02 | Sel fitoplankton + sinar matahari bawah air | `broad-algae-frond-88a644`/prop, `seagrass-tuft-862cc5`/prop | Sel diatom/fitoplankton: model kustom (belum ada di katalog) |
| c03 | Diatom kaca, kokolitofor kapur | — | Belum ada GLB; buat mesh kaca (transmission) + keping kapur |
| c04 | Skala menyusut ke Prochlorococcus | `small-reef-rock-99062d`/prop, `starfish-772749`/animal | Penggaris skala HUD; sel bulat kustom |
| c05 | Fitoplankton → krill → paus biru | `table-coral-193fa6`/prop, `mushroom-coral-a2906e`/prop, `coral-rubble-seabed-tile-772a1f`/prop | Krill & paus biru belum ada (query "whale" = 0 hasil); perlu GLB eksternal berlisensi atau siluet 2D |
| c06 | Globe darat vs laut + timbangan oksigen | `tall-pine-tree-ab4108`/prop, `maple-tree-65fa12`/prop | Pohon untuk analogi hutan; globe & timbangan prosedural |
| c07_payoff | Laut bercahaya dari orbit + outro | `sunken-fishing-boat-061c70`/vehicle, `reef-rock-pavement-tile-879f47`/prop | Outro card AUDIRA dari `shared/assets/brand/audira-outro-card.svg` |

Saran engine: hybrid — dunia laut 3D R3F (aset coral-reef) untuk kedalaman, tetapi subjek utama (sel plankton, krill, paus) belum ada GLB sehingga perlu mesh kustom atau lapisan ilustrasi 2D; SCALEFORGE/TERRARIUM cocok untuk kontras skala mikro-makro.
