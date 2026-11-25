# Asset Manifest — EP45 (PIXELSTORY)

Semua visual digambar prosedural dengan kit `studio/src/kits/pixelstory` (albedo + `painter`, sprite + `finish`). Tidak ada GLB, foto, atau logo pihak ketiga.

| Aset | Jenis | Sumber / cara buat | Dipakai di |
|---|---|---|---|
| Set stadion malam (tribun merah-putih, menara lampu, papan iklan AUDIRA, lapangan, lingkaran tengah) | albedo 3 layer | `scenes/ep45/Cover.tsx` `buildSet`, dipindah ke modul bersama episode | A, D, E, OUT |
| Set stadion siang (relight matahari, tribun kuning-biru untuk Swedia) | albedo | turunan set stadion | C1, C2 |
| Ruang tamu 1992 (dinding papan, jendela malam, rak, TV tabung, kalender dinding) | albedo | props kit `plankWall`, `nightWindow`, `shelf`, `books`, `pothos` + TV dan kalender baru di `scenes/ep45/` | B1, B2 |
| Gawang + jaring | albedo + sprite | baru di `scenes/ep45/` | D, E2 |
| Pemain Denmark (merah/putih), pose berdiri, lari ×2, tendang, angkat piala | sprite | `fillSprite` cover diperluas, `finish` kit | A, C, E |
| Pemain lawan generik: putih (Inggris/Jerman), kuning-biru (Swedia), biru (Prancis), oranye (Belanda) | sprite (palet swap) | `recolor` dari sprite pemain | C, D, E |
| Kiper merah generik (siap, melompat) | sprite | baru | D |
| Piala generik emas bertelinga dua | bagian sprite | cover | A, E3, OUT |
| Bola pixel | sprite 6×6 | baru | C, D, E |
| Konfeti, debu cahaya | partikel | kit `DustMotes`, konfeti seeded | A, E3 |
| HUD: bar nyawa, layar level, papan skor, kartu nama, stempel | HTML + Silkscreen | baru di `scenes/ep45/hud.tsx` | semua |
| Font | OFL | `studio/public/fonts` (Anton, Silkscreen) | semua |
| VO | audio | Cartesia voice `04b567df-2923-4b0c-896b-4b7df0a07e1a` | semua |
| SFX | audio | `npm run sfx` prosedural dari SHOTLIST + timing VO (−20 LUFS) | semua |
| Outro + tanda tangan | brand | `shared/assets/brand/audira-outro-card.svg`, `src/brand/AudiraSignature.tsx` | OUT, seluruh film |
