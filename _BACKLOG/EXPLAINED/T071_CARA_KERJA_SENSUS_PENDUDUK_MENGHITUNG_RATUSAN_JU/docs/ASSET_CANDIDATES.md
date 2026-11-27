# Asset Candidates — Cara Kerja Sensus Penduduk: Menghitung Ratusan Juta Orang

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya bangunan kota/rumah (kit NYC, Mediterania, medieval), karakter berjalan ber-rig, tablet, laptop, dan papan peta. Tidak ada rumah khas Indonesia, Kartu Keluarga, atau peta Indonesia: itu dibuat 2D. Rule 15: tanpa wajah orang nyata, tanpa logo BPS/Dukcapil/Kemendagri, tanpa rompi/seragam petugas asli.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Kota/kampung dari atas, titik orang bergerak, ikon bayi, truk pindahan, counter macet | `commuter-381e7f` / character (clip Walk), `brownstone-row-house-1b84fd` / building, `city-bus-49fd97` / vehicle | Rumah gaya NYC kurang lokal; lebih aman ilustrasi 2D atap genteng generik. Karakter dari jauh, wajah tidak terbaca |
| c01_intro | Rana kamera "klik", kota membeku jadi polaroid "SEPT 2020" | — | 2D: efek freeze-frame + bingkai polaroid; HUD "270,20 juta jiwa" (#1) |
| c02 | Lemari arsip, map KK generik terbang jadi tabel, stempel "DATA DASAR" | `laptop-e775ba` / prop, `computer-bench-run-lit-87d9cf` / prop | Map/KK fiktif tanpa nama/NIK asli; HUD "Sensus ke-7" (#2) |
| c03 | Ponsel berisi formulir, kalender 15 Feb–29 Mei 2020, siluet petugas ke rumah, peta 3 zona | `tablet-fe3f76` / ultra, `data-tablet-cbbc3e` / prop, `construction-worker-c1ad8c` / character (clip Walk, hanya siluet), `two-story-house-40f6dc` / building | Petugas = siluet tanpa wajah & tanpa seragam asli; peta zona 2D |
| c04 | Rumah + jam pasir "≥ 1 tahun", peta Indonesia generik dengan pin KK dan garis pindah | `classroom-globe-16a96e` / prop, `campus-map-board-90e067` / prop | Peta Indonesia 2D (batas generik); HUD "8,68% · ±23,47 juta" (#4) |
| c05 | Strip film menyambung polaroid: Long Form 2022, SUPAS 2025, Dukcapil 31 Des 2025 | — | 2D infografis; tiap angka berlabel sumber + tanggal (#5, #8, #9) |
| c06 | Dua papan angka + timbangan netral, kalender 10 tahun "UU 16/1997 Pasal 8" | — | 2D; tidak menyatakan mana yang benar (netral) |
| c07_payoff | Timeline polaroid 1961–2020, slot "berikutnya", kota bergerak lagi, outro | `commuter-381e7f` / character (clip Walk) | Outro card `audira-outro-card.svg`; tahun sensus dari #2 |

Saran engine: 2D — topik konsep + data (potret waktu, tabel, peta, papan angka berlabel), aset 3D yang ada bergaya kota Barat dan tidak menambah keterbacaan; DATAPHYSICAL/CERDIK 2D paling cocok, karakter 3D hanya opsional sebagai siluet jauh.
