# Asset Candidates — Cara Kerja Chip: Dari Pasir ke Prosesor 2nm

Dicari 2026-11-25 lewat `audira_search_assets` (katalog Polyfork lokal `E:/ASET/ASSET-AUDIRA/downloads/glb/`). Katalog tidak punya model wafer, ingot, mesin EUV, atau transistor: bagian itu perlu dibuat prosedural (geometri bermakna, bukan partikel/kubus polos) atau 2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Segenggam pasir memadat jadi die chip | `field-rock-5e37c6` / prop, `small-rock-db33a7` / prop | Butir pasir + die chip prosedural (plane bertekstur sirkuit) |
| c01_intro | Batu kuarsa, butir pasir, atom Si | `garden-rock-7f5d60` / prop, `small-rock-d43710` / prop | Material kuarsa transparan (transmission); label atom = HUD 2D |
| c02 | Reaktor pemurnian, kolom distilasi, batang polisilikon | `fume-extraction-arm-ceiling-c5bd3e` / prop, `liquid-handling-robot-c42a98` / prop | Kolom + batang = silinder prosedural ber-PBR; tidak ada GLB reaktor |
| c03 | Cawan silikon cair, ingot ditarik, irisan wafer | — | Belum ada GLB: ingot (cylinder + cap), wafer (disc cermin iridescent), cawan (lathe) prosedural |
| c04 | Interior mesin EUV: tetesan timah, laser, plasma, cermin | `cleanroom-partition-solid-a2afb1` / building | Mesin EUV dibuat prosedural tanpa logo ASML; plasma = emissive sphere + bloom |
| c05 | Lapisan chip bertumpuk, robot cleanroom | `cleanroom-partition-solid-a2afb1` / building, `lab-floor-tile-ad0da8` / building, `lab-wall-solid-8bd631` / building, `liquid-handling-robot-c42a98` / prop, `computer-bench-run-lit-87d9cf` / prop | Kit `research-lab-9b9b5d` untuk set cleanroom |
| c06 | Transistor nanosheet (gerbang membungkus saluran) | — | Belum ada GLB: model penampang nanosheet prosedural (stack plate + wrap gate) |
| c07_payoff | Die masuk laptop menyala, kembali ke pasir; outro | `laptop-e775ba` / prop, `smartphone-5f05e5` / ultra, `small-server-rack-8ae0a4` / prop | Laptop tanpa logo Apple; outro card AUDIRA |

Saran engine: hybrid — 3D R3F untuk alur fisik (pasir, ingot, wafer, cleanroom, laptop) dengan banyak elemen prosedural karena katalog GLB tidak punya aset semikonduktor; overlay 2D untuk penampang nanosheet, lapisan chip, dan HUD angka.
