# Asset Candidates — Robotika Humanoid 2025

Dicari lewat `audira_search_assets` (2026-11-25). Katalog tidak punya model humanoid industri yang mirip Optimus/Atlas/Figure; hanya `service-robot-93f82e` (ber-rig). Tiga robot perlu dibedakan lewat material/warna/aksesori atau dibangun custom (primitif berlapis POLISH, bukan kubus polos). Jangan meniru logo merek (aturan aman merek).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | 3 robot humanoid di panggung gelap, lampu sorot | `service-robot-93f82e` / character (clip Idle, Wave); `hall-stage-deck-1f5a11` / building; `stage-riser-deck-6f7c04` / prop | Robot dibedakan warna: putih-hitam (Optimus), abu baja (Atlas), hitam-krem tekstil (Figure 03) |
| c01_intro | Langkah kaki robot di lantai pabrik | `service-robot-93f82e` / character (clip Walk); `composite-supply-crate-1547cb` / prop | Close-up kaki; lantai pabrik dari kit belum dicari spesifik |
| c02 Optimus | Lini perakitan mobil + robot | `hatchback-80s-e95554` / vehicle; `boxy-sedan-70s-7d55f7` / vehicle; `service-robot-93f82e` / character (Walk) | Mobil retro kurang cocok; cari ulang mobil modern/listrik di tahap 4. HUD: 2021, 30%, 10 kg, US$20.000–30.000 |
| c03 Atlas | Arena parkur (salto 2017), lalu Atlas listrik bangkit | `wooden-crate-e46521` / prop; `cargo-crate-9afc44` / prop (kotak lompatan) | Salto tidak ada di clip rig; perlu animasi custom/keyframe. HUD: 2017, APR 2024 |
| c04 Figure + Helix | Dapur rumah, 2 robot, otak hologram | `kitchen-island-47f4c8` / prop; `kitchen-sink-7ea438` / prop; `sofa-9c0e7e` / prop; `service-robot-93f82e` ×2 | Hologram otak dibuat sebagai HUD/mesh custom. HUD: 2022, FEB 2025, 1 OTAK = 2 ROBOT |
| c05 Figure 03 | Close-up tangan robot memegang telur, panel kamera | belum ada aset tangan robot | Tangan custom (primitif rounded + POLISH). HUD: OKT 2025, 3 GRAM, 2× FRAME RATE |
| c06 Perbandingan | Papan skor 3 kolom + operator teleoperasi | `desk-monitor-32cfce` / prop; `computer-bench-run-lit-87d9cf` / prop | Operator tanpa wajah (sarung tangan + VR). Papan skor sebagai HUD |
| c07_payoff | 3 robot jalan maju, sunrise di pintu gudang, papan AUDIRA | `service-robot-93f82e` / character (Walk, Cheer); `freight-crate-and-sack-f49cbb` / prop | Papan AUDIRA di dinding gudang (brand in-scene) |

Saran engine: 3D — subjeknya robot fisik yang berjalan dan bergerak; aset rig `service-robot-93f82e` + set pabrik/dapur tersedia, tetapi bentuk tiap robot perlu kustomisasi material atau model custom.
