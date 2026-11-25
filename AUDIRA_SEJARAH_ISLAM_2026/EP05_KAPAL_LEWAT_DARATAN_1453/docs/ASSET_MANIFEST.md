# Asset Manifest — EP05 Kapal Lewat Daratan 1453

Semua visual dibuat prosedural di Remotion + React Three Fiber (tanpa gambar AI, tanpa foto). Folder kode: `project/src/scenes/galata/`.

| Aset | Sumber / file | Catatan |
|---|---|---|
| Peta kertas + relief | `world.ts` (canvas 2048², puncak gaussian seed 1453) | garis pantai skematis, tangan |
| Meja, tembok, menara, kota beratap, Menara Galata, rantai + pelampung | `parts.tsx` | atap pelana instanced (Stage B) |
| Galai (lambung, wale, taji, layar, dayung, kereta, rol) | `parts.tsx` `Ship` | `lod` tanpa dayung untuk armada jauh |
| Tag kertas 3D | `parts.tsx` `Tag` (+ `face` menghadap kamera) | teks hanya dari naskah/register |
| Kamp Utsmaniyah, jalur menyala, gembok, kartu kertas (hadis, Venesia 1439), plakat AUDIRA, tim penarik (sapi, siluet tanpa wajah), kerekan, kilau pelumas, armada 70 kapal | `props.tsx`, `fleet.ts` | seeded, deterministik |
| Kamera | `camera.ts` (kunci di kata VO) | pose 0 = `style/cover.json` |
| Timing | `time.ts` + `timeline.json` (salinan `audio/timeline.json`) | |
| Film | `GalataFilm.tsx` (`GalataPreview`, `GalataFinal`), cover `GalataCover.tsx` | |
| Font | `public/fonts/manrope-*.woff2` (OFL) | |
| Outro | `public/brand/audira-outro-card.svg` | di #0B3D2E + "Created by Agus Dwi R." |
| Tanda tangan | `src/brand/AudiraSignature.tsx` seed `sejarah-islam-ep05` | lapisan terakhir |
| VO | `audio/vo.wav`, `project/public/audio/vo.wav` | Cartesia, terkunci |
| Bed | `project/public/audio/bed.wav` dari `mix.py` | sintesis numpy |
| Mix | `project/public/audio/full.wav` | untuk `--vo` final |
| SFX | `F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx/` (impact-bass-1, whoosh-cinematic, whoosh-short, pop, click, sparkle, riser, chime) | pustaka AUDIRA |
| Draft | `draft/DRAFT_SHEET.jpg` (8 frame, 4×2), `draft/CHECK_PAYOFF_64-82s.mp4` (540×960) | |
