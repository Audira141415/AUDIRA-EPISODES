# Asset Candidates — Kenapa Kemasan Susu Kotak Bisa Tahan Berbulan-bulan Tanpa Kulkas

> Dicari via `audira_search_assets` (2026-11-26). Katalog punya truk, kulkas, sapi, milk churn, tangki, dan rak; tidak ada kotak susu karton, mesin UHT/penukar panas, mesin pengisi aseptik, atau penampang lapisan. Kotak susu dan exploded view lapisan dibuat procedural/2D, tanpa logo atau merek nyata (rule 15).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Kotak susu generik terbelah, enam lapisan terlepas, sehelai rambut raksasa | — | Tidak ada GLB kotak karton; buat procedural (RoundedBox + lapisan tipis) atau ilustrasi 2D. HUD "6 lapisan", "±6,5 µm vs 60–120 µm" |
| c01_intro | Kulkas + botol susu, rak toko suhu ruang, kalender | `fridge-freezer-fb9b5a` / prop, `glass-door-drinks-fridge-21f077` / prop, `open-kitchen-shelf-f751de` / prop, `back-bar-shelf-unit-11ab89` / prop | Kotak di rak = procedural generik; kalender 2D |
| c02 | Pabrik susu: tangki, pipa, termometer, stopwatch; zoom mikroba | `horizontal-tank-6e9b8b` / prop, `fuel-tank-3a0111` / prop, `surface-pipe-run-62c4b3` / prop, `milk-churn-895735` / prop, `cow-base` / animal (opsional pembuka) | Re-material tangki jadi stainless; mikroba/spora 2D atau procedural; HUD "≥135 °C · beberapa detik" |
| c03 | Ruang steril berkaca, gulungan bahan, pembentukan + pengisian + penyegelan | `regolith-conveyor-b8a9fa` / prop, `x-ray-baggage-conveyor-b3d1cc` / prop, `glass-door-sample-fridge-386715` / prop (sekat kaca) | Mesin pengisi aseptik tidak ada; konveyor + sekat kaca + kotak procedural; siluet operator tanpa wajah |
| c04 | Exploded view lapisan karton dan plastik, tumpukan kotak, tetes air | `cardboard-delivery-box-59cc68` / prop (tekstur karton, referensi) | Penampang lapisan lebih tajam di 2D/procedural; donat 75/20/5 |
| c05 | Lapisan aluminium memantulkan cahaya dan oksigen, penggaris mikrometer | — | Procedural (material metalik) + partikel oksigen hanya sebagai aksen, bukan subjek utama |
| c06 | Tiga perisai menyatu membungkus kotak | — | Ikon lucide (Flame, ShieldCheck, Layers) preset ICON_HUD |
| c07_payoff | Kotak dibuka masuk kulkas, kotak menggembung + silang, outro AUDIRA | `fridge-freezer-fb9b5a` / prop, `delivery-truck-a9537e` / vehicle (opsional transisi distribusi) | Kotak gembung = deformasi procedural; outro card `audira-outro-card.svg` |

Saran engine: 2D — subjek utama (kotak susu, penampang enam lapis, foil vs rambut, mikroba, alur UHT → aseptik) tidak tersedia sebagai GLB dan paling jelas sebagai diagram/cutaway berlapis (BONGKAR 2D); 3D hanya layak bila kotak dan lapisan dibuat procedural (NANOFORGE/INNERWORKS) dengan aset katalog sebatas kulkas, tangki, dan rak.
