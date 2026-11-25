# Asset Manifest: EP01 Al-Qarawiyyin

Semua visual dibangun prosedural di Remotion + React Three Fiber; tidak ada gambar AI, foto, atau model unduhan.

| Aset | Sumber / file | Catatan |
|---|---|---|
| Panel mosaik 6 gambar (DOOR, MOSQUE, MAP, HALAQAH, LIBRARY, ROSETTE) | `project/src/scenes/qarawiyyin/picture.ts`, `Tesserae.tsx` | ±7.500 keping instanced, material kit MOSAICFORGE (`kits/mosaicforge/lib/materials.ts`); angka dirasterisasi dari Arial Black |
| Serambi, lantai, debu, cahaya | `Hall.tsx` | lengkung tapal kuda extrude, genteng hijau, `Polish` stone + grain |
| Kunci besi + pelat kuningan | `Keys.tsx` | geometri prosedural, grain seeded |
| Dinding bata, tiang, atap hijau, sumur, peti koin, rak naskah, pelat AUDIRA, peti kaca + mushaf tertutup, lampu minyak, menara, plakat 3D | `World.tsx` | tekstur canvas (plakat, ijazah abstrak, sampul bintang geometris, pelat AUDIRA) |
| Sosok tanpa wajah (Fatimah, guru, murid), rehal, bantal | `Figures.tsx` | lathe + bola, kepala terbungkus kain, tanpa fitur wajah |
| Kamera | `camera.ts`, `coverPose.ts` | shot list pada kata (core/camera/moves.ts) |
| HUD, caption karaoke, outro | `Overlay.tsx`, `Hud.tsx` | font Anton, Instrument Serif (`public/fonts`, OFL) |
| Outro card | `public/brand/audira-outro-card.svg` | dipusatkan di #0B3D2E + "Created by Agus Dwi R." |
| Tanda tangan bergerak | `src/brand/AudiraSignature.tsx` | seed `sejarah-islam-ep01`, handle `@audira`, hilang 3,4 dtk terakhir |
| VO | `audio/vo.wav`, `audio/timeline.json` | Cartesia Galang, terkunci 2026-11-11 |
| Musik + ambience | `project/src/scenes/qarawiyyin/mix.py` -> `public/audio/bed.wav`, `full.wav` | sintesis numpy, tanpa lisensi pihak ketiga |
| SFX | `F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx/` (impact-bass-1, whoosh-cinematic, click, click-soft, sparkle, pop, chime, riser) | pustaka SFX AUDIRA (`catalog.json`) |
| Cover | `style/cover-topic.png`, `style/cover.json` | dirender ulang dari film 2026-11-11 (versi disetujui: `cover-topic.v1-approved.png`) |
