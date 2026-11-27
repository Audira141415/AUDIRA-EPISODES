# ASSET MANIFEST — EP22

Style: HISTORYMAP

## Kode (Sesi B, project/src/scenes/baghdad/)
Salin basis EP19 `project/src/scenes/khalid/` (World.tsx meja + peta, Banner.tsx, Hud.tsx, rig.ts, geo.ts, timing.ts, cues.ts) lalu tambah:
- `BaghdadFilm.tsx` — director per scene (s1–s8 berdasar `t`).
- `City.tsx` — tembok bundar, kubah lathe pirus/emas, menara, istana, perpustakaan bertiang, rumah sakit (prosedural; acuan `EP04_MANSA_MUSA_EMAS_KAIRO/project/src/scenes/mansamusa/CairoMarket.tsx` dan kit `F:/AUDIRA-SKILL-MOTION/kits/islamicdocumentary/src/kits/islamicdocumentary/scene/MosqueSilhouetteSkyline3D.tsx`).
- `Tigris.tsx` — pita sungai + lembar banjir (s4) + air menghitam (s7).
- `Letters.tsx` — dua gulungan + segel retak (s3).
- `Carpet.tsx` — karpet menggulung (s6).
- `Books.tsx` — buku jatuh/mengapung + rak menyala (s7).
- `Smoke.tsx` — puff memanjang 2.5:1 (s5).
- `rig.ts` export `rigPose` (G14), audit rig per segmen bila film ber-hard-cut.

## GLB (E:/ASET/ASSET-AUDIRA/downloads/glb/)
| Scene | id (type) | Catatan |
|---|---|---|
| s1, s2, s4 | soldiers-tent-4bd5b9 (building), canvas-wall-tent-de8a04 (prop) | tint kanvas: Mongol #A89070, Abbasiyah gelap #3A3530 |
| s2 | saddled-horse-da86d3 (animal), cadangan horse-base (rig: SkeletonUtils.clone) | kuda di rute timur; cek pelana western di still |
| s3 | campaign-map-scroll-d4a382 (prop), spell-scroll-29d32d (prop), table-candle-lantern-a7b5af (prop) | retint perkamen; tanpa rune/teks fantasi (sembunyikan bila tampak) |
| s6 | wool-rug-ab2bd1 (prop), cadangan area-rug-5c56e2 (prop) | gulungan lewat deformasi lengkung atau silinder bertekstur sama |
| s7 | lefthand-item-30f012 (ultra, hardback book), exercise-book-stack-266d9d (prop), bookshelf-5e881a (ultra), alcove-bookcase-83894d (prop) | tint kulit coklat; tanpa judul modern |
| s4, s5 | adobe-tapia-wall-run-074dd5 (prop), palm-tree-a307da (prop) | tanggul/tembok tanah, palem tepi Tigris |
| semua | kubah/menara/tembok bundar prosedural | GLB kubah di katalog bergaya gereja/sci-fi, ditolak |
| semua | panji Abbasiyah + tug Mongol prosedural | dari Banner.tsx EP19 |

## Aset bersama
AudiraSignature (seed "baghdad-1258", handle "@AUDIRAQISSAH"), `<AudiraOutro code="QISSAH" />`, HDRI warmStudio (CC0, starter), font kit HISTORYMAP, ikon lucide (`Landmark`, `Crown`, `BookOpen`, `Hospital`; jangan ikon salib/bulan sabit dekoratif), SFX prosedural (`npm run sfx`, TARGET_LUFS -28).

## Data di layar (wajib cocok SOURCE_REGISTER)
1258 (#4) · Al-Musta'sim khalifah ke-37 (#5) · 29 Jan, 10 Feb, ±3.000 tokoh (#4, #5) · 13–20 Feb (#4) · ±800 ribu – 2 juta PERKIRAAN (#4) · 20 Feb 1258, 750 → 1258 (#4) · Michal Biran, 2 tahun (#3) · QS Ali Imran 3:140 terjemah Kemenag (#1).
Koordinat peta (geografi umum): Bagdad 33.31N 44.36E, Hamadan 34.80N 48.51E. Tigris: garis skematik utara–selatan melewati kota.
