# Art Direction — EP05 Kapal Lewat Daratan 1453 (HISTORYMAP)

## Dunia
Peta kertas tebal Konstantinopel, Galata, Tanduk Emas, Laut Marmara, dan Bosporus (garis pantai skematis, digambar tangan) di atas meja peta kayu gelap. Relief dari puncak gaussian seeded, punggung Galata (±60 m) dilebih-lebihkan supaya terbaca. Semua objek berskala diorama: rantai, kapal, dan tag sengaja dibesarkan.

## Palet
| Token | Hex | Pakai |
|---|---|---|
| table | #17130f | meja, latar |
| land | #eadfc2 | kertas daratan |
| sea | #a9b8b4 | air |
| ink | #2b231c | garis pantai, teks tag |
| wall | #8a3a2c / batu #b09878 | tembok kota |
| route | #ffb347 | rute bercahaya, rantai menyala, kata aktif caption |
| red | #a3282b | pita tag, layar bergaris, panah 1204 |
| cream | #f4ead2 | tag kertas, kartu |
| roof | #8e4a33–#c27a4e | atap pelana rumah |

## Cahaya & finishing
Key light hangat dari barat (#ffe2bd, 2,8) dengan bayangan PCF 2048; fill dingin dari timur (#9fb8d6); hemisphere hangat. `<Finish>` profil DOCUMENTARY_WARM, exposure 1, envIntensity 0,55, ao off (parameter terbaik memori style HISTORYMAP). Elemen bercahaya (rute, rantai, tembok teluk) emisif tanpa tone-mapping.

## Material
Kertas (`POLISH.paper` + grain seeded), batu (`POLISH.stone`), atap tanah liat (`POLISH.clay`), layar kain (`POLISH.fabric`), rantai besi metalik dengan grain, gembok emas, plakat kuningan. Perbaikan dari catatan Stage A: rumah kini kubus + atap pelana terakota (bukan dadu polos), lambung galai lebih dalam dengan wale terang, taji di haluan, tiang buritan, sehingga terbaca sebagai kapal, bukan geladak.

## Kamera
Satu rig orbit menerus (target di peta km, jarak, pitch, yaw, fov 34–36) dengan kunci di kata VO dan easing smootherstep, ditambah drift halus. Pose 0 = pose cover. Di bagian penarikan, target mengikuti kapal terdepan.

## Tipografi
Manrope (lokal). Judul hook 140 px, tag 3D kertas dengan halo krem yang menghadap kamera, HUD chip 54 px, caption 56 px semibold dengan pelat gelap blur.

## Penggambaran
Netral dan tidak grafis: tanpa pertempuran, api, atau darah. Tanpa wajah: figur penarik adalah siluet kecil berkain dengan kepala tertutup. Tidak ada teks hadis atau teks Arab. Nama AUDIRA muncul di dunia 3D sebagai plakat kuningan pada peta, tidak pada bangunan ibadah atau teks keagamaan.
