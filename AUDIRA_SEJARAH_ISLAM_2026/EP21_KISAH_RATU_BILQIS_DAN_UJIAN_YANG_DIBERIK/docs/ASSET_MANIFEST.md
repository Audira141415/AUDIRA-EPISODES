# Asset Manifest — EP21 Ratu Bilqis (HD2D)

Style: HD2D

| Chapter | Aset | Sumber | Status |
|---|---|---|---|
| semua | sprite piksel berkerudung tanpa wajah (ratu berdiri/berjalan/mengangkat ujung jubah/berdoa, Sulaiman jauh dari belakang, pembesar, utusan, penyembah kecil) | prosedural `pixel.tsx` (basis EP20 `scenes/yusuf`, EP17 `scenes/umar`) | Sesi B |
| c00/c06 | istana kaca: panel kaca physical + bidang air normal seeded bergulir, ikan sprite, tiang pualam, lampu gantung emas | prosedural (MeshPhysicalMaterial transmission) | Sesi B |
| c01 | kota Saba bata lumpur, kuil matahari pilar persegi, bendungan Marib, papan gerbang "AUDIRA", balkon | prosedural (pola rumah tanah liat EP17/EP20) | Sesi B |
| c02 | barisan burung + Hud-hud jambul oranye, perkemahan tenda, disk matahari senja | sprite piksel + prosedural; `fallen-bird-feather-ffbc11` (prop FG) | cek di Sesi B |
| c03 | majelis: meja, kursi ratu, obor, surat gulung bersegel | prosedural; obor pola EP17 | Sesi B |
| c03/c04 | peti hadiah (satu bercap AUDIRA) + tumpukan koin, unta kafilah | GLB `chest-dais-d2bc39`, `coin-hoard-heap-07b6e4` (prop); unta sprite (pola kafilah EP17) | cek di Sesi B |
| c04/c05 | singgasana emas + permata yang terlepas | GLB `looted-gilded-throne-008fc3`, `cut-ruby-3ded3a`, `cut-emerald-74d180` (prop) | cek di Sesi B |
| c05 | aula batu pualam, tirai kain, jendela berkas cahaya | prosedural (aula pola EP20) | Sesi B |
| c07 | bukit fajar, panorama istana + lembah | prosedural | Sesi B |
| HUD | kartu ayat 27:20–44 / 27:22–24 / 27:29–35 / 27:40 / 27:42 / 27:44, "BILQIS · RIWAYAT ULAMA", "IBNU ABBAS · IBNU KATSIR", pilihan PERANG/HADIAH, "SEBELUM MATAMU BERKEDIP", "BUKAN AIR · KACA" | komponen HUD kit HD2D + `core/icons` (ICON_HUD) | Sesi B |
| outro | `<AudiraOutro code="QISSAH" />` (`node scripts/channel.mjs --check`) | brand | ada |
| audio | VO Cartesia (voice 04b567df…, teks "Audira"), SFX `npm run sfx` stem `TARGET_LUFS = -28`, bed musik drone + ney tanpa nyanyian | | Sesi B |
