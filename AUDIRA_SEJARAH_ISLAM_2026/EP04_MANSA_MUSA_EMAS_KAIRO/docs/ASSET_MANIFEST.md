# Asset Manifest — EP04 Mansa Musa: Emas di Kairo

Semua visual adalah geometri 3D prosedural (React Three Fiber) dan sprite pixel yang dibangun dari peta karakter di kode. Tidak ada gambar AI, foto, atau model unduhan.

| Aset | Sumber | Lisensi / catatan |
|---|---|---|
| Pasar Kairo, gerbang ablaq, kubah, menara, kios, lentera, timbangan, koin | `project/src/scenes/mansamusa/CairoMarket.tsx` | dibuat untuk episode ini |
| Meja penulis, papan harga, peti kosong, meja utang, peti "AUDIRA" (tekstur kanvas) | `MarketExtras.tsx` | dibuat untuk episode ini |
| Kemah Giza, piramida bertingkat, Nil, perahu, palem, istana, porter, pejabat | `GizaZone.tsx` | dibuat untuk episode ini |
| Peta voxel (masker daratan 3°), sungai, jalur kafilah, vellum Atlas Katalan, tableau singgasana | `MapTable.tsx`, `layout.ts` | garis pantai digambar tangan pada grid 3°, perkiraan visual |
| Sprite pixel (jamaah, porter, unta, pejabat, tangan penulis) | `pixel.tsx` | dibuat untuk episode ini, semua tanpa wajah |
| Kamera, waktu kata, overlay (karaoke, pin, HUD, outro) | `camera.ts`, `time.ts`, `Overlay.tsx`, `MansaMusaFilm.tsx` | dibuat untuk episode ini |
| Font Anton, Silkscreen, Space Grotesk | `project/public/fonts` | OFL (lihat `public/fonts/licenses`) |
| HDRI `brown_photostudio_02_1k.hdr` | `project/public/hdri` | CC0 (Poly Haven) |
| Kartu outro `audira-outro-card.svg` | `project/public/brand` | brand AUDIRA |
| Tanda tangan bergerak (`@AUDIRAQISSAH`) | `project/src/brand/AudiraSignature.tsx` | brand AUDIRA |
| VO | `audio/vo.wav` (Cartesia sonic, suara Galang) | dibuat dengan AI, wajib label konten AI |
| Musik + ambience | `project/src/scenes/mansamusa/mix.py` → `public/audio/bed.wav` | disintesis numpy, milik AUDIRA |
| SFX | `F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx/` (impact-bass-1, whoosh-cinematic, whoosh-short, pop, sparkle, click, click-soft, typing, riser, glitch-1, chime) | pustaka SFX AUDIRA |
