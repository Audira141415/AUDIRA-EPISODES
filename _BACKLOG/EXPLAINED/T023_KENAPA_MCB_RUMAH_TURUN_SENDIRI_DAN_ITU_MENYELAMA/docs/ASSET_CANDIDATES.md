# Asset Candidates — Kenapa MCB Rumah Turun Sendiri — dan Itu Menyelamatkanmu

> Dicari via `audira_search_assets` (2026-11-26). Katalog tidak punya MCB, panel listrik rumah, kabel, stop kontak, atau alat rumah tangga (rice cooker, setrika, AC). Yang ada: kotak meter, rumah/townhouse, APAR. Semua komponen inti (MCB cutaway, bimetal, kumparan, kabel) harus dibuat 2D atau procedural.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | MCB generik close-up, percikan, ikon mata, 2 stopwatch | `meter-box-1e6e42` / prop (simbolis kotak listrik) | MCB tanpa logo, ilustrasi 2D; mata = ikon, bukan wajah nyata. HUD "0,06 dtk" vs "0,1–0,4 dtk" |
| c01_intro | Rumah malam lampu padam, peta Jakarta generik, ikon api | `townhouse-row-unit-b9544b` / building | Peta 2D tanpa logo Pemprov/BPBD; HUD 607/864, 541/789, "≈7 dari 10" |
| c02 | Cutaway dinding: kabel memanas, isolasi meleleh; MCB transparan dengan 2 komponen | — | Belum ada GLB kabel/MCB; cutaway 2D lebih jelas |
| c03 | Rice cooker, setrika, AC menyala; meteran arus; keping bimetal melengkung | — | Alat rumah tangga tidak ada di katalog; ilustrasi 2D generik tanpa merek. HUD timer "±40 dtk" |
| c04 | Kabel fase/netral bersentuhan, kumparan, plunger, tuas, busur listrik | — | Animasi mekanisme 2D (diagram teknis) |
| c05 | Split-screen mata vs tuas MCB, dua stopwatch | — | Grafik 2D; HUD besar angka uji lab |
| c06 | Tangan mengganjal tuas (silang merah), tukar ampere (silang merah), siluet teknisi buka panel, APAR di dinding | `fire-extinguisher-95dca1` / prop | Teknisi siluet tanpa logo/seragam bermerek; checklist HUD 4 poin |
| c07_payoff | Rumah menyala kembali, label AUDIRA di pintu panel, outro card | `townhouse-row-unit-b9544b` / building, `meter-box-1e6e42` / prop | Outro `audira-outro-card.svg` |

Saran engine: 2D — inti cerita adalah mekanisme di dalam MCB (bimetal, kumparan, kabel memanas) dan perbandingan stopwatch, yang tidak ada di katalog GLB dan paling terbaca sebagai cutaway/diagram 2D (CIRCUITFORGE atau CHAINREACTION); INNERWORKS 3D hanya layak bila MCB dimodelkan sendiri.
