# ASSET MANIFEST — EP59 Finlandia, 3 Juta Sauna
Style: WORLDFORGE — miniatur dunia nyata (kayu, salju, es, granit)

## GLB lokal (polyfork, `project/public/models/polyfork/`, dimuat lewat `<AssetModel id>`)
| ID | Tipe | Dipakai di |
|---|---|---|
| log-cabin-4fac3b | building | kabin sauna (A, B, C, F, G, H) |
| porch-log-cabin-d2f3ef | building | rumah deret (B), desa atlet (G) |
| tall-pine-tree-ab4108 | prop | hutan pinus (A, C, F, H) |
| pine-tree-3ea075 | ultra | pinus FG (A, H) |
| apartment-block-6445af | building | apartemen (C) |
| slab-apartment-block-1b02a2 | building | kantor (C, tint abu hangat) |
| mine-headframe-735cf4 | building | menara tambang (D) |
| mine-cart-94bd76 | prop | gerobak tambang (D) |
| wooden-teoke-bucket-e65f35 | prop | ember sauna (A, E) |
| wooden-barrel-ab50ca | prop | tong air (E, F) |
| plank-bench-c46528 | prop | bangku (E, G) |
| wooden-rowboat-916981 | vehicle | perahu danau (H) |
| dock-platform-section-b36e7c | prop | dermaga (C, H) |
| flagpole-7b7806 | prop | tiang bendera Finlandia (G) |
| an-hourglass-with-sand-ec9f11 | prop | jam pasir (F) |

## Dibangun prosedural (material WORLDFORGE, src/episode/materials.ts)
- Gedung Parlemen granit (tangga + 14 kolom silinder + atap) — tidak ada GLB parlemen.
- Kiuas (tungku + batu Fuzzy), uap löyly (Fuzzy SPHERE naik), asap tipis, salju, danau, bukit, papan kayu ukir "SAUNA".
- Figur: `ToyPerson` + handuk katun (sopan).
- Bendera Finlandia: kain putih + salib biru (bukan logo).

## Audio
- VO: `project/public/audio/vo.wav` (Cartesia, voice 04b567df…, 78,95 dtk) + `vo-words.json` + `vo.timing.json`.
- SFX: `project/public/audio/sfx.wav` dari `npm run sfx` (SHOTLIST.md).
- Tanpa musik berlisensi.

## Brand
- `src/brand/AudiraOutro.tsx`, `src/brand/AudiraSignature.tsx` (seed finlandia-sauna-ep59), papan "AUDIRA" di kabin hero + plang desa atlet.

## Larangan
Cincin Olimpiade, logo UNESCO, wajah orang nyata.
