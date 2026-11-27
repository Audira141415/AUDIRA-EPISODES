# Asset Candidates — Cara Kerja Penipuan Telepon dan Pesan Berantai

> Dicari via `audira_search_assets` (2026-11-27). Topik ini sangat abstrak/digital — aset 3D terbatas dan visual utama lebih cocok 2D (layar ponsel, diagram, skrip teks, UI palsu).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Ponsel berdering, caller ID palsu, skrip di baliknya | `smartphone-5f05e5` / ultra, `righthand-item-cf3cdf` / ultra (desk phone handset) | Caller ID dan skrip teks = overlay 2D. Ponsel GLB sebagai prop |
| c01_intro | Siluet penipu di depan komputer, peta nomor menyebar | `laptop-e775ba` / prop, `office-desk-021eb3` / prop, `bench-desk-module-23c16f` / prop | Siluet tanpa wajah (rule 15); peta dan angka HUD = 2D overlay |
| c02 | Skrip bergulir, penipu berganti topeng (polisi/bank/kurir) | `police-officer-1cc379` / character (Idle), `delivery-courier-327e30` / character (Walk) | Topeng/penyamaran = efek 2D di atas siluet karakter. Skrip = 2D text scroll |
| c03 | Diagram VoIP, caller ID spoofing, SMS massal | `small-server-rack-8ae0a4` / prop, `smartphone-5f05e5` / ultra | Diagram jalur VoIP dan caller ID = sepenuhnya 2D. Server rack sebagai simbol infrastruktur |
| c04 | Tiga panel modus: chat transfer, file APK, login palsu | `smartphone-5f05e5` / ultra, `cardboard-delivery-box-59cc68` / prop | Layar chat, file APK, dan halaman login = 2D UI mockup di atas ponsel. Karton sebagai simbol resi paket |
| c05 | Diagram lingkaran: urgensi, otoritas, ketakutan → transfer | `wall-clock-0c555c` / prop (simbol urgensi) | Diagram 3 langkah = 2D infografis. Jam sebagai simbol urgensi |
| c06 | Papan hukum KUHP + UU ITE, perisai digital | — | Papan teks dan perisai = sepenuhnya 2D. Tanpa logo lembaga (rule 15) |
| c07_payoff | Ponsel berdering, tombol "Tolak", perisai terkunci, outro | `smartphone-5f05e5` / ultra | Outro card `audira-outro-card.svg` |

Saran engine: **2D** — topik ini sangat abstrak dan digital (skrip teks, layar ponsel, diagram alur, UI palsu). Aset GLB yang relevan sangat terbatas (ponsel, laptop, server rack). Visual utama (diagram social engineering, caller ID spoofing, modus penipuan) jauh lebih terbaca dan tajam dalam 2D (VISUALINVESTIGATION, CHAINREACTION, atau BONGKAR). 3D hanya menambah kompleksitas tanpa keuntungan visual yang jelas.
