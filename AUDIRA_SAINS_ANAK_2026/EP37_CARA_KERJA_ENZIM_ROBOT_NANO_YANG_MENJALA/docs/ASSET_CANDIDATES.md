# Asset Candidates — Cara Kerja Enzim: Robot Nano yang Menjalankan Kimia Tubuhmu

Dicari via `audira_search_assets` (2026-11-25). Katalog GLB tidak punya model molekul/protein/sel; bagian mikro dibuat prosedural (pita protein dari data PDB atau tube geometry, bukan partikel `Points` polos).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Interior sel hati, enzim katalase melahap H2O2 | — | Prosedural: pita protein (PDB 1DGF/katalase) + gelembung molekul berwarna |
| c01_intro | Tubuh anak (zoom out dari molekul) | — | Karakter anak belum dicari spesifik; cari `AssetCharacter` anak di tahap 7 |
| c02 | Sisi aktif + molekul "kunci" masuk pas | — | Prosedural; metafora gembok-kunci boleh ikon HUD 2D |
| c03 | Enzim menutup/menggenggam substrat (induced fit) | — | Prosedural morph pita protein (heksokinase PDB) |
| c04 | Suapan nasi/mangkuk, untai DNA + polimerase | `rice-paddy-tile-dc727e` (prop) | Mangkuk nasi tidak ada di katalog; DNA heliks prosedural |
| c05 | Banjir H2O2 diubah jadi air + O2 | — | Prosedural molekul ball-and-stick |
| c06 | Grafik bukit energi, jam pasir 78 juta tahun vs stopwatch | `wall-clock-0c555c` (prop) | Grafik energi = infografis 2D/HUD |
| c07_payoff | Termometer, enzim terurai, anak beraktivitas, outro AUDIRA | `liquid-handling-robot-c42a98` (prop), `service-robot-93f82e` (character) | Robot hanya opsional untuk metafora "mesin nano" di outro |

Saran engine: hybrid — dunia mikro 3D R3F prosedural (pita protein, molekul) + infografis 2D untuk grafik energi dan HUD; katalog GLB hampir tidak menyediakan aset molekuler.
