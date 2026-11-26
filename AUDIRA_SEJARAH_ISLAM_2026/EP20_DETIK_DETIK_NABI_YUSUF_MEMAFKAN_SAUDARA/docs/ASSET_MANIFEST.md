# Asset Manifest — EP20 Nabi Yusuf Memaafkan (HD2D)

Style: HD2D

| Chapter | Aset | Sumber | Status |
|---|---|---|---|
| semua | sprite piksel berkerudung tanpa wajah (duduk di singgasana, berdiri, berjalan, mundur selangkah, bersimpuh, mengulurkan tangan, berlari membawa gamis, ayah + anak kecil) | prosedural `pixel.tsx` (basis EP17 `scenes/umar`, EP04 `scenes/mansamusa`) | Sesi B |
| c00/c04/c05 | aula istana: lantai batu kapur, tiang papirus, jendela atap, singgasana | prosedural kotak bevel + tekstur seeded; singgasana GLB `looted-gilded-throne-008fc3` (prop) atau prosedural | cek di Sesi B |
| c01 | gerbang kota bata lumpur + papan "AUDIRA", unta, sungai Nil | prosedural (pola rumah tanah liat EP17); unta sprite piksel (pola kafilah EP17) | Sesi B |
| c02 | atap rumah Kanaan, 11 bintang, matahari, bulan sabit | prosedural emisif | Sesi B |
| c03 | karung gandum (satu bercap AUDIRA), timbangan kuningan, piala raja, obor, balkon | GLB `grain-sack-401d96`, `hemp-grain-sack-f91edc`, `goblet-87c3ba` (prop); timbangan prosedural (pola EP17 c06) | cek di Sesi B |
| c05 | gamis terlipat, jalan gurun + kafilah | prosedural kain; kafilah sprite | Sesi B |
| c06 | meja kitab, lampu minyak, jam pasir | prosedural (lampu minyak pola EP17) | Sesi B |
| c07 | bukit fajar, panorama kota Mesir, piramida jauh | prosedural | Sesi B |
| HUD | kartu ayat 12:58 / 12:77 / 12:89–90 / 12:92, "11 BINTANG", "±40 TAHUN · RIWAYAT TAFSIR", "SHAHIH BUKHARI 3374", "AKU YUSUF" kinetik | komponen HUD kit HD2D + `core/icons` (ICON_HUD) | Sesi B |
| outro | `<AudiraOutro code="QISSAH" />` (`node scripts/channel.mjs --check`) | brand | ada |
| audio | VO Cartesia (voice 04b567df…, teks "Audira"), SFX `npm run sfx` stem `TARGET_LUFS = -28`, bed musik drone + ney tanpa nyanyian | | Sesi B |
