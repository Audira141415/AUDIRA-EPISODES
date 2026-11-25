# Asset Manifest — EP10 Wilt Chamberlain 100 Poin, 2 Maret 1962 (VINTAGEFORGE)

Style: VINTAGEFORGE

Set dan figur dibuat di `studio/src/scenes/ep10/` (`sets.tsx`, `Film.tsx`, `hud.tsx`) dengan impor ulang `ep02` (`Cam`, `camAt`, `ToyPerson`, `LOOK`, `Sign`, `LampLights`, `useWood`, `useBrass`, `Frame`, `Card`, `NameCard`, `Stamp`, `Flash`, `Captions`, `Model`). Prop pendukung memakai GLB dari katalog lokal `E:/ASET/ASSET-AUDIRA/downloads/glb/prop/` (disalin ke `studio/public/glb/`). Tidak ada foto, wajah nyata, logo Warriors/Knicks/NBA.

| Aset | Jenis | Sumber / cara buat | Dipakai di |
|---|---|---|---|
| Arena tua: lapangan parket bertekstur kanvas, garis, tribun bertingkat, papan HERSHEY · 1962 | set R3F | `ArenaSet` di `sets.tsx` | A, B2, C2, D1, E1 |
| Papan skor manual kayu + kartu angka gantung | set R3F | `sets.tsx` (Sign + kayu `useWood`) | A, C1 |
| Ring basket | GLB | `basketball-backboard-2624e9` | B2, D1, E1 |
| Kota pabrik cokelat + cerobong | GLB + set | `cowled-chimney-stack-de5055`, `chimney-roof-passage-90dedd` + gedung prosedural, salju | B1 |
| Meja siaran radio | GLB | `field-radio-set-b6f3fd`, `vintage-microphone-stand-c5ba82` | B2, E3 |
| Rak arsip | GLB | `bookshelf-5e881a` | E3 |
| Ruang ganti (meja, lampu, kertas "100") | set R3F | `sets.tsx` + `Sign` | E2 |
| Vitrin MUSEUM AUDIRA (3 alas 100 · 83 · 81, kaca, tali pembatas) | set R3F | `MuseumSet` di `sets.tsx` | OUT |
| Figur Wilt, pemain, penonton, humas | Figur | `ToyPerson` (ep02) dengan `WILT_LOOK`, pose `shootPose`/`grabPose`/`cheer` | A–E2 |
| Bola basket | mesh R3F | `Ball` di `sets.tsx` | D1, E1 |
| HUD: Card, NameCard, Stamp, Tally, Flash, jam 0:46 | overlay | `ep02/hud.tsx` + `ep10/hud.tsx` | semua |
| Caption karaoke | overlay | `Captions` dari `timeline.json` VO | semua |
| VO | audio | Cartesia voice `04b567df-2923-4b0c-896b-4b7df0a07e1a`, lang id → `audio/vo.wav` | semua |
| SFX | audio | `npm run sfx` prosedural dari SHOTLIST + timing VO; crowd/chant sintetis, tanpa rekaman arsip | semua |
| Outro + tanda tangan | brand | kartu outro AUDIRA + `AudiraSignature` lewat `signed("Ep10", ...)` di `Root.tsx` | OUT, seluruh film |
