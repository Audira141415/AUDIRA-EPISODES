# Asset Candidates — Fisika Kuantum Untuk Pemula: Dunia di Bawah Atom Sangat Aneh

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Rambut close-up, deret atom karbon | — (prosedural: tabung rambut + instanced sphere atom) | Tidak ada GLB rambut/atom di katalog; bola atom = bagian model molekul, bukan visual titik acak |
| c01_intro | Atom + awan elektron, papan lab "AUDIRA SAINS" | research-microscope-77ce04 (prop) sebagai props lab | Atom dibangun sebagai model inti + orbital bertekstur |
| c02 | Lab klasik Planck, cahaya jadi paket | senior-scientist-631736 (character, clip Point) | Tokoh generik tanpa wajah Planck asli; nama hanya di HUD |
| c03 | Mikroskop elektron, layar dua celah, titik detektor | microscope-e7b9d5 (prop), research-microscope-77ce04 (prop) | Pelat dua celah + layar detektor dibuat sederhana di scene |
| c04 | Layar detektor time-lapse pola interferensi | — (tekstur/shader pola akumulasi titik) | Pola muncul bertahap, mengikuti foto Hitachi (#3) |
| c05 | Kabut gelombang peluang runtuh jadi titik | senior-scientist-631736 (character, clip Idle) memegang detektor | Kabut = volumetrik, harus terbaca sebagai "elektron" |
| c06 | Partikel tembus dinding, matahari, ponsel | smartphone-5f05e5 (ultra) | Matahari: belum ada GLB (hasil cari "sun" tidak relevan), pakai sphere emissive + corona |
| c07_payoff | Chip berkilau, medali Nobel, outro | computer-bench-run-lit-87d9cf (prop), smartphone-5f05e5 (ultra) | Chip & medali belum ada di katalog, buat prop sederhana; outro card AUDIRA |

Saran engine: hybrid — 3D R3F untuk lab, mikroskop, dan atom (POLYVERSE/NANOFORGE), dengan layer 2D HUD/diagram untuk pola interferensi dan superposisi yang lebih terbaca sebagai infografis.
