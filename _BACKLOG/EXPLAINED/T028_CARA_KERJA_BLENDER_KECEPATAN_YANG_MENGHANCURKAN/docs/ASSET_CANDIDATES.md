# Asset Candidates — Cara Kerja Blender: Kecepatan yang Menghancurkan Es

> Dicari via `audira_search_assets` (2026-11-26). Katalog **tidak punya** GLB blender, motor listrik, pisau, atau kubus es ("blender" = 0 hasil, "motor" hanya sepeda motor). Yang ada: buah (stroberi, pisang, semangka) dan perabot dapur/konter. Objek inti (gelas, pisau, motor, es) harus dibuat procedural/2D atau dimodelkan sendiri.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Close-up pisau blender berputar + motion blur, counter 400+/dtk | — | Tidak ada GLB pisau; pisau 4 bilah dibuat procedural (mesh sederhana + material baja) atau ilustrasi 2D; blender generik tanpa logo (rule 15) |
| c01_intro | Blender di meja dapur, cutaway alas: motor + poros | `service-counter-module-3072ff` / prop, `kitchen-sink-7ea438` / prop, `kitchen-resin-floor-tile-4c2150` / prop | Body blender dibuat sendiri; HUD "1.200 W", "25.000 rpm (maks)" |
| c02 | Exploded view motor universal (stator, rotor, sikat), poros, kopling | — | Tidak ada GLB motor listrik; diagram teknis 2D/blueprint lebih jelas; kartu hitungan "25.000 ÷ 60 ≈ 417" berlabel hitungan sendiri |
| c03 | Potongan melintang gelas, partikel buah mengikuti pusaran | `strawberry-57b7d5` / ultra, `banana-09c206` / ultra, `watermelon-slice-bd255f` / ultra | Panah aliran + partikel; buah GLB sebagai potongan yang ikut berputar |
| c04 | Split screen gelas bulat (kavitasi, gelembung udara) vs gelas bersudut | — | Diagram aliran 2D paling terbaca; gelembung udara di sekitar pisau |
| c05 | Kubus es dihantam pisau, retak, pecah, turbulensi | — | Kubus es procedural (material transmisi + retakan); hindari kubus polos sebagai visual utama: wajib ada pisau + pecahan + aliran |
| c06 | Dua blender generik: daya rendah + cairan vs daya tinggi kering | `service-counter-module-3072ff` / prop | Bar daya HUD; blender dibuat sendiri, tanpa merek |
| c07_payoff | Serpihan es → gelas smoothie, kartu keselamatan, outro | `strawberry-57b7d5` / ultra, `banana-09c206` / ultra | Ikon lucide (Plug, Flame/Thermometer, AlertTriangle) untuk pesan keselamatan; tanpa tangan dekat pisau; outro `audira-outro-card.svg` |

Saran engine: 2D — objek inti (blender, motor, pisau, es) tidak ada di katalog GLB, dan cerita intinya diagram aliran (pusaran, kavitasi, hitungan rpm) yang paling jelas sebagai cutaway 2D (PRECISION/INNERWORKS-2D); 3D hanya layak bila blender + pisau + es dimodelkan sendiri (hybrid: diorama dapur 3D + cutaway 2D).
