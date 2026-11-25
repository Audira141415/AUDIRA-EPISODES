# Kandidat Aset — Cara Kerja Antibiotik dan Kenapa Bakteri Semakin Kebal

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Bakteri 3D besar, tetesan obat, HUD 1,27 juta | Tidak ada di katalog GLB (pencarian "bakteri antibiotik laboratorium kapsul obat" = 0 hasil) | Buat prosedural (bola/kapsul material gel) atau 2D |
| c01_intro | Kapsul obat, bola bakteri vs bola virus | Tidak ada (pencarian "laboratory" = 0) | Prosedural |
| c02 | Cawan petri, koloni jamur, siluet ilmuwan tanpa wajah | Tidak ada GLB petri; siluet bisa pakai karakter polos | Petri prosedural; tanpa wajah |
| c03 | Dinding sel seperti tembok bata, molekul obat | Tidak ada | Prosedural (instancing bata kecil) |
| c04 | Ribuan bakteri biru, satu oranye bertahan | Tidak ada | Instanced mesh prosedural |
| c05 | Plasmid berpindah antar bakteri, enzim pemotong | Tidak ada | Prosedural / ilustrasi 2D |
| c06 | Grafik kotak 1 dari 6, callout 2023 dan 40% | Tidak perlu aset | HUD kinetik |
| c07_payoff | Tameng resep dokter dan cuci tangan, outro AUDIRA | Tidak ada; kartu outro `shared/assets/brand/audira-outro-card.svg` | |

Saran engine: 2D | hybrid — katalog GLB tidak punya aset mikrobiologi, jadi 2D (CHAINREACTION/CERDIK) lebih aman; NANOFORGE 3D hanya dengan geometri prosedural.
