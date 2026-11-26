# Asset Candidates — Cara Kerja Jalan Layang: Ribuan Ton di Atas Tiang Ramping

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya pilar overpass, road overbridge, girder baja, tile jalan, truk, mobile crane, mixer beton, dan rig bor. Tidak ada segmen box girder beton, launcher gantry, bantalan elastomer, sambungan ekspansi, atau tiang bor: itu dibuat procedural/hard-surface (bukan kubus polos) atau 2D cutaway.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Jalan layang dari bawah, satu bentang turun ke kepala tiang | `overpass-pier-cddd4b` / building, `road-overbridge-414614` / building | Bentang box girder dimodel procedural (profil trapesium berongga + `<RoundedBoxGeo>`); HUD "±500 ton / bentang" |
| c01_intro | Kota generik + diagram terurai bentang/tiang/fondasi | `overpass-pier-cddd4b` / building, `highway-tile-3a705e` / prop, `asphalt-road-tile-f6593c` / prop, `delivery-truck-a9537e` / vehicle | Tanpa rambu/logo nyata; label HUD bentang, pilar, fondasi |
| c02 | Segmen box girder digantung launcher gantry | `mobile-crane-671d3f` / vehicle, `tower-crane-top-d8d9c9` / vehicle, `steel-girder-bridge-d80bb4` / prop (referensi rangka) | Launcher gantry = rangka baja procedural di atas 2 pilar; 15 segmen procedural; tanpa logo proyek |
| c03 | Timbangan: 1 bentang vs 10 truk semi-trailer | `six-wheel-utility-truck-c8f599` / vehicle, `military-cargo-truck-652f66` / vehicle, `hauler-cargo-trailer-3a0262` / vehicle | Truk generik tanpa merek; HUD "500 kN ≈ 51 t", "≈ 10× (hitungan)" |
| c04 | Cutaway bantalan elastomer berlapis, termometer, sambungan ekspansi | — | Tidak ada GLB bantalan/expansion joint; buat procedural (lapisan karet + pelat baja) atau cutaway 2D; HUD "+11 mm / 40 m" |
| c05 | Split screen tiang tanpa vs dengan isolator saat gempa | `overpass-pier-cddd4b` / building, `road-overbridge-414614` / building | Grafik periode/gaya 2D; jangan tampilkan jembatan runtuh nyata |
| c06 | Potongan tanah: pile cap, tiang bor, lapisan keras | `core-drill-rig-3b355e` / prop, `concrete-mixer-truck-4a8d94` / vehicle | Tiang bor & lapisan tanah procedural; panah beban/gesekan/tahanan ujung |
| c07_payoff | Jalan layang utuh golden hour, lalu lintas mengalir, outro AUDIRA | `road-overbridge-414614` / building, `overpass-pier-cddd4b` / building, `boxy-sedan-70s-7d55f7` / vehicle, `delivery-truck-a9537e` / vehicle, `guardrail-d3bd42` / prop | Brand AUDIRA di papan rambu generik; outro card `audira-outro-card.svg` |

Saran engine: 3D — "cara kerja" struktur dan perjalanan beban bentang → bantalan → tiang → fondasi butuh kedalaman ruang dan cutaway; pilar, overbridge, truk, dan crane ada di katalog, sedangkan box girder, bantalan, dan tiang bor dibuat procedural. Grafik periode/gaya (c05) dan timbangan (c03) boleh overlay 2D (hybrid ringan).
