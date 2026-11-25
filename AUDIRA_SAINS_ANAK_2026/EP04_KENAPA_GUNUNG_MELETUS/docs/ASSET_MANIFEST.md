# ASSET MANIFEST — Kenapa Gunung Meletus (AUDIRA Sains EP04)

Style: DISASTERSIM

## Model GLB (katalog lokal `E:/ASET/ASSET-AUDIRA/downloads/glb/`, via `<AssetModel id>`)

| ID | Adegan | Peran |
|---|---|---|
| `palm-tree-a307da` | 1, 6 | pohon kelapa pulau Krakatau dan pinggir sawah |
| `hanga-roa-fishing-boat-f09534` | 1 | perahu nelayan FG, skala manusia |
| `classroom-globe-16a96e` | 2 | globe kelas tempat busur Cincin Api |
| `energy-drink-can-c47bcf` | 4a | kaleng soda analogi gas |
| `lava-rock-pile-d56d19` | 4b | batuan vulkanik FG |
| `two-story-house-40f6dc` | 5s | rumah desa bersalju 1816 |
| `villager-40255c` | 5s | penduduk di salju |
| `observation-tower-69b692` | 5b | menara pos pantau |
| `antenna-mast-0954b0` | 5b | antena telemetri |
| `ranger-station-ef6407` | 5b | stasiun pengamatan |
| `rice-paddy-tile-dc727e` | 6 | petak sawah (63 tile) |
| `banana-plant-978d7f` | 6 | pohon pisang |
| `beach-hut-fc7649` | 6 | gubuk sawah |
| `village-child-bef09e` | 6 | anak desa FG |

## Geometri episode (bukan visual utama abstrak)
- `Volcano` (kerucut strato/perisai/kaldera dengan noise), `AshPlume`, `Sea`, `SkyDome`, `Terrain`, `Ring` (cincin suara/gempa), `DrawTube` (busur Cincin Api, aliran lava): `project/src/episodes/gunung/Volcano.tsx`, `Scenes.tsx`.
- `GunungEarthBlock`: balok penampang bumi (lempeng, mantel, dapur magma): `project/src/episodes/gunung/GunungEarthBlock.tsx`, memakai palet + motion kit `src/kits/disastersim`.

## Audio
- VO: `project/public/audio/vo.wav` (Cartesia Galang `04b567df`, 76,63 dtk) + `vo-words.json` (200 kata).
- SFX: `project/public/audio/sfx.wav` dari `npm run sfx` (prosedural, dari `docs/SHOTLIST.md`).
- Musik: tidak dipakai.

## Brand
- `src/brand/AudiraSignature.tsx` (seed `sains-anak-EP04-gunung`), `src/brand/AudiraOutro.tsx` (3 dtk).
- Channel brand: `F:/AUDIRA-EPISODES/CHANNEL_BRAND/channel-brand-audira-sains`.

## Lisensi
GLB dari katalog lokal AUDIRA (lisensi tercatat di katalog). SFX prosedural buatan sendiri. VO Cartesia (akun AUDIRA).
