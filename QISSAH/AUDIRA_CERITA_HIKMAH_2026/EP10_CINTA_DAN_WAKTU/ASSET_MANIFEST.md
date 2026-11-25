# ASSET MANIFEST — EP10

Semua visual dibuat prosedural (tidak ada gambar AI atau stok).

- `studio_16x9/src/scenes/ep10/glass.ts`: shader kaca patri (SDF tokoh, perahu, pulau, laut, awan, matahari, medali hati, Voronoi, timah, grisaille, mode genangan cahaya lantai).
- `Cathedral.tsx`: dinding batu ekstrusi dengan 3 lubang lancet, molding, ambang + plakat kanvas "AUDIRA", lantai, kolom, berkas cahaya, debu.
- `story.ts`: state per waktu (posisi tokoh, pose, highlight, air, badai, matahari, petir) + kamera, semua dari `timeline.json`.
- `Overlay.tsx`: judul, caption karaoke, kartu hikmah, outro. `Film.tsx`: komposisi.
- Dari kit STAINEDGLASS (diimpor, tidak diubah): `makeStoneTexture`, `makeShaftTexture`, `mulberry32`, `track`, `StainedCameraRig`, `StainedPost` (bloom + ACES + grade).
- Brand: `public/brand/stacked-reversed.svg`, `src/brand/AudiraSignature.tsx`.
- Font: Cinzel, Cormorant Garamond, EB Garamond (`@remotion/google-fonts`, OFL).
- Audio: `public/audio/ep10/vo.wav` (Cartesia, terkunci), `mix.wav` dari `mix.py` (musik numpy + SFX `shared/assets/sfx/`: ping, chime, whoosh, whoosh-short, whoosh-cinematic, riser, sparkle, impact-bass-1).
