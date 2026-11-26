# Asset Candidates — Cara Kerja Aspal: Kenapa Jalan Cepat Berlubang Saat Hujan

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya tile jalan aspal, tile jalan rusak, penggilas aspal, truk, kerucut lalu lintas, saluran tepi jalan, dan sedan. Tidak ada GLB penampang lapisan jalan, butir kerikil berselaput aspal, atau timbangan gandar: itu dibuat procedural/2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Jalan basah malam, roda truk menghantam genangan, freeze cipratan | `asphalt-road-tile-f6593c` / prop, `flatbed-delivery-lorry-571458` / vehicle, `articulated-dump-truck-ee50f3` / vehicle | Truk generik tanpa logo; cipratan & genangan procedural; HUD "AIR + BEBAN" |
| c01_intro | Cutaway lapisan jalan (aspal, fondasi, tanah dasar) | `highway-tile-3a705e` / prop, `gravel-shoulder-tile-3eb36f` / prop | Penampang lapisan dibuat procedural (bukan boxGeometry polos: beri tekstur kerikil); label lapisan |
| c02 | Makro kerikil berselaput aspal, air menyusup, film mengelupas dari bawah | — | Tidak ada GLB; ilustrasi makro 2D atau shader; HUD "STRIPPING" |
| c03 | Ban menekan air, semburan air + lumpur dari retak (pumping) | `boxy-sedan-70s-7d55f7` / vehicle, `six-wheel-utility-truck-c8f599` / vehicle, `asphalt-road-tile-f6593c` / prop | Penampang 2D dengan panah tekanan lebih terbaca; HUD "PUMPING" |
| c04 | Gandar mobil vs gandar truk, kurva pangkat empat | `boxy-sedan-70s-7d55f7` / vehicle, `delivery-truck-a9537e` / vehicle, `military-cargo-truck-652f66` / vehicle (hindari kesan militer bila dipakai) | Kurva + timbangan 2D; HUD "1956–1960 AASHO", "beban ×2 → ≈×16 (aturan praktis)" |
| c05 | Retak kulit buaya → kepingan tercungkil → lubang mangkuk, penggaris kedalaman | `broken-out-road-tile-c9e990` / prop, `asphalt-road-tile-f6593c` / prop | Transisi tile utuh → tile rusak; pola retak decal/shader; HUD "> 5 cm = berat" |
| c06 | Jalan dengan kemiringan, saluran tepi, lapisan drainase, petugas menutup retak, penggilas | `kerb-storm-drain-inlet-c721db` / prop, `tandem-road-roller-f7d8f3` / vehicle, `site-traffic-cone-d3ce94` / prop, `trucker-9266a8` / character (clip Idle/Point, wajah tanpa detail) | Petugas sebagai siluet tanpa wajah, rompi tanpa logo instansi |
| c07_payoff | POV pengendara hujan, genangan memantulkan lampu, X-ray lubang tersembunyi, ikon ponsel lapor, outro | `two-lane-street-tile-fe56b6` / prop, `guard-rail-run-8ed595` / prop, `reflector-post-run-2a7795` / prop, `traffic-cone-33e81e` / prop | Ikon ponsel generik (lucide), tanpa logo aplikasi nyata; outro card `audira-outro-card.svg` |

Saran engine: hybrid — jalan, truk, penggilas, dan lubang tersedia sebagai GLB sehingga diorama 3D (BUILDFORGE) kuat untuk hook, c05–c07, tetapi mekanisme inti (stripping di level butir, pumping, kurva pangkat empat) jauh lebih terbaca sebagai penampang 2D; bila harus satu engine, 3D BUILDFORGE dengan sisipan cutaway 2D/HUD.
