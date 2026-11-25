# Asset Candidates — Cara Kerja Fotosintesis di Level Kuantum

> Dicari via `audira_search_assets` (2026-11-25). Katalog tidak punya daun/sel/molekul/termometer: bagian mikro dibuat prosedural dengan shader style (bukan primitif polos).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Makro daun hijau disinari matahari | `oak-tree-50ee7c` / prop | Daun close-up perlu dibuat prosedural (mesh daun + vein shader); pohon untuk establishing |
| c01_intro | Sel daun, kloroplas, klorofil, pusat reaksi | — | Belum ada di katalog: model prosedural (kloroplas, cincin klorofil) atau impor PDB FMO (4BCL) via Blender |
| c02 | Lab optik + laser menembak protein FMO | `optics-table-66db15` / prop · `laser-pointer-ray-a70928` / prop · `research-microscope-77ce04` / prop · `lab-bench-740e7b` / prop | Protein FMO (trimer, 8 klorofil per monomer) dibangun dari struktur PDB, bukan box |
| c03 | Labirin + gelombang menyebar vs bola melompat | — | Labirin prosedural di atas molekul; gelombang = shader ripple |
| c04 | Termometer beku −196 °C ke 4 °C, stopwatch femtodetik | `wall-clock-0c555c` / prop | Termometer belum ada: prosedural; jam dipakai sebagai stopwatch raksasa |
| c05 | Grafik gelombang meluruh + stempel "DIHITUNG ULANG" | `bench-tablet-21c208` / prop | Grafik di layar tablet lab, HUD "2017 · 60 femtodetik" |
| c06 | Dua meter efisiensi (≈100 % vs 1–2 %), ladang padi | `field-console-a92adc` / prop | Ladang padi belum ada di katalog: terrain prosedural/instanced rumput |
| c07_payoff | Pohon besar golden hour, papan AUDIRA di dahan | `oak-tree-50ee7c` / prop · `hanging-signboard-c10e01` / prop | Papan gantung berisi tulisan AUDIRA (brand di dalam adegan) |

Saran engine: hybrid — dunia makro (lab, pohon, ladang) cocok 3D R3F dengan GLB nyata, tapi inti cerita (molekul, gelombang, grafik, meter efisiensi) lebih terbaca sebagai diagram 2.5D/HUD; NANOFORGE 3D dengan overlay diagram data.
