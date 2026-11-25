# Kandidat Aset — Neutrino: Partikel Hantu yang Menembus Bumi Tanpa Hambatan

> Dicari 2026-11-25 lewat `audira_search_assets`. Katalog tidak punya detektor neutrino, reaktor nuklir, bumi, atau supernova: bagian itu dibangun prosedural/shader.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Tubuh manusia ditembus hujan garis cahaya | `senior-scientist-631736` / character (siluet, clip Idle) | Tubuh dibuat siluet tanpa wajah jelas; garis neutrino = shader streak, bukan `Points` sebagai visual utama |
| c01_intro | Neutrino menembus tembok lalu Bumi | `lab-wall-solid-8bd631` / building | Bumi = sphere bertekstur (tidak ada GLB globe yang cocok) |
| c02 | Meja kerja 1930, surat, timbangan energi | `office-desk-021eb3` / prop, `floor-lamp-f0ba3f` / ultra | Belum ada GLB timbangan; buat prosedural. Pauli tanpa wajah (nama plate saja) |
| c03 | Reaktor nuklir + tangki air besar | `oxygen-tank-223f7f` / prop (proksi tangki) | Reaktor tidak ada di katalog: belum ditemukan, bangun dari silinder + kubah |
| c04 | Gunung + rongga Super-K berisi air dan dinding sensor | `bare-mountain-rowan-10e72e` / prop (alpine), `power-gem-e28c25` / prop (proksi sensor PMT, di-instance) | Dinding sensor = instanced sphere keemasan |
| c05 | Lanskap es Kutub Selatan + untai sensor | `ice-axe-and-crampon-e4c7c1` / prop, `mountain-refuge-hut-32ab1e` / building (proksi stasiun) | Untai sensor IceCube = instanced bola di kabel |
| c06 | Neutrino berganti warna; irisan Bumi | belum ditemukan | Prosedural: sphere lapisan inti/mantel, partikel berganti warna |
| c07_payoff | Supernova, gelombang tiba di Bumi + outro card | belum ditemukan | Ledakan = shader + bloom; outro `audira-outro-card.svg` |

Saran engine: 3D — subjek fisik berskala (detektor raksasa, es Antartika, Bumi, supernova) paling kuat dengan kedalaman ruang R3F; GLB katalog hanya pendukung, elemen inti perlu dibangun prosedural.
