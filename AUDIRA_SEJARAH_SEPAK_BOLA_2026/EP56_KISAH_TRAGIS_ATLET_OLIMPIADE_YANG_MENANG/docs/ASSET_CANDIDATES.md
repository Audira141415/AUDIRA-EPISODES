# Asset Candidates — Kisah Tragis Atlet Olimpiade yang Menang tapi Tidak Pernah Diakui Negaranya

> Dicari via `audira_search_assets` (2026-11-25). Tokoh nyata tampil sebagai siluet tanpa wajah.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Podium juara, tiang bendera, stadion 1936 | `lecturer-s-podium-e77fe6` / prop; `advertising-hoarding-run-efe4bc` / prop | Tidak ada podium Olimpiade 3 tingkat; lebih baik ilustrasi 2D. Bendera = tekstur 2D. |
| c01_intro | Lintasan, pelari siluet, garis finis | `a-running-track-tile-daf991` / prop; `turf-pitch-tile-aca1ef` / prop | Pelari: `<AssetCharacter clip="Run">` dari katalog character (belum dipilih id spesifik). |
| c02 | Peta Asia Timur, nomor dada "SON KITEI", bibit pohon ek | `oak-tree-50ee7c` / prop | Peta + kartu nomor dada = grafis 2D. Bibit ek perlu versi kecil/diskalakan. |
| c03 | Mesin cetak, halaman koran dengan bendera dihapus, stempel | `newspaper-box-3f2c0e` / prop | Halaman koran wajib grafis 2D (ilustrasi ulang, bukan foto asli). |
| c04 | 4 medali emas, lobi hotel New York, lift barang, telegram | belum ada (pencarian "elevator" kosong) | Medali + amplop = grafis/2D; lobi bisa ilustrasi berlapis. |
| c05 | Podium 1968 dari belakang, lencana di jaket, kalender 1972 | `lecturer-s-podium-e77fe6` / prop | Tanpa wajah; lencana dibuat ulang generik (bukan logo asli OPHR). |
| c06 | Medali sipil, obor + stadion penuh, ruang parlemen | `trophy-cabinet-e963ac` / prop | Obor dan ruang parlemen = ilustrasi 2D. |
| c07_payoff | Tiga medali di bawah lampu sorot, langit fajar, outro AUDIRA | — | `shared/assets/brand/audira-outro-card.svg`. |

Saran engine: 2D — kisah arsip/potret sejarah dengan koran, peta, dan siluet; katalog GLB minim aset Olimpiade (podium, medali, lift, obor), sehingga CINESTORY/FILM16 2D lebih kuat daripada 3D.
