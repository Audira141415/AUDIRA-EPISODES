# Asset Candidates — Cara Kerja Angin Puting Beliung

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya rumah, atap, sedan, papan reklame, gudang, dan jalan. Tidak ada GLB awan, pusaran angin, atau pohon tropis yang cocok (pencarian "tree" hanya memberi pinus dan petak jalan): awan Cumulonimbus dan pusaran dibuat volumetrik/procedural (shader), bukan partikel titik sebagai visual utama.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Rumah desa beratap seng, sedan melaju, pusaran | `two-story-house-40f6dc` / building, `pitched-roof-bay-79ed31` / building, `boxy-sedan-70s-7d55f7` / vehicle, `asphalt-road-tile-f6593c` / prop | Pusaran = shader volumetrik menempel ke awan; sedan tanpa merek; HUD "≈65 km/jam", "4 menit" |
| c01_intro | Peta Jawa Barat generik, jalan tol dengan rambu | `two-lane-street-tile-fe56b6` / prop, `roadside-billboard-c3c053` / prop | Peta 2D; rambu "60–100 km/jam" teks saja, tanpa logo operator tol |
| c02 | Awan Cumulonimbus menjulang di atas sawah | `rice-paddy-tile-dc727e` / prop (dari T012) | Awan volumetrik; HUD termometer −45 s/d −80 °C |
| c03 | Penampang awan, panah updraft, pengembunan | — | Diagram cutaway 2D/HUD lebih jelas |
| c04 | Dua lapis angin memuntir kolom udara, pusaran turun ke tanah | `asphalt-road-tile-f6593c` / prop | Silinder pusaran procedural + debu; panah wind shear HUD |
| c05 | Pusaran kecil di desa vs tornado besar di dataran luas, tangga EF | `two-story-house-40f6dc` / building, `brick-depot-warehouse-3dd642` / building (dari T012) | Split screen; tangga EF 2D dengan label "hitungan sendiri" |
| c06 | Grafik peringkat bencana, langit gelap, warga berlindung | `passenger-ac425a` / character (clip Walk/Run), `two-story-house-40f6dc` / building | Karakter tanpa detail wajah (rule 15); kartu "peringatan dini 1–6 jam" tanpa logo BMKG |
| c07_payoff | Desa tenang, awan runtuh, outro AUDIRA | `two-story-house-40f6dc` / building, `rooftop-billboard-48a23e` / prop | Brand AUDIRA di papan reklame dalam adegan; outro card `audira-outro-card.svg` |

Saran engine: 3D — cara kerja pusaran butuh kedalaman (awan menjulang, updraft, pusaran menyentuh tanah) dan bangunan/kendaraan tersedia di katalog; awan dan pusaran dibuat procedural volumetrik, diagram penampang (c03) dan grafik (c06) sebagai HUD 2D di atasnya.
