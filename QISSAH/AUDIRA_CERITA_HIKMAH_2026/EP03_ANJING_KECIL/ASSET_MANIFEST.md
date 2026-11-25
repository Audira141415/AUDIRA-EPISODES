# ASSET MANIFEST — EP03 Anjing Kecil

Semua visual prosedural (tanpa gambar atau AI eksternal).

| Aset | Sumber |
|---|---|
| Kode film | `studio/src/scenes/ep03/`: `Film.tsx` (staging, kamera, cahaya, overlay), `Cast.tsx` (boneka hewan berkaki empat, ayam, petani), `Set.tsx` (diorama), `clay.ts` (material plastisin, tekstur sidik jari, bola benjol), `layout.ts` (peta & waktu), `timeline.json` (estimasi) |
| Kit gaya | Prinsip CLAYWORLD (`src/kits/clayworld`, KIT.md: stepped cadence, squash & stretch, material kasar, cahaya meja hangat); komponen kit tidak disalin, ditulis ulang di folder episode |
| Inti bersama | `src/core/film/Stage3D`, `src/core/render/Post` (GTAO, DOF, bloom, grade), `FinishingPresets.DOCUMENTARY_WARM` |
| Font | Fredoka, Nunito via `@remotion/google-fonts` (OFL) |
| Logo | `public/brand/stacked-reversed.svg` |
| Musik & ambience | disintesis numpy di `studio/src/scenes/ep03/mix.py` → `studio/public/audio/ep03/mix.wav` |
| SFX | `F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx/`: whoosh-cinematic, whoosh-short, whoosh, pop, click-soft, impact-bass-1, ping, riser, chime, sparkle |
| Naskah VO | `EP03_ANJING_KECIL/voiceover.json` (belum disuarakan) |
| Preview | `EP03_ANJING_KECIL/PREVIEW_NO_VO.mp4` (540×960 @30, tanpa narasi) |
