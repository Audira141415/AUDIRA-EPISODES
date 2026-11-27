# Asset Candidates — Cara Kerja Pemadam Kebakaran Gedung Tinggi

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya menara kantor, karakter petugas pemadam ber-rig, hidran, APAR, pintu tahan api, dan pos pemadam. Tidak ada mobil tangga/skylift, pencakar langit realistis, lift, tangga darurat, kepala sprinkler, atau pipa tegak: itu dibuat procedural/2D cutaway.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Gedung pencakar langit malam, mobil tangga membentang tapi kurang tinggi, penggaris HUD | `monolith-office-tower-422420` / building, `capsule-residential-tower-80300b` / building, `fire-station-e2b756` / building | Mobil tangga tidak ada di katalog: rakit dari `six-wheel-utility-truck-c8f599` / vehicle + lengan tangga procedural, tanpa merek. HUD "104 m ≈ lantai 25" + "lantai 40 · hitungan sendiri" |
| c01_intro | Gedung tampak sinar-X, jaringan pipa/tangga/lift di dalam | `monolith-office-tower-422420` / building | Shader transparan/x-ray; pipa dan saf procedural |
| c02 | Kepala sprinkler pecah, air hanya di satu ruangan | `fire-extinguisher-95dca1` / prop (prop ruangan) | Kepala sprinkler + tabung kaca close-up procedural atau 2D |
| c03 | Pipa tegak merah dari ruang pompa ke atap, katup tiap lantai, selang mobil ke sambungan di dinding | `fire-hydrant-b68b17` / prop, `fire-point-station-dfd230` / prop, `firefighter-b13b36` / character (Walk/Point) | Pipa, pompa, sambungan siamese procedural; petugas tanpa detail wajah |
| c04 | Petugas masuk lift kebakaran, saf tahan api, dua kabel listrik | `firefighter-b13b36` / character (Walk), `fire-door-set-5a3cca` / building | Lift dan saf procedural; label generik "LIFT KEBAKARAN" |
| c05 | Denah kompartemen, dinding tahan api, tangga bertekanan mendorong asap | `fire-door-set-5a3cca` / building, `fire-alarm-call-box-56d332` / prop | Denah dan panah udara 2D; HUD "> 24 m · ≥ 50 Pa" |
| c06 | Ikon lift dicoret, siluet turun tangga darurat | `fire-escape-section-0b473a` / prop (referensi bentuk tangga, versi luar gedung) | Tangga darurat internal procedural; siluet penghuni tanpa wajah |
| c07_payoff | Gedung utuh, semua sistem menyala, mobil tangga kecil di bawah, outro AUDIRA | `monolith-office-tower-422420` / building, `six-wheel-utility-truck-c8f599` / vehicle | Outro card `audira-outro-card.svg` |

Saran engine: 3D — topik "cara kerja di dalam gedung" paling kuat sebagai cutaway/x-ray spasial (BUILDFORGE atau INNERWORKS), dengan gedung dan petugas dari katalog; sprinkler, pipa tegak, lift, dan tangga dibuat procedural karena tidak ada GLB-nya.
