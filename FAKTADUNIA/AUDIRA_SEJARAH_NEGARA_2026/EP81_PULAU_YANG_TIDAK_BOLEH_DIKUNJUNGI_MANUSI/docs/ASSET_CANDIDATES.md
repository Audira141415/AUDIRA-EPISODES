# Asset Candidates — Pulau yang Tidak Boleh Dikunjungi Manusia — Selamanya

> Hasil `audira_search_assets` 2026-11-25. Semua tokoh suku sebagai siluet tanpa wajah.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | pulau hutan berkarang, cincin radius merah | palm-tree-a307da / prop | pulau dibangun dari terrain + pohon instanced; cincin radius = HUD |
| c01_intro | peta Andaman, siluet suku di tepi hutan | toromiro-tree-a50794 / prop, palm-tree-a307da / prop | peta 2D/HUD; siluet karakter: belum dicari (pakai `<AssetCharacter>` dengan material hitam) |
| c02 | kapal kolonial + sekoci | rowboat-c42d85 / vehicle, sailboat-3ee283 / ultra | kapal layar besar belum ditemukan (query "sailing ship" tidak relevan) |
| c03 | perahu tim, kelapa mengapung | wooden-rowboat-916981 / vehicle | kelapa: tidak ada aset, buat bola sederhana bertekstur atau ikon 2D |
| c04 | helikopter, pemanah siluet, perahu nelayan | helicopter-9d1986 / vehicle, arrow-eb66a4 / prop, sunken-fishing-boat-061c70 / vehicle | busur belum ditemukan |
| c05 | kapal patroli, perahu karet, dokumen regulasi | rowboat-c42d85 / vehicle | kapal patroli dan perahu karet belum dicari lebih lanjut; dokumen = kartu HUD 2D |
| c06 | diagram penyebaran penyakit | — | 2D infografis (partikel kuman sebagai ikon, bukan visual utama) |
| c07_payoff | pulau golden hour, cincin emas, outro | palm-tree-a307da / prop | outro card AUDIRA |

Saran engine: hybrid — dunia pulau, laut, perahu, dan helikopter cocok 3D GLB, sedangkan peta, kronologi tahun, dan diagram penyakit lebih terbaca sebagai HUD 2D.
