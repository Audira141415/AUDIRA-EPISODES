# Asset Candidates — Cara Kerja Indeks Kualitas Udara (ISPU & AQI)

> Dicari via `audira_search_assets` (2026-11-27). Topik ini sangat infografis-berat (tabel breakpoint, kartu warna, rumus, perbandingan skala). Visual utama = diagram 2D, bukan model 3D. Aset GLB hanya pendukung latar kota.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Ponsel menampilkan angka ISPU, kota berkabut di latar | `smartphone-5f05e5` / ultra, `art-deco-setback-tower-b3a788` / building (latar kota) | Angka dan warna = overlay 2D; kabut = efek shader |
| c01_intro | Stasiun pemantau udara, 6 jalur pencemar | — | Stasiun pemantau = ilustrasi 2D (kotak sensor generik, tanpa logo). Enam ikon pencemar = lucide-react icons |
| c02 | Tabel breakpoint, interpolasi linier, angka naik | — | Sepenuhnya 2D: tabel animasi, garis interpolasi, angka counter |
| c03 | Lima kartu warna ISPU berurutan | — | Kartu 2D dengan warna resmi ISPU: hijau, kuning, oranye, merah, maroon |
| c04 | Perbandingan ISPU (5) vs AQI AS (6) side-by-side | — | Diagram 2D side-by-side; tambahan kartu "USG" oranye dan "Very Unhealthy" ungu di sisi AQI |
| c05 | Siluet paru-paru, partikel PM2.5 masuk, counter WHO | — | Siluet 2D generik; partikel = titik kecil animasi; counter "4,2 juta" |
| c06 | Ponsel dengan angka ISPU, ikon masker/jendela | `smartphone-5f05e5` / ultra | Ikon dari lucide-react (Shield, Wind, Home) |
| c07_payoff | Ponsel dari hook dengan label "ISPU", langit bersih, outro | `smartphone-5f05e5` / ultra | Outro card `audira-outro-card.svg` |

Saran engine: **2D** — topik ini 80% infografis (tabel, kartu warna, rumus, perbandingan skala). Aset 3D yang tersedia (gedung kota) hanya relevan sebagai latar, bukan subjek utama. 2D engine (DATAPHYSICAL atau SATELLITEBRIEFING) lebih tepat untuk data-heavy explainer.
