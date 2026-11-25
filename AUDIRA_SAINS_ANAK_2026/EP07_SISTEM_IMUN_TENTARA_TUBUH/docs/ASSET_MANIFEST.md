# ASSET_MANIFEST — EP07 Sistem Imun Tentara Tubuh

Style: NANOFORGE

## GLB (Polyfork lokal `E:/ASET/ASSET-AUDIRA/downloads/glb/`)
- Katalog tidak punya sel/bakteri/virus (cek `audira_search_assets` 2026-11-25).
- S1/S7: ranjang, bantal, lampu meja, jendela → cari `audira_search_assets` "bed", "lamp" di sesi B.
- Anak: `<ToyPerson>` dari `core/polish/Person.tsx`.

## Prosedural (episode `project/src/episodes/imun/`)
- Sel (tabel karakter ART_DIRECTION): icosahedron detail 5–6 + displacement noise seeded (`useSurfaceGrain`/noise kit nanoforge), MeshPhysicalMaterial.
- Kit nanoforge: `world/MicroCosmos.tsx`, `world/Atmosphere.tsx`, `cellular/CellularVesicle.tsx`, `lib/palette.ts`, `lib/materials.ts`.
- Dinding pembuluh: tabung inside-out bertekstur; kulit tergores: plane berlapis dengan displacement.

## Brand
- `src/brand/AudiraSignature.tsx` (seed `sains-EP07-sistem-imun`, handle `@AudiraSains`).
- Outro: `F:/AUDIRA-EPISODES/CHANNEL_BRAND/channel-brand-audira-sains/src/horizontal-reversed.svg` + "Created by Agus Dwi R.".
