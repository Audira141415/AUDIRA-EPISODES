# Asset Candidates — Kota di Bawah Laut yang Ditemukan Utuh

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Permukaan laut, dasar pasir, dinding batu rendah membentuk jalan | `low-stone-wall-8a8ea3`/prop, `reef-rock-pavement-tile-879f47`/prop, `seagrass-tuft-862cc5`/prop, `rubble-scatter-decal-61332b`/prop | Dinding batu di-instance jadi denah kota; air pakai shader/fog biru |
| c01_intro | Peta Yunani, pin Teluk Vatika | belum ada GLB peta | Peta 2D/terrain prosedural; pin + label PAVLOPETRI |
| c02 | Perahu kecil, penyelam snorkel, pita meteran | `rowboat-c42d85`/vehicle, `scuba-diver-bdd1c8`/character (clip Walk/Point), `dive-marker-buoy-21beb7`/prop | Pita meteran dibuat garis HUD; denah tangan 2D overlay |
| c03 | Denah kota top-down, makam batu | `low-stone-wall-8a8ea3`/prop, `path-stone-a-aead48`/prop, `slab-path-stone-e526f7`/prop | Makam cist = kotak batu kecil dari slab; counter HUD |
| c04 | Robot bawah air, sonar, scan 3D, tembikar | `diver-propulsion-vehicle-11d8ef`/vehicle, `clay-storage-pot-626452`/prop | Belum ada GLB ROV khusus; sonar sweep + grid fotogrametri dibuat shader |
| c05 | Kota zaman perunggu di darat, alat tenun, guci pithos, kapal dagang | `cube-house-module-a9b8e8`/building, `cave-house-front-ed6b36`/building, `boathouse-cf20e6`/building, `clay-storage-pot-626452`/prop, `sailboat-3ee283`/ultra | Kit mediterranean-island-village cocok untuk rumah batu; alat tenun belum dicari |
| c06 | Penampang pantai, gempa, air naik | `small-reef-rock-99062d`/prop, `low-stone-wall-8a8ea3`/prop | Cross-section terrain prosedural + animasi level air |
| c07_payoff | Hero shot bawah air, penyelam di atas jalan kota, outro | `scuba-diver-bdd1c8`/character (clip Idle), `table-coral-193fa6`/prop, `seagrass-tuft-862cc5`/prop | God rays + caustics; outro card AUDIRA |

Saran engine: 3D — dunia bawah air dengan kedalaman, cahaya kaustik, dan kontras denah top-down lawan rekonstruksi darat paling kuat di R3F; peta c01 dan HUD bisa lapisan 2D (hybrid ringan).
