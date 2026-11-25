# Asset Candidates — Kenapa Apple Intelligence Telat Hadir di iPhone

> DRAF pra-produksi (2026-11-25). Dicari via `audira_search_assets`. Tanpa logo Apple/Google/OpenAI asli: nama merek tampil sebagai teks HUD.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | iPhone hero melayang, kalender/jam berputar 2024 ke 2026 | `smartphone-5f05e5` (ultra), `wall-clock-05f8ff` (prop) | Smartphone 102 tri: perlu material kaca + layar emisif Siri; tahun di HUD |
| c01_intro | Panggung presentasi + layar besar | `hall-stage-deck-1f5a11` (building), `projection-screen-8355f3` (prop), `lecturer-s-podium-e77fe6` (prop) | Gelembung pesan/email = kartu HUD 2D di layar proyeksi |
| c02 | Lintasan balap dua penanda, folder rahasia "AJAX" | belum ada aset lintasan/folder yang cocok | Penanda bisa kartu teks 3D; folder = prop sederhana ber-shader style |
| c03 | Paket terbuka berisi ikon fitur, deretan iPhone | `smartphone-5f05e5` (ultra, diinstansi beberapa kali) | Ikon fitur = HUD; iPhone lama digelapkan, 15 Pro menyala |
| c04 | Papan iklan kota padam, toko | `holo-billboard-frame-96e583` (prop), `flat-screen-television-97b1f3` (prop) | Billboard bergaya kota; kutipan "longer than we thought" sebagai callout |
| c05 | Ruang sidang + uang | belum ada aset palu/meja hakim (`gavel` 0 hasil); `big-six-money-wheel-0f7174` (prop) kurang cocok | Pakai `lecturer-s-podium-e77fe6` sebagai meja hakim + counter "$250 JUTA" HUD |
| c06 | Timbangan chip vs rak server | `small-server-rack-8ae0a4` (prop), `computer-bench-run-lit-87d9cf` (prop) | Timbangan belum dicari spesifik; skala bisa dibangun dari data-bar 3D |
| c07_payoff | iPhone menyala + menu bahasa, siluet pengguna | `smartphone-5f05e5` (ultra), karakter siluet via `<AssetCharacter>` (belum dipilih) | Daftar bahasa = HUD; baris "Bahasa Indonesia" abu-abu; outro card AUDIRA |

Saran engine: hybrid — topiknya timeline + angka (cocok HUD/infografis 2D seperti CERDIK/BROADCASTFORGE), tapi beberapa adegan (iPhone hero, panggung, rak server vs chip) lebih kuat sebagai objek 3D; aset GLB untuk sidang dan lintasan tipis, jadi bagian itu diselesaikan dengan HUD 2D.
