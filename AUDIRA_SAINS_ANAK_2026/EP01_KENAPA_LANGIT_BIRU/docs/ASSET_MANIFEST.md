# ASSET MANIFEST — Kenapa Langit Biru (`EP01`)

Style: WORLDFORGE

## GLB (katalog lokal `E:/ASET/ASSET-AUDIRA/downloads/glb/`)
| ID | Tipe | Dipakai di |
|---|---|---|
| `exploration-rover-7afd91` | vehicle | Mars senja/siang (scene 1, 13, 14) |
| `regolith-boulder-1f1f14` | prop | batu Mars FG |
| `large-coastal-boulder-a2cab1` | prop | batu bukit Bumi |
| `tall-pine-tree-ab4108` | prop | pohon Bumi |
| `gabled-farmhouse-c7534f` | building | rumah di bukit Bumi |
| `child-with-a-painted-b8a19f` | character | anak mendongak (scene 2, 9, 15) |
| `wooden-crate-e46521` | prop | alas prisma Newton |
| `table-candle-lantern-a7b5af` | prop | lentera kamar Newton |

## Komponen kode
- `src/core/concepts`: `SunDisc`, `LightBeam`, `WaveRibbon`, `AirMolecule`, `ScatterBurst`.
- `src/kits/worldforge/Sky.tsx`: `SkyDome` (4 set warna langit).
- Episode: `src/episodes/ep01/Film.tsx` (medan prosedural, prisma, mata, diagram atmosfer).
- Brand: `src/brand/AudiraSignature.tsx`, `src/brand/AudiraOutro.tsx`, `src/brand/channel.json` (AUDIRA Sains).

## Audio
- VO: `project/public/audio/vo.wav` (Cartesia, 87,31 dtk, 210 kata, dibuat ulang s4), `vo-words.json`, `vo.timing.json`.
- SFX: `project/public/audio/sfx.wav` (`npm run sfx`, prosedural, lisensi milik sendiri).
- Musik: tidak ada.

## Lisensi
Semua GLB dari katalog aset AUDIRA lokal. Tidak ada foto/rekaman pihak ketiga; foto Curiosity hanya disebut, tidak ditampilkan (visual = rekonstruksi 3D).
