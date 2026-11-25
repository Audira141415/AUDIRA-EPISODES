# ASSET_MANIFEST — EP72 Gempa Lisbon 1755

Style: MOSAICFORGE · Remotion + R3F · tanpa foto, tanpa wajah orang nyata, tanpa logo organisasi.

## Kit

- `F:/AUDIRA-SKILL-MOTION/kits/mosaicforge/` — `TesseraeField3D` (drop + settle), `MosaicHall3D`, `lib/image.ts` (SDF lukisan ubin per adegan), `lib/materials.ts` (`makeCeramicMaterial`, `makeGroutTexture`, `makeFlagstoneTexture`), `camera/rig`, `MosaicPost` (FilmScene `post={false}`), `core/motion` (`tileDelay`, `mulberry32`).
- Look: DOCUMENTARY_WARM, exposure 0,84, envIntensity 0,4, AO on.

## GLB katalog (`E:/ASET/ASSET-AUDIRA/downloads/glb/`, via `<AssetModel id assetType />`)

| Adegan | Asset ID | Tipe | Peran |
|---|---|---|---|
| S2 | brick-church-322885 | building | gereja hari raya |
| S2, S6 | table-candle-lantern-a7b5af | prop | lilin hari raya → pemicu api |
| S4 | dock-lantern-post-5e58a4 | prop | dermaga Tejo |
| S4 | ship-anchor-c2b4f1 | prop | jangkar di dasar pelabuhan |
| S4 | ship-s-longboat-f159fd | vehicle | bangkai kapal/sekoci terdampar |
| S6, S7 | two-story-house-40f6dc | building | rumah kota atas |
| S6, S7 | brick-tenement-7d2014 | building | blok kota |
| S6, S7 | corner-tenement-92fb62 | building | blok kota |
| S6 | classical-bank-04954e | building | massa istana Ribeira (tint krem, tanpa tulisan) |
| S8 | village-well-f8e361 | prop | alun-alun reruntuhan |
| S9 | timber-barn-90b3ce | building | referensi rangka kayu / gudang konstruksi |

Cadangan bila GLB gagal: fallback kit (`AssetModel` fallback), dicatat di NOTES.md.

## Prosedural (bukan visual utama polos)

- Panel azulejo per adegan (lukisan SDF: rumah retak, gelombang, api, peta Iberia, denah Baixa, fasad Pombalina).
- Gelombang tsunami: instanced tile wave 3 lapis (ubin biru + buih putih).
- Api: billboard nyala + haze, bloom hanya pada api.
- Rangka gaiola: balok `RoundedBoxGeo` kayu + `useSurfaceGrain`, silang diagonal.
- Tokoh: `<ToyPerson>` / `<SwimCrowd>` kain, kepala berkain bulat (jemaah, penyintas, Pombal, pasukan).
- Buku/halaman, surat kuesioner: plane kertas bertekstur.

## Audio

- `project/public/audio/vo.wav` — Cartesia sonic-3, voice 04b567df-2923-4b0c-896b-4b7df0a07e1a (teks fonetik di SCRIPT.md).
- `project/public/audio/sfx.wav` — `npm run sfx` dari SHOTLIST + timing VO (stem −26 LUFS, mix G18).
- Tanpa musik berlisensi.

## Brand

- `src/brand/AudiraSignature.tsx` seed `gempa-lisbon-ep72`, handle `@AudiraFaktaDunia`.
- Outro: `shared/assets/brand/audira-outro-card.svg` / outro starter, 2–3 dtk terakhir.
- Brand kit channel: `F:/AUDIRA-EPISODES/CHANNEL_BRAND/channel-brand-audira-fakta-dunia/src/` (wordmark/symbol reversed).
- Brand di adegan: ubin plakat "AUDIRA" S1 + S11; VO menyebut "Audira" di outro.

## Font

Anton (angka/judul), Manrope (label, karaoke) — bundel starter.
