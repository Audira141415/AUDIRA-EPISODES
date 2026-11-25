# Asset Candidates — Kenapa Gojek Gagal Jadi Super App Sesungguhnya

> Draf pra-produksi (backlog, 2026-11-25). Dicari via `audira_search_assets` (katalog Polyfork lokal). Rule 15 longgar (channel TECH), tapi tetap tanpa logo asli Gojek/Grab/Tokopedia/TikTok dan tanpa wajah orang nyata: pakai warna dan teks generik.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Ponsel besar dengan grid 18 ikon layanan rontok | `smartphone-5f05e5` / ultra | Layar = plane 2D di atas mesh; ikon dibuat flat 2D |
| c01_intro | Telepon call center, 20 motor ojek | `righthand-item-cf3cdf` / ultra (desk phone handset), `scooter-b4b718` / ultra, `motorcycle-and-sidecar-7d39b8` / vehicle | Instancing scooter ×20; skuter matik lebih cocok untuk ojek daripada touring |
| c02 | Peta Asia Tenggara, pin kota, panah ekspansi | — (peta 2D/GeoJSON) | Peta lebih bersih sebagai 2D/HUD; 12 vs 39 pin |
| c03 | Etalase ikon layanan, kantor kosong | `cardboard-delivery-box-59cc68` / prop, `demountable-partition-run-cc608c` / building, `suspended-ceiling-tile-018d2e` / building | Kit `office-794453` untuk kantor kosong |
| c04 | Dua menara kantor menyatu, bursa | `office-tower-1538cc` / building, `monolith-office-tower-422420` / building | Label "GoTo" sebagai teks, bukan logo |
| c05 | Grafik saham jatuh, menara retak, peta padam | `office-tower-1538cc` / building (dipecah), `boxy-delivery-van-a3ceae` / vehicle (angkut potongan 75%) | Grafik = HUD 2D merah |
| c06 | Diagram pilar penopang, uang terbakar | — (diagram 2D/infografis) | Belum dicari; cocok untuk balok 3D sederhana + HUD |
| c07_payoff | Ponsel dengan 2 ikon menyala, motor golden hour, outro | `smartphone-5f05e5` / ultra, `scooter-b4b718` / ultra | Outro `audira-outro-card.svg` |

Saran engine: hybrid — cerita didominasi peta, grafik saham, dan ikon layanan (lebih tajam di 2D DATAPHYSICAL/BROADCASTFORGE), sementara ponsel, motor, dan menara GoTo bisa jadi objek GLB R3F sebagai jangkar visual per babak.
