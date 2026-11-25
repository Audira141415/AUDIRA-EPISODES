# Asset Candidates — Bagaimana Otak Menyimpan Kenangan Jangka Panjang

Dicari via `audira_search_assets` (2026-11-25). Katalog tidak punya model otak, neuron, atau sinaps; elemen anatomi perlu dibuat prosedural (mesh berbentuk organ, bukan partikel `Points` sebagai visual utama) atau ilustrasi 2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Rumah masa kecil, piring sarapan | `forest-outhouse-e968d1` / building (kurang cocok); `backyard-doghouse-50a492` / prop; `floor-houseplant-8fad17` / prop | Rumah tinggal tidak ditemukan dengan kueri "house"; cari ulang "cottage"/"home" di tahap 7 |
| c01_intro | Otak 3D semi-transparan + jaringan neuron | belum ada GLB otak | `brain-coral-head-7db21a` / prop hanya karang, jangan dipakai sebagai otak. Buat otak prosedural atau ilustrasi |
| c02 | Ruang operasi 1950-an, siluet pasien, hipokampus | `bed-head-service-panel-67f6f6` / prop (hospital-kit-2ebfcb); `clinical-vinyl-floor-tile-d5e53e` / prop | Pasien tanpa wajah (siluet). Hipokampus = model prosedural |
| c03 | Dua neuron, sinaps menebal | belum ada GLB | Prosedural: tabung + bola dengan material emisif, callout LTP |
| c04 | Siput laut, inti sel, pabrik protein | `snail-base` / animal; `turbo-snail-6b500c` / animal | Siput darat/laut low-poly sebagai pengganti Aplysia |
| c05 | Kamar tidur malam, anak tidur | `bedside-table-740c6b` / prop; `bedside-table-3f2b80` / prop | Tempat tidur tidak muncul; cari "bed frame" di tahap 7; karakter via `<AssetCharacter>` |
| c06 | Grafik kurva lupa, sinaps meredup | — | Grafik 2D/HUD |
| c07_payoff | Otak utuh, rumah hook, papan AUDIRA | pakai ulang aset c00 | Outro card AUDIRA |

Saran engine: hybrid — anatomi (otak, neuron, sinaps) paling jelas sebagai 3D prosedural R3F, sementara kurva lupa, kartu tahun, dan HUD data lebih tajam sebagai lapisan 2D; katalog GLB hanya menutupi adegan rumah, rumah sakit, kamar, dan siput.
