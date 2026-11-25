# Asset Candidates — Cara Kerja Face ID: Teknologi yang Lebih Aman dari Password

> Dicari via `audira_search_assets` (2026-11-25). Katalog tidak punya kepala/manekin, chip/PCB, atau modul kamera: bagian itu dibangun prosedural (kepala patung netral, shader titik IR) atau diagram 2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Ponsel di tangan dalam gelap, hujan titik IR membentuk siluet wajah | `smartphone-5f05e5` / ultra; `standing-worker-on-a-8a0f9a` / character | Smartphone 102 tri: perlu material layar + bezel sendiri. Titik IR = instanced dots di permukaan kepala (bukan visual utama melayang). Tanpa logo Apple. |
| c01_intro | Ponsel hero berputar, kartu tanggal 2017, label AUDIRA di stand | `smartphone-5f05e5` / ultra | Stand display bisa dibuat dari material polish; AUDIRA tertulis di stand. |
| c02 | Exploded view 3 modul TrueDepth (flood illuminator, dot projector, kamera IR) | belum ada di katalog | Bangun modul dari silinder/lensa ber-shader + label HUD, atau diagram 2D. |
| c03 | Kepala netral tersorot grid titik, berubah jadi peta kedalaman | belum ada di katalog (cari "head/mannequin/bust" kosong) | Kepala patung netral prosedural / sculpt GLB eksternal; peta kedalaman = shader gradien. |
| c04 | Chip + brankas Secure Enclave | `iron-vault-safe-8b8f29` / prop; `vault-strongroom-d2c032` / building | Chip dibangun prosedural (die + pin); brankas mini masuk ke dalam chip. |
| c05 | Mata terbuka/tertutup, topeng ditolak, layar kode sandi | `chest-padlock-7dc32e` / prop; `smartphone-5f05e5` / ultra | Mata/topeng sebagai ikon HUD 2D; gembok merah untuk penolakan. |
| c06 | Tiga gembok + bar peluang 1:10.000 / 1:50.000 / 1:1.000.000 | `chest-padlock-7dc32e` / prop | Bar data kinetik (DATAPHYSICAL-ish). |
| c07_payoff | Siluet kembar + anak, hero shot ponsel di atas brankas, pintu cadangan PASSCODE | `seated-office-worker-854671` / character; `iron-vault-safe-8b8f29` / prop; `smartphone-5f05e5` / ultra | Karakter sebagai siluet (backlit), bukan wajah jelas. Outro card AUDIRA. |

Saran engine: hybrid — dunia 3D R3F (ponsel, kepala, brankas, titik IR) untuk kedalaman spasial yang jadi inti cerita, plus HUD/diagram 2D untuk modul TrueDepth dan bar peluang karena katalog tidak punya modul kamera, chip, atau kepala.
