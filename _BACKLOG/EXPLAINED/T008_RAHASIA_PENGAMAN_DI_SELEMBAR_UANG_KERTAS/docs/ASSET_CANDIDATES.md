# Asset Candidates — Rahasia Pengaman di Selembar Uang Kertas

> Dicari via `audira_search_assets` (2026-11-26). Objek inti (uang kertas, perisai, benang, pelat intaglio) tidak ada di katalog GLB, jadi dibuat 2D atau plane bertekstur generik.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Tangan siluet angkat uang generik ke lampu, pola samar menyala | `floor-lamp-f0ba3f` / ultra | Uang = plane bertekstur generik "100.000"; area tanda air oval polos, tanpa wajah |
| c01_intro | Diorama pabrik cetak + ikon mata, tangan, lampu; chip spesifikasi TE 2022 | — (tidak ada GLB pabrik cetak yang cocok) | Gedung generik tanpa logo; name plate teks "Peruri"; ikon lucide `Eye`, `Hand`, `Lamp` |
| c02 | Uang dimiringkan, perisai iridescent, penampang pigmen, benang pengaman | — | Shader iridescent; perisai berisi simbol abstrak, bukan logo BI; HUD "1995" |
| c03 | Pelat logam berukir menekan kertas, tekstur timbul, garis kode tuna netra | — | Penampang 2D/diagram; jari tanpa wajah |
| c04 | Uang di depan cahaya, jaring serat, ornamen tanda air, dua potongan simbol mengunci | `floor-lamp-f0ba3f` / ultra | Rectoverso diganti simbol abstrak (bukan logo BI) |
| c05 | Ruang gelap + lampu UV, mesin fotokopi menolak | `multifunction-printer-3aa70b` / prop | Glow UV ungu; layar panel "DITOLAK"; pola lingkaran kuning abstrak |
| c06 | Exploded view lapisan uang, label terbuka / semi tertutup / tertutup | — | Lapisan transparan 2.5D; ikon gembok lucide |
| c07_payoff | Uang utuh bersinar, kartu langkah lapor, chip pidana, outro AUDIRA | — | Name plate teks "Bank Indonesia" tanpa logo; outro card brand |

Saran engine: 2D — topik makro dan tekstur (iridescent, timbul, cahaya tembus, UV) paling tajam sebagai ilustrasi berlapis + diagram penampang; katalog GLB hampir tidak punya objek inti (hanya lampu dan printer), jadi BONGKAR/PRECISION 2D lebih cocok daripada NANOFORGE 3D.
