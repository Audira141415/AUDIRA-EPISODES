# Asset Manifest — EP08 Owi/Butet, Kado Emas 17 Agustus 2016 (HD2D)

Style: HD2D

Diorama 3D Remotion + R3F (`studio/src/scenes/ep08hd/`). Pemain = sprite piksel slab; set = GLB lokal + geometri `RoundedBoxGeo`/`POLISH.*` + tekstur kanvas. Tidak ada foto, wajah asli, atau logo pihak ketiga (IOC, BWF, PBSI, maskot Rio 2016).

| Aset | Jenis | Sumber / cara buat | Dipakai di |
|---|---|---|---|
| Lapangan, net, tribun penonton, papan iklan AUDIRA, lampu atap | geometri + tekstur kanvas | `ep08hd/tex.ts`, `sets.tsx` (`Court`, `Stand`, `Board`, `Arena`, `ArenaLights`) | A, C, D, E1 |
| Kamar atlet: ranjang, meja samping, lampu meja, lemari trofi | GLB | `public/glb`: `bed-6e10e8`, `bedside-table-3f2b80`, `table-lamp-e25998`, `trophy-cabinet-e963ac` (asal katalog `E:/ASET/ASSET-AUDIRA/downloads/glb/`) | B |
| Medali emas, jendela malam, poster AUDIRA | geometri + tekstur kanvas | `sets.tsx` `SetB` | B |
| Halaman Kemenpora: gedung, tiang bendera, pohon | geometri + GLB | `palm-tree-a307da`, `front-yard-fir-tree-0a278d`; `Flag` (tekstur kanvas Merah Putih) | C2 |
| Barisan orang berdoa 3×7 | sprite slab | `figures.ts` prayer | C2 |
| Podium 2-1-3 + tiga tiang bendera (INA, MAS, CHN) | `RoundedBoxGeo` + `POLISH.toyPlastic` + `Flag` | `sets.tsx` `Block`, `SetE2` | E2 |
| Panggung, Monas, gedung kota, billboard AUDIRA, kembang api | geometri + tekstur kanvas + GLB | `brass-post-lamp-984201`; `Monas`, `City`, `Fireworks` di `sets.tsx` | OUT |
| Owi, Butet, lawan China / Malaysia, Susy 1992 | sprite slab | `ep08hd/figures.ts` (palet INA, MAS, CHN, KIT_1992, KIT_2016), `slab.tsx` | semua |
| Kok + jejak, confetti | geometri | `Shuttle`, `Confetti` | A, C, D, E1 |
| HUD: jam, papan waktu, chip, kartu nama, papan skor, stempel, ikon medali, plakat, teaser EP09 | HTML + Silkscreen/Anton ≥ 40 px | `scenes/ep08/Film.tsx`, `scenes/ep08/hud.tsx` | semua |
| Finishing | post | `core/render/Finish.tsx` (HDRI studio, AO, bloom, DOF), profil DOCUMENTARY_WARM | semua |
| Font | OFL | `studio/public/fonts` (Anton, Silkscreen) | semua |
| VO | audio | Cartesia voice `04b567df-2923-4b0c-896b-4b7df0a07e1a` → `studio/public/audio/ep08/vo.wav` | semua |
| SFX | audio | `npm run sfx` dari `docs/SHOTLIST.md` + timing VO → `studio/public/audio/ep08/sfx.wav` | semua |
| Outro + tanda tangan | brand | `audira-outro-card.svg`, `AudiraSignature` lewat `signed("Ep08")` di `Root.tsx` | OUT, seluruh film |
