# Asset Candidates — Danau Dalam yang Menyimpan Air Tawar 20% Dunia

> DRAF pra-produksi (backlog, 2026-11-25). Dicari via `audira_search_assets`.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Peta Siberia + lima "tangki" Danau Besar vs satu tangki Baikal | — (prosedural: peta relief + silinder air beranotasi) | Tangki = data-physical, bukan kubus polos; beri label & isi air shader |
| c01_intro | Garis pantai Baikal, hutan taiga, perahu kecil untuk skala | `tall-pine-tree-ab4108` (prop), `pine-tree-3ea075` (ultra), `sailboat-3ee283` (ultra) | Danau sabit dari heightmap/peta; badge UNESCO hanya teks (tanpa logo resmi) |
| c02 | Potongan melintang danau, penggaris kedalaman 1.642 m | `mountaineer-13df29` (character) sebagai pembanding skala di tepi; `rock-cave-ledge-2a9532` (prop) dinding dasar | Kolom air gradient biru-gelap; HUD meter berjalan |
| c03 | Dua tangki volume Baikal vs Danau Besar | `water-blob-f266b8` (prop) untuk percikan isi | Tangki dibangun prosedural dengan `<RoundedBoxGeo>`/silinder + label HUD |
| c04 | Bola Bumi + kubus air tawar, seperlima mengalir ke Baikal | — tidak ada GLB globe (hasil "globe" = lampu) | Bola Bumi prosedural bertekstur peta; belum ada aset |
| c05 | Rift kerak Bumi terbelah; peta 330 sungai masuk, 1 keluar (Angara) | `aquascape-rock-arch-48bf5e`, `rock-bommie-column-0f8a9b` (prop) sebagai lapisan batu | Lapisan kerak lebih baik prosedural (strata berwarna) |
| c06 | Nerpa di bawah es; peta 3 panah asal-usul | — tidak ada GLB anjing laut (hasil "seal" tidak relevan) | Perlu GLB nerpa dari luar katalog / buat di Blender, atau ilustrasi 2D cutout |
| c07_payoff | Hero shot golden hour, dermaga dengan papan AUDIRA, outro | `dock-platform-section-b36e7c`, `dock-lantern-post-5e58a4`, `boat-launch-ramp-dbde11` (prop), `tall-pine-tree-ab4108` (prop) | Brand AUDIRA di papan dermaga (anti-crop) |

Saran engine: hybrid — 3D R3F untuk danau, potongan kedalaman, dan tangki volume (skala adalah inti cerita, cocok SCALEFORGE/WORLDFORGE), tapi nerpa dan globe tidak ada di katalog GLB sehingga perlu cutout 2D atau model tambahan.
