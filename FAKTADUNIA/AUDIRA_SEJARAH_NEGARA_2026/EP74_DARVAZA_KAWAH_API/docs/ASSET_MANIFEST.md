# ASSET_MANIFEST — EP74 Darvaza, Lubang Api Sejak 1971

Style: WORLDFORGE · Remotion + R3F · tanpa foto, tanpa wajah orang nyata, tanpa logo organisasi/bendera.

## Kit

- `F:/AUDIRA-SKILL-MOTION/kits/worldforge/` — `heightfield.ts` (`makeWorldHeight`, `bakeSun`, `bakeAO`), `terrainMesh.ts`, `surface.ts` (material pasir/batu bertekstur), `Sky.tsx` (`SkyDome`, `useSkyEnvironment`), `Stage.tsx`, `noise.ts` (seeded).
- Basis kode episode: pola EP59 Finlandia (WORLDFORGE R3F, `src/episode/*`).
- Look: DOCUMENTARY_WARM, exposure 1 (malam 1,1–1,3), envIntensity 0,55, AO on.

## GLB katalog (`E:/ASET/ASSET-AUDIRA/downloads/glb/`, via `<AssetModel id assetType />`)

| Adegan | Asset ID | Tipe | Peran |
|---|---|---|---|
| S3, S7 | core-drill-rig-3b355e | prop | rig bor 1971 (hero), sumur penyedot 2025 (tint biru-abu) |
| S3, S4 | military-cargo-truck-652f66 | vehicle | truk ekspedisi Soviet (tanpa lambang) |
| S1, S3, S8 | canvas-wall-tent-de8a04 | prop | tenda kamp / tenda wisata di bibir kawah |
| S3 | oil-drum-386c30 | prop | drum bahan bakar kamp |
| S3 | spoil-heap-9aaa11 | prop | tumpukan tanah galian FG |
| S1–S8 | regolith-boulder-1f1f14 | prop | batu gurun di bibir kawah |
| S6 | rope-coil-and-harness-5b51d5 | prop | tali + harness penjelajah |

## Prosedural (bukan visual utama tunggal)

- Kawah: lubang di `height(x,z)` dengan dinding batu berlapis + lantai api (instanced sprite lidah api, seeded, fade-in/out).
- Figur: `<ToyPerson>` dari `core/polish/Person.tsx` (insinyur, penjelajah berbaju perak metalik).
- Papan kayu "AUDIRA", map arsip, tripod tali: geometri sederhana bertekstur kayu/kertas.
- HUD: kartu kinetik 2D di atas canvas (font kit).

## Audio

- VO Cartesia `04b567df-…`; SFX prosedural `npm run sfx` (−26 LUFS stem); tanpa musik berlisensi.
