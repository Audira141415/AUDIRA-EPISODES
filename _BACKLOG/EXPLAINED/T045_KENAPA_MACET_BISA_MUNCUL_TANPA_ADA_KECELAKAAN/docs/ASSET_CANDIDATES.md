# Asset Candidates — Kenapa Macet Bisa Muncul Tanpa Ada Kecelakaan

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya mobil generik (kit racing-cars), tile jalan tol, guardrail, dan marka lajur. Tidak ada lintasan melingkar siap pakai, lampu rem menyala, atau mobil otonom bersensor: dibuat procedural/2D. Mobil GLB bergaya retro; cek tidak ada emblem merek di tekstur.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Tol padat tampak atas, lampu rem merah merambat ke belakang | `highway-tile-3a705e` / prop, `hatchback-80s-e95554` / vehicle, `boxy-sedan-70s-7d55f7` / vehicle, `guard-rail-run-8ed595` / prop | Lampu rem = mesh emissive tambahan; tanpa plat/merek nyata |
| c01_intro | Diagram lingkaran sumber macet, deretan mobil mengerem berantai | `pickup-truck-70s-8c0080` / vehicle, `lane-marking-decal-d1a212` / prop | Pie chart 2D; label "data AS" tanpa logo FHWA |
| c02 | Lintasan melingkar 230 m, 22 mobil berjarak rata | `asphalt-road-tile-f6593c` / prop, `hatchback-80s-e95554` / vehicle, `camper-van-8d10e2` / vehicle | Ring jalan dibuat procedural; HUD 230 m · 22 mobil · 2008 |
| c03 | Gumpalan 5 mobil berhenti, bergeser mundur | `boxy-sedan-70s-7d55f7` / vehicle, `muscle-car-60s-524d46` / vehicle | Highlight merah di gumpalan + panah mundur; HUD ±20 km/jam |
| c04 | Split jalan sepi vs padat, grafik ambang | `highway-tile-3a705e` / prop, `reflector-post-run-2a7795` / prop | Grafik 2D; HUD "±25 kendaraan/km (data tol Jepang)" |
| c05 | Jalan panjang tampak samping, penggaris km, gelombang mundur | `highway-tile-3a705e` / prop, `gravel-shoulder-tile-3eb36f` / prop | HUD wajib label "hitungan ilustrasi" |
| c06 | Lintasan 260 m dengan satu mobil otonom (cahaya biru), indikator BBM | `town-car-56eeb6` / vehicle | Sensor/cahaya biru procedural; tanpa merek mobil otonom nyata |
| c07_payoff | Tol lancar golden hour, jarak 2–3 detik, outro | `highway-tile-3a705e` / prop, `guard-rail-run-8ed595` / prop, `hatchback-80s-e95554` / vehicle | Outro card `audira-outro-card.svg` |

Saran engine: hybrid — mobil dan jalan tol tersedia sebagai GLB sehingga 3D (URBANFORGE) membuat gelombang rem terasa nyata, tetapi eksperimen lingkaran, grafik ambang kepadatan, dan pie chart lebih terbaca sebagai diagram 2D; bila harus satu engine, 3D dengan HUD 2D tebal karena inti cerita adalah gerak antrean mobil.
