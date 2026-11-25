# Asset Candidates — EP54 Rahasia Kejayaan Kekaisaran Ottoman

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00 Hook | Kubah, menara, angka "600" | Prosedural (teks kinetik + geometri kubah) | Tidak ada GLB masjid/kubah di katalog |
| c01 Intro | Peta animasi 3 benua, HUD "36 sultan" | `classroom-globe-16a96e` (prop) | Peta lebih cocok 2D/prosedural |
| c02 Awal Mula | Diorama Anatolia, Konstantinopel runtuh | `castle-gatehouse-4ed5c6` (building, medieval-japan); `watchtower-140f78` (building, medieval-village) | Gatehouse bisa jadi gerbang Konstantinopel |
| c03 Janissary | Barisan tentara, pedang, meriam | `spear-soldier-base` (character); `armoured-knight-hero-07121f` (character, dungeon-crypt); `sword-0e681b` (prop); `deck-cannon-17849e` (prop, pirate-cove) | Karakter bukan Ottoman spesifik, tapi bisa diwarnai ulang |
| c04 Millet | Simbol 3 agama, pengadilan | `brick-church-322885` (building, nyc-city); `looted-gilded-throne-008fc3` (prop) | Simbol agama dan pengadilan lebih cocok 2D overlay |
| c05 Puncak | Peta puncak, singgasana sultan | `looted-gilded-throne-008fc3` (prop); `crown-a294ce` (prop, dungeon-crypt); `ship-s-longboat-f159fd` (vehicle, pirate-cove) | Peta dan wilayah lebih kuat di 2D |
| c06 Keruntuhan | Peta menyusut, bendera baru, ledakan | `soldiers-tent-4bd5b9` (building, three-kingdoms); `cannonball-f87cdc` (prop) | Animasi peta menyusut = 2D |
| c07 Payoff | Warisan (masjid, arsitektur), outro | Prosedural + outro card AUDIRA | Montase warisan lebih cocok 2D |

## Catatan

Katalog GLB tidak memiliki aset Ottoman/Islam spesifik (masjid, kubah, kaligrafi). Aset medieval (castle, knight, sword) bisa dipakai sebagai pendekatan, tapi visual utama (peta animasi, HUD data, simbol agama, timeline) lebih kuat dalam 2D.

Saran engine: **2D** — Topik ini berat di peta wilayah, timeline kronologis, data callout (angka tahun, luas wilayah), dan simbol-simbol (bulan sabit, salib, bintang Daud). Semua itu lebih tajam dan informatif dalam 2D motion graphic. Style CHRONICLE sangat cocok untuk narasi sejarah berjenjang. Alternatif: **hybrid** (2D utama + beberapa elemen 3D dari kit medieval-village/pirate-cove untuk diorama singkat).
