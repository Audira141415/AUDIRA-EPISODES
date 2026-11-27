# Asset Candidates — Ke Mana Perginya Sampah Setelah Diangkut Truk

> Dicari 2026-11-27 di katalog lokal `E:/ASET/ASSET-AUDIRA/downloads/glb/` (mode topik `audira_search_assets` tidak relevan, jadi dicari per nama file). Ada truk sampah, tong, kontainer, stasiun pilah, kompos, dan alat berat. Tidak ada gunungan TPA, sel landfill berlapis, atau fasilitas RDF: dibuat 2D/procedural.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Kantong sampah di depan pagar, truk sampah mengangkut | `garbage-truck-a7ffbf` / vehicle, `roll-out-wheelie-bin-3b540e` / prop, `street-bin-770173` / prop | Truk tanpa logo dinas; kantong plastik dibuat procedural |
| c01_intro | Peta Indonesia generik, bukit kantong, donat komposisi | — | Peta + donat 2D; HUD "±142 ribu ton/hari", "39,41% · 19,55%" |
| c02 | Gerobak/motor ke TPS, kontainer, ekskavator kecil ke truk | `construction-dumpster-2de7ae` / prop, `mini-excavator-cbe1ae` / vehicle, `garbage-truck-a7ffbf` / vehicle, `metal-trash-can-f57043` / prop | Gerobak sampah tidak ada di katalog: 2D |
| c03 | Fasilitas pilah, ban berjalan, kompos, bank sampah | `waste-sorting-station-adeefd` / prop, `three-stream-recycling-station-14da24` / prop, `recycling-capsule-bin-348f5b` / prop, `compost-heap-dfec38` / prop, `x-ray-baggage-conveyor-b3d1cc` / prop | Konveyor bandara hanya dipakai sebagai bentuk ban berjalan; pekerja tanpa wajah |
| c04 | TPA: buldoser memadatkan, cutaway lapisan tanah penutup | `crawler-bulldozer-b851fb` / vehicle, `articulated-dump-truck-ee50f3` / vehicle, `compactor-plate-e76b28` / prop | Sel landfill berlapis dibuat procedural/2D cutaway |
| c05 | Gunungan sampah terbuka, asap metana, retakan lereng | `tracked-excavator-8ebd3c` / vehicle, `wheeled-loader-29dc45` / vehicle | Gunungan procedural; tanpa visual korban (rule 15, sensitif) |
| c06 | 4 kantong (1 hijau, 3 abu), garis waktu tenggat | — | Infografis 2D; chip "hitungan sendiri" |
| c07_payoff | Peta rute rumah → TPS → TPS3R → TPA, outro AUDIRA | `garbage-truck-a7ffbf` / vehicle, `compost-heap-dfec38` / prop | Rute menyala; outro card `audira-outro-card.svg` |

Saran engine: 2D — ceritanya rantai/diagram alir (cocok CHAINREACTION), angka dan cutaway landfill lebih terbaca di 2D, dan gunungan TPA tidak ada sebagai GLB; 3D (WORLDFORGE) layak hanya bila diorama truk–TPS–TPA dibangun dari aset kendaraan di atas.
