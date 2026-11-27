# Asset Candidates — Cara Kerja Hujan Buatan (Modifikasi Cuaca)

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00 Hook | Pesawat kecil generik terbang di atas awan | `twin-engine-piston-light-f417c7` (vehicle/airport), `single-engine-light-aircraft-24478f` (vehicle/airport), `business-jet-684611` (vehicle/airport) | Twin-engine paling cocok untuk pesawat TMC |
| c01 Jawaban Pertama | Diagram potong awan, butir air kecil | `dewdrop-18a51f` (prop/insect-world), `water-blob-e2cdf2` (prop/medieval-village) | Awan & butir air perlu dibuat prosedural (partikel/shader), aset GLB sebagai aksen |
| c02 Dua jenis bahan | Kristal AgI vs butir NaCl, dua jenis awan | `dewdrop-18a51f` (prop), `water-blob-f266b8` (prop/nature-forest) | Kristal dan butir garam perlu dibuat prosedural; awan jadi dua environment berbeda |
| c03 Proses dari pesawat | Pesawat menembus awan, flare menyala, butir membesar jatuh | `twin-engine-piston-light-f417c7` (vehicle/airport) | Flare dan partikel garam = efek prosedural |
| c04 Untuk apa di Indonesia | Peta Indonesia, hutan terbakar, waduk, kota Jakarta | `tall-pine-tree-ab4108` (prop/nature-forest), `dead-tree-6795fa` (prop/nature-forest), `campfire-cook-tripod-d95a1e` (prop), `fire-lookout-tower-75a129` (building/nature-forest), `top-up-water-reservoir-d83912` (prop), `water-tower-7eb7ec` (building) | Hutan terbakar: pohon + efek api prosedural. Waduk: water reservoir + water tower. Peta Indonesia = 2D overlay |
| c05 Siapa yang menjalankan | Timeline BPPT → BRIN, gedung riset | `water-pump-house-121270` (building) | Gedung riset generik; timeline sebagai HUD 2D |
| c06 Efektivitas diperdebatkan | Grafik batang, tanda tanya, kartu teks NRC 2003 | — | Sepenuhnya HUD/infografis 2D, tidak butuh aset GLB |
| c07 Payoff + outro | Pesawat melintas awan, hujan turun, peta Indonesia | `twin-engine-piston-light-f417c7` (vehicle/airport) | Reuse pesawat dari c00; hujan = partikel prosedural |

Saran engine: **2D** | 3D | hybrid — Topik ini banyak diagram, infografis, peta, dan HUD. Visual utama adalah proses mikrofisika awan (butir air, kristal, garam) yang lebih efektif divisualisasikan lewat ilustrasi berlayer 2D daripada model 3D. Pesawat bisa jadi elemen 3D tapi bukan kebutuhan utama. **Rekomendasi: 2D Motion (SATELLITEBRIEFING atau CHAINREACTION)** lebih cocok daripada 3D untuk topik eksplainer sains atmosfer ini.
