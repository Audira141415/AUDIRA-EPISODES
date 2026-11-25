# Asset Candidates — Kenapa Astronot Jadi Lebih Tinggi di Luar Angkasa

> Dicari 2026-11-25 lewat `audira_search_assets`. Katalog punya astronot ber-rig dan modul stasiun, tapi tidak punya model tulang belakang/anatomi; ruas vertebra, cakram, dan otot perlu dibuat prosedural (ANATOMIX) atau di Blender.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Astronot melayang di dalam stasiun, meteran tinggi memanjang | `astronaut-explorer-323482` (character, klip Idle/Wave/Point), `station-corridor-d7efdb` (building) | Pose melayang: klip Idle + rotasi pelan; meteran prosedural |
| c01_intro | Anak di lapangan, panah gravitasi, pegas tertekan | — | Karakter anak dari katalog karakter umum (belum dicari detail); pegas prosedural |
| c02 | Cutaway tulang belakang: ruas + cakram memipih | — | Tidak ada GLB tulang belakang. Buat ruas prosedural (silinder + prosesus) dan cakram lunak bershader |
| c03 | Roket meluncur, interior stasiun, tulang belakang transparan meregang | `cargo-shuttle-7907d0` (vehicle), `station-hub-67f667` (building), `astronaut-scientist-47d733` (character) | Belum ada GLB roket klasik di hasil; shuttle kargo sebagai pengganti atau cari "rocket launch" lagi |
| c04 | Penggaris raksasa, kartu arsip Skylab | `command-center-e65850` (building) | Penggaris & kartu HUD dibuat sendiri; jangan pakai foto/logo NASA asli |
| c05 | Astronot memegang punggung, diagram otot & kurva lordosis | `astronaut-engineer-20b738` (character) | Diagram MRI bergaya ilustrasi, bukan foto medis asli |
| c06 | Penampang tulang berpori, alat olahraga di stasiun | `battery-bank-b4d362` (prop) sebagai panel latar | Alat beban (ARED) tidak ada di katalog: prosedural sederhana |
| c07_payoff | Kapsul mendarat, pegas tertekan, outro | `cargo-shuttle-7907d0` (vehicle), `regolith-mound-ac2843` (prop, tidak dipakai bila latar Bumi) | Outro card `audira-outro-card.svg` |

Saran engine: 3D — astronot, stasiun, dan tulang belakang yang memanjang paling terbaca sebagai objek ruang (ANATOMIX cutaway + GLB astronot), dengan HUD 2D untuk angka.
