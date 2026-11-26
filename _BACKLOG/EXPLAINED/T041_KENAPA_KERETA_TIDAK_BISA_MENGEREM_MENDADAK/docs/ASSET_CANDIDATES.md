# Asset Candidates — Kenapa Kereta Tidak Bisa Mengerem Mendadak

> Dicari via `audira_search_assets` (2026-11-26). Kit `countryside-railway-9b4c57` lengkap: lokomotif diesel, gerbong penumpang/barang, rel lurus, perlintasan, palang, karakter penjaga perlintasan. Tidak ada timbangan raksasa, kaleng minuman, atau potongan makro roda-rel: dibuat procedural/2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Kereta mendekat di rel lurus, penanda meter di bantalan | `mainline-diesel-locomotive-33ef97` / vehicle, `straight-track-d4cf38` / prop | Tanpa logo operator nyata; HUD "> 1 km" |
| c01_intro | Mobil membelok vs kereta terkunci di rel, siluet masinis | `hatchback-80s-e95554` / vehicle, `mainline-diesel-locomotive-33ef97` / vehicle, `curved-track-819ec6` / prop | Masinis siluet tanpa wajah; ikon setir dicoret (lucide) |
| c02 | Timbangan: lokomotif ±200 ton, rangkaian 6.000 ton, analogi kaleng vs mobil | `mainline-diesel-locomotive-33ef97` / vehicle, `hopper-wagon-b4c486` / vehicle, `open-goods-wagon-998292` / vehicle, `tank-wagon-d860fa` / vehicle, `boxy-sedan-70s-7d55f7` / vehicle | Timbangan dan kaleng dibuat procedural; label "kereta barang AS" |
| c03 | Makro roda baja di kepala rel, rel basah, roda terkunci + percikan | `straight-track-d4cf38` / prop | Roda dan rel makro dibuat procedural (silinder + profil rel), bukan aset; meter "cengkeraman" HUD |
| c04 | Peta lurus jarak henti: 120 km/jam → 800–1.200 m, 88 km/jam → > 1,6 km | `passenger-carriage-de9d58` / vehicle, `hopper-wagon-b4c486` / vehicle, `straight-track-d4cf38` / prop | Penanda meter tiap 200 m; label sumber "KAI" dan "Operation Lifesaver" |
| c05 | Dua lajur: bar mobil 53 m vs kereta > 1,6 km | `hatchback-80s-e95554` / vehicle, `road-tile-286319` / prop, `mainline-diesel-locomotive-33ef97` / vehicle | Bar data 2D di atas diorama; callout "> 20× (hitungan)" |
| c06 | Perlintasan sebidang: lampu kedip, palang turun, kendaraan berhenti di garis | `level-crossing-37d00b` / prop, `crossing-gate-50bcee` / prop, `crossing-keeper-s-cottage-de49a4` / building, `crossing-keeper-e13207` / character (clip Idle/Wave) | Kartu pasal teks saja (tanpa logo Kemenhub/Polri) |
| c07_payoff | Kereta melintas, antrean kendaraan menunggu, palang naik, outro | `level-crossing-37d00b` / prop, `passenger-carriage-de9d58` / vehicle, `pickup-truck-70s-8c0080` / vehicle | Outro card `audira-outro-card.svg` |

Saran engine: 3D — kit kereta + perlintasan tersedia lengkap sebagai GLB dan topik bersifat spasial (jarak memanjang di rel, pandangan atas); bar data dan kartu pasal ditumpangkan sebagai HUD 2D (SCALEFORGE/URBANFORGE cocok untuk skala jarak).
