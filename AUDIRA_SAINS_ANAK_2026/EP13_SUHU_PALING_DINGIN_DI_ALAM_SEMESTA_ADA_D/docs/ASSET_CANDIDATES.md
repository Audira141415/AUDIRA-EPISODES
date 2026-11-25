# Asset Candidates — Suhu Paling Dingin di Alam Semesta Ada di Bumi, Bukan di Luar Angkasa

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Angkasa bertabur bintang, termometer raksasa 2,7 K, Bumi kecil | tidak ada GLB (procedural: bintang, bola Bumi, termometer) | Katalog tidak punya planet; buat bola + tekstur sederhana |
| c01_intro | Termometer skala C/K, HUD −273,15 °C | tidak ada GLB (UI/HUD 2D) | Kartu AUDIRA kecil |
| c02 | Ruang hampa, cahaya latar, HUD 2,725 K | tidak ada GLB (shader/partikel latar) | Partikel hanya sebagai latar, bukan visual utama |
| c03 | Nebula Bumerang dua cuping | tidak ada GLB (ilustrasi/shader nebula; opsional `ice-chunk-b23ad7` / prop untuk kesan dingin) | Tanpa foto bermerek; gambar sendiri |
| c04 | Atom rubidium, laser merah, magnet | tidak ada GLB (bola procedural berwarna) | Atom = bola low-poly, laser = balok cahaya |
| c05 | Lensa cahaya, awan atom, HUD < 50 pK | tidak ada GLB (procedural) | Hindari Points abstrak sebagai visual utama; pakai bola berwarna |
| c06 | Tangga skala, ISS, bola BEC | `station-hub-67f667` / building, `station-corridor-d7efdb` / building (spaceship-wars-kit) | Pakai sebagai pengganti stasiun luar angkasa generik, tanpa logo |
| c07_payoff | Bumi kecil di antara bintang, kartu AUDIRA | tidak ada GLB (bola Bumi procedural) | Outro `audira-outro-card.svg` |

Pencarian "laboratory" dan "planet earth" tidak memberi hasil relevan; sisanya belum dicari lebih dalam.

Saran engine: 2D | 3D | hybrid — hybrid, atau 2D (DATAPHYSICAL) bila ingin aman: topik abstrak (atom, suhu, skala) sulit dengan GLB katalog, tetapi stasiun/kit ruang angkasa ada; infografis skala dan HUD angka jadi tulang punggung.
