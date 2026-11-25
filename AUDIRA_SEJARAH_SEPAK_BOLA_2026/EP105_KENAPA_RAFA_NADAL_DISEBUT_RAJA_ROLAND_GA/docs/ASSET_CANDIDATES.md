# Asset Candidates — Kenapa Rafa Nadal Disebut Raja Roland Garros yang Tak Tergoyahkan

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | HUD angka 112 / 4, siluet pemain di baseline | belum ada GLB tenis | Dibuat 2D (tipografi + siluet generik tanpa wajah) |
| c01_intro | Peta Paris ke lapangan tanah liat | terrain: tidak ditemukan | Pencarian "tennis" = 0 hasil; buat vektor 2D |
| c02 | Kalender 2005, kartu umur, piala | prop: trophy-cabinet-e963ac, natural-20-trophy-plinth-c31c9c | Piala generik, bukan replika resmi turnamen |
| c03 | Papan skor tahunan 2005-2014 | tidak perlu aset | Infografis 2D |
| c04 | Empat kartu kekalahan | tidak perlu aset | Teks kinetik; tanpa foto lawan |
| c05 | Papan skor 6-3 6-3 6-0 | tidak perlu aset | HUD data |
| c06 | Bagan donat 112-4 | tidak perlu aset | Infografis 2D |
| c07_payoff | Plakat marmer + jejak kaki di tanah liat | prop: belum ada yang cocok | Buat dari geometri; ikon outro AUDIRA |

Hasil pencarian: "tennis" 0 aset; "trophy" 2 aset; "stadium" hanya tile atletik/rumput (turf-pitch-tile-aca1ef), tidak cocok untuk tanah liat.

Saran engine: 2D — tidak ada aset tenis GLB, konten berbasis angka/infografis, dan wajah atlet nyata dilarang (cocok DATAPHYSICAL).
