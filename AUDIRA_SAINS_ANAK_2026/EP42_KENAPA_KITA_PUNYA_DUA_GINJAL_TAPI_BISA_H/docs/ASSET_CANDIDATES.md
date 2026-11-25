# Asset Candidates — Kenapa Kita Punya Dua Ginjal tapi Bisa Hidup dengan Satu

> Dicari via `audira_search_assets` (2026-11-25). Katalog Polyfork tidak punya GLB organ/anatomi (query "organ anatomy heart" tidak relevan): ginjal, nefron, dan embrio harus dibuat prosedural/ilustrasi.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Dua ginjal berdenyut, satu memudar | — | Ginjal prosedural (lathe/sculpt bentuk kacang, material subsurface merah muda) atau ilustrasi 2D |
| c01_intro | Siluet tubuh tembus pandang, kepalan tangan skala, tangki darah vs gelas urine | — | Tubuh: ilustrasi/kaca stilasi; tangki & gelas prosedural (`water-bottle-crate-78c8db` / prop kurang cocok) |
| c02 | Irisan ginjal, nefron (glomerulus + tubulus) | — | Diagram bertingkat 2D/2.5D paling terbaca; belum ada GLB |
| c03 | Embrio, dua tunas ginjal tumbuh kiri-kanan, simetri mata/paru | — | Ilustrasi embrio stilasi (bukan foto medis); split-screen simetri |
| c04 | Meteran kapasitas, grid 1.000 ikon orang | — | Infografis 2D (instanced icon) |
| c05 | Rumah sakit Boston 1950-an, dua siluet kembar tanpa wajah, dokter | `doctor-d49de0` (character, clips Idle/Walk/Point), `bed-head-service-panel-67f6f6` (prop), `medical-gas-cylinder-a2d6a7` (prop), `stair-and-lift-core-a13dd9` (building) | Kit `hospital-kit-2ebfcb`; tokoh nyata tampil sebagai siluet/name plate, tanpa wajah asli |
| c06 | Ginjal tersisa membesar, grafik batang +40% | — | Ginjal prosedural yang sama dengan c00 (konsistensi hero) + chart kinetik |
| c07_payoff | Tubuh utuh simetris, kerumunan berjalan, outro AUDIRA | `doctor-d49de0` dan karakter umum `<AssetCharacter>` (Walk) | Outro card `audira-outro-card.svg` |

Saran engine: hybrid — anatomi (ginjal, nefron, embrio) lebih jelas sebagai diagram 2D/2.5D berlapis (BEDAH/ANATOMIX), adegan rumah sakit 1954 bisa 3D R3F dengan kit hospital; katalog GLB tidak punya organ, jadi 3D murni berisiko jadi bentuk abstrak.
