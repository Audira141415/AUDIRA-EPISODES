# ASSET MANIFEST — EP07

Semua visual prosedural (kode), tanpa gambar unduhan.

| Aset | Sumber |
|---|---|
| Perempatan, gedung, lampu jalan, lampu lalu lintas, pos polisi, hujan, percikan, pantulan | `studio_16x9/src/scenes/ep07/World.tsx` (palet dari kit FILMNOIR) |
| Tekstur fasad, glow, coretan pantulan, papan nama, kertas catatan bertulisan tangan | `tex.ts` (kanvas, seeded) |
| Mobil sedan + interior | `Car.tsx` (RoundedBoxGeo, POLISH.brickABS, ExtrudeGeometry untuk kabin) |
| Jack dan Bobby | `Person7.tsx` (salinan `core/polish/Person.tsx` + mood, mulut bicara, menerima bayangan), `Cast.tsx` (pose cerita, topi polisi, sabuk) |
| Bilah tirai, catatan, buku tilang, kertas yang diselipkan | `Props.tsx` |
| Daftar shot | `shots.ts` (semua dikunci ke id klip timeline.json) |
| Finishing | `core/render/Finish.tsx` (HDRI `studio_small_09_1k.hdr`, AO, bloom, tone map) + grade kustom "EP07 Noir" |
| Font | Playfair Display, Special Elite, Caveat (Google Fonts, OFL) |
| Brand | `public/brand/stacked-reversed.svg`, `src/brand/AudiraSignature.tsx`, papan HOTEL AUDIRA di dunia 3D |
| Suara | `public/audio/ep07/vo.wav` (Cartesia, dikunci), `public/audio/ep07/mix.wav` (musik + ambience + SFX dari `mix.py`) |
| SFX pustaka | `shared/assets/sfx/`: impact-bass-1, whoosh-cinematic, whoosh-short, click, riser, ping, chime |
