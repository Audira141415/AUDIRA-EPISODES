# ASSET_MANIFEST — EP05 Sisi Bulan yang Sama

Style: SCALEFORGE

## GLB (Polyfork lokal, `E:/ASET/ASSET-AUDIRA/downloads/glb/`, dicek `audira_search_assets` 2026-11-24)

| id | assetType | Adegan | Peran |
|---|---|---|---|
| comm-satellite-fdc2cd | prop | S3 | FG melintas di diagram orbit |
| large-asteroid-391721 | prop | S4, S7 | FG/BG melintas |
| crater-terrain-blob-bd6af6 | prop | S5, S6 | permukaan kawah sisi jauh |
| regolith-boulder-1f1f14 | prop | S5, S6 | bongkah FG |
| exploration-rover-7afd91 | vehicle | S5 | rover pendarat sisi jauh (umum, tanpa logo) |
| astronaut-explorer-323482 | character | S6 | astronaut di samping cermin |
| phase-mirror-1a43e9 | prop | S6 | cermin pemantul laser (retroreflector) |
| laser-pointer-ray-a70928 | prop | S6 | sinar laser dari Bumi |

## Prosedural (kit scaleforge, `project/src/kits/scaleforge/`)
- `makeEarthTextures`, `makeSunTexture`, `makeGlow`: Bumi, Matahari, atmosfer.
- Tekstur Bulan: canvas prosedural episode (maria + kawah), dibuat di `src/episodes/moon/`.
- `SafeLabel` untuk semua kartu angka (≥ 36 px).

## Brand
- `src/brand/AudiraSignature.tsx` (seed `sains-EP05-sisi-bulan`, handle `@AudiraSains`).
- Outro: brand kit `F:/AUDIRA-EPISODES/CHANNEL_BRAND/channel-brand-audira-sains/src/horizontal-reversed.svg` + "Created by Agus Dwi R.".

## Audio
- VO Cartesia → `project/public/audio/vo.wav` (+ word timestamps).
- SFX prosedural `npm run sfx` → `project/public/audio/sfx.wav`.
- Tanpa musik berlisensi pihak ketiga.
