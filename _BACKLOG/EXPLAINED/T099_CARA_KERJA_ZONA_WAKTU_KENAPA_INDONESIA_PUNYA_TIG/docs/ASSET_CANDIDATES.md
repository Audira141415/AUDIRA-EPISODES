# Asset Candidates — Cara Kerja Zona Waktu: Kenapa Indonesia Punya Tiga

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya clock tower, wall clock, stasiun kereta, lokomotif uap, gedung kota. Tidak ada globe bumi, peta dunia, atau jam digital: dibuat 2D/procedural.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Jam digital 07:00 vs 09:00, siluet masjid Sabang, rumah panggung Merauke | — | Tidak ada GLB jam digital atau bangunan khas Sabang/Merauke; ilustrasi 2D (split screen). Tanpa wajah/logo (rule 15) |
| c01_intro | Globe berputar, garis meridian 15° | — | Tidak ada GLB globe; procedural sphere + garis meridian di R3F atau ilustrasi 2D |
| c02 | Stasiun kereta uap abad 19, dua jam dinding berbeda, station master | `country-station-building-2d8f5e` / building, `station-clock-post-eaaf63` / prop, `tank-steam-locomotive-314bb1` / vehicle, `station-master-1d6a0a` / character (Idle/Wave), `wall-clock-0c555c` / prop | Kit countryside-railway lengkap untuk diorama sejarah. HUD "1879 Fleming", "1884 Washington" |
| c03 | Peta Indonesia 3 warna (WIB/WITA/WIT), label zona | — | Peta 2D (batas generik, 3 warna); HUD callout UTC+7/+8/+9. Tanpa logo pemerintah |
| c04 | Globe dengan garis meridian lurus vs zig-zag, peta China | — | 2D lebih terbaca: animasi garis meridian lurus → bengkok. HUD "15° = teori" |
| c05 | Panel India, Nepal, China — jam offset unik | `wall-clock-05f8ff` / prop, `clock-tower-752081` / building | Tiga panel 2D per negara lebih jelas; jam dinding sebagai prop pendukung |
| c06 | Peta Indonesia 3 warna → 1 warna → kembali 3 | — | Transisi warna 2D; HUD "2012: wacana UTC+8". Tanpa logo pemerintah |
| c07_payoff | Globe zona waktu menyala emas, zoom Indonesia, outro AUDIRA | — | Globe procedural atau 2D; outro card `audira-outro-card.svg` |

Saran engine: **2D** (HISTORYMAP atau SATELLITEBRIEFING) — topik ini didominasi peta, globe, dan infografis garis meridian yang lebih tajam dan terbaca di 2D. Hanya c02 (diorama stasiun kereta) yang bisa memanfaatkan 3D dari kit countryside-railway. Jika satu engine: 2D lebih aman karena globe, peta negara, dan split-screen jam tidak ada sebagai GLB.
