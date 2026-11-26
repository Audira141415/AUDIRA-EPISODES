# Asset Candidates — Cara Kerja Alat Pemadam Api Ringan (APAR)

> Dicari via `audira_search_assets` (2026-11-26). Katalog punya APAR (2 varian + beroda), meja kantor, papan EXIT, jeriken, hidran, dan kotak alarm. Tidak ada panel listrik, wajan/penggorengan, atau cutaway bagian dalam APAR: itu dibuat 2D/procedural.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Lorong kantor, APAR merah di dinding, tabung "terbelah" jadi 4 ikon isi | `fire-extinguisher-95dca1` / prop (kit office), `office-desk-021eb3` / prop, `bench-desk-module-23c16f` / prop | Label tabung generik, tanpa merek; HUD "4 jenis isi" |
| c01_intro | Segitiga api: bahan bakar, panas, oksigen | — | Diagram 2D + ikon lucide (Flame, Thermometer, Wind) |
| c02 | Kertas/kayu (A), jeriken bensin (B), stop kontak/panel (C), logam (D), wajan minyak (K) | `firewood-stack-810f49` / prop, `fuel-jerrycan-6f1d85` / prop, `cardboard-delivery-box-59cc68` / prop | Panel listrik & wajan tidak ada di katalog; ilustrasi 2D. Api logam cukup ikon, jangan dramatisasi |
| c03 | Cutaway 3 tabung: air, busa, CO2; tanda silang air ke minyak/listrik | `fire-extinguisher-74d502` / prop, `fuel-jerrycan-6f1d85` / prop | Cutaway 2D lebih jelas; semburan CO2 putih (partikel hanya efek pendukung, bukan visual utama) |
| c04 | Cutaway APAR serbuk: gas pendorong, pipa sifon, serbuk menyelimuti api, rantai reaksi patah | `fire-extinguisher-95dca1` / prop | Belah tabung jadi diagram 2D/3D hybrid; HUD "A B C" |
| c05 | Siluet menekan alarm, papan EXIT, 4 kartu PASS | `fire-alarm-call-box-56d332` / prop, `illuminated-exit-sign-23becd` / prop (kit office), `exit-sign-aa48ad` / prop | Karakter tanpa wajah (siluet/ToyPerson); tangan memegang APAR bisa 2D |
| c06 | Dinding + penggaris 1,2 m, dua APAR berjarak 15 m, jarum tekanan + label periksa | `fire-extinguisher-95dca1` / prop, `gauge-and-valve-panel-f2164c` / prop (referensi jarum) | Garis ukur & close-up gauge sebagai HUD 2D |
| c07_payoff | Api membesar, siluet keluar, ponsel generik "113 / 112", lorong aman, outro | `illuminated-exit-sign-23becd` / prop, `fire-hydrant-b68b17` / prop, `wheeled-fire-extinguisher-4bde8b` / prop | Ponsel generik 2D; outro card `audira-outro-card.svg` |

Saran engine: hybrid — APAR, kantor, dan papan EXIT tersedia sebagai GLB dan cocok untuk 3D (INNERWORKS), tetapi inti cerita adalah cutaway isi tabung, segitiga api, tabel golongan, dan kartu PASS yang lebih tajam di 2D; bila harus satu engine, 2D (CERDIK/BONGKAR) lebih aman karena panel listrik, wajan, dan bagian dalam APAR tidak ada di katalog.
