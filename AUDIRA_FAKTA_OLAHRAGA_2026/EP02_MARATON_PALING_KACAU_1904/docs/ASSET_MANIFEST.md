# Asset Manifest — EP02 Maraton Paling Kacau, St. Louis 1904 (VINTAGEFORGE)

Engine Remotion + R3F. Semua GLB dari katalog lokal `E:/ASET/ASSET-AUDIRA/downloads/glb/` (disalin ke `studio/public/glb/<id>.glb`), dimuat lewat `scenes/ep02/Model.tsx` (bukan `_shared/Glb.tsx`), di-tint sepia oleh `Finish profile=VINTAGE_SEPIA_FILM`. Figur = `ToyPerson` stilasi tanpa wajah realistis. Tidak ada foto, wajah asli, atau logo pihak ketiga (IOC, AAU, koran nyata). Debu = overlay 2D.

| Aset | Jenis | Sumber / cara buat | Dipakai di |
|---|---|---|---|
| Set jalan desa (jalan tanah, pagar, tiang telegraf, cottonwood mati, kincir pompa, sagebrush) | GLB + set | `RoadSet.tsx` (sudah ada, = cover): `split-rail-fence-run-87da39`, `telegraph-pole-line-95e382`, `dead-cottonwood-edbde8`, `windmill-pump-2993a4`, `sagebrush-700b03` | A, C1 |
| Mobil 1904 | GLB | `MotorCar` di `RoadSet.tsx` (`buckboard-wagon-59ec16` + bagian mobil) | A, C1 |
| Tiang mil kayu "9" | set | `MilePost` di `RoadSet.tsx` | C1 |
| Tribun stadion + lintasan + papan iklan kayu "AUDIRA" | GLB | `grandstand-seating-run-fc9023`, `a-running-track-tile-daf991`, `advertising-hoarding-run-efe4bc` (ada), `stand-roof-run-cfd457` (ada); baru di `scenes/ep02/StadiumSet.tsx` | B1, C2 |
| Pita finis + bendera rumbai + kamera kayu bertripod | prosedural | baru di `StadiumSet.tsx` (kotak kayu + lensa kuningan, kaki tripod silinder) | C2 |
| Pompa air tangan + ember | GLB | `hand-water-pump-448037`; ember dari `whiskey-barrel-7bb83f` (skala kecil) | B2 |
| Bukit berlapis 7 punggung | prosedural | plane terdisplace berlapis + haze di `scenes/ep02/HillSet.tsx` | B2, D2 |
| Meja pelatih: botol STRYCHNINE, telur, brandy | GLB + prosedural | `potion-bottle-b28245` (label kertas tekstur kanvas), `whiskey-bottle-and-glass-fa24b4`, telur = ellipsoid; meja kayu prosedural; baru di `scenes/ep02/TrainerTable.tsx` | D1 |
| Gerbang finis kayu | prosedural | baru di `HillSet.tsx` | D2 |
| Pohon apel + apel merah | GLB | `orchard-apple-tree-b21f85` (atau `apple-tree-ef0ba0`), apel = sphere merah | E(a) |
| Ladang jagung + anjing | GLB | `corn-crop-b71f2f`, `farm-dog-723730` (animal, animasi lari bila ada clip, kalau tidak bob prosedural) | E(b) |
| Papan kapur berbingkai kuningan | prosedural | baru (plane + teks kapur Special Elite) | E(c) |
| Kantor koran: meja, lampu minyak, tumpukan koran | GLB + prosedural | `street-oil-lamp-d246ea` (skala meja) atau `reading-table-lit-lamps-efeb3e`; koran = plane tekstur canvas "THE AUDIRA GAZETTE" | OUT |
| Figur: Lorz (penumpang melambai, kram, menembus pita), Hicks (limbung), pelatih (memapah), Carvajal (pendek, celana dipotong, makan apel), Taunyane (dikejar), starter berjas, Alice Roosevelt stilasi (topi lebar), penonton bertopi | figur | `ToyPerson` + `runPose` / `sitWave` / pose `Person.tsx`; Lorz & Hicks beda warna kemeja + kartu nama | semua |
| Debu, gelombang panas halusinasi, kilat magnesium, grain film | overlay 2D | baru di `scenes/ep02/Overlays.tsx` (canvas/SVG di atas `ThreeCanvas`) | semua |
| HUD: kartu tiket/label museum, termometer kuningan, peta rute 40 km, stempel tinta (≤ 860 px, tanpa rotasi), jam saku "3:28:53", kartu nama, kartu teaser EP03 | HTML | baru di `scenes/ep02/hud.tsx`; font Rye / Special Elite / Playfair Display (Google Fonts OFL), ≥ 34 px | semua |
| VO | audio | Cartesia voice `04b567df-2923-4b0c-896b-4b7df0a07e1a`, lang id; teks TTS menulis "Audira", "Saint Louis", "striknin" | semua |
| SFX | audio | `npm run sfx` prosedural dari SHOTLIST + timing VO (−20 LUFS): klakson bulb, pistol start, kilat magnesium, stempel, detak jantung + riser, impact payoff, gonggongan, mesin cetak | semua |
| Outro + tanda tangan | brand | `shared/assets/brand/audira-outro-card.svg`, `src/brand/AudiraSignature.tsx` (`seed="olahraga-EP02"`) lewat `signed()` + `SLUG` di `Root.tsx` | OUT, seluruh film |

GLB baru yang perlu disalin ke `studio/public/glb/`: `grandstand-seating-run-fc9023`, `a-running-track-tile-daf991`, `hand-water-pump-448037`, `potion-bottle-b28245`, `whiskey-bottle-and-glass-fa24b4`, `orchard-apple-tree-b21f85`, `corn-crop-b71f2f`, `farm-dog-723730`, `street-oil-lamp-d246ea`.
