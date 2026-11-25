# ART DIRECTION — Kenapa Langit Biru (`EP01`)

Style: WORLDFORGE

- **Engine:** Remotion + React Three Fiber (full3d), komposisi `LangitBiruPreview` / `LangitBiruFinal`.
- **Channel:** AUDIRA Sains (@AudiraSains). Penonton: umum & pelajar SD–SMP.
- **Durasi:** 91 dtk (VO 87,31 dtk + outro card 3 dtk). 9:16, final 1080×1920 @ 60.

## Arah visual
- **Dunia nyata, bukan papan tulis.** Langit dibangun dengan `SkyDome` WORLDFORGE (gradasi zenith → horizon + halo matahari) dan medan berbukit nyata. Tiap langit punya warna sendiri: Bumi siang (biru), Bumi senja (jingga), Mars siang (butterscotch), Mars senja (halo biru dekat matahari).
- **Skala molekul** pakai `core/concepts`: `SunDisc`, `LightBeam`, `WaveRibbon` (penggaris λ), `AirMolecule` (N₂ biru, O₂ merah, wajah ramah), `ScatterBurst`. Latarnya tetap langit biru lembut supaya penonton ingat "ini terjadi di udara".
- **Ruang Newton:** kamar gelap kayu, satu lubang di jendela, prisma kaca fisik di atas peti kayu (`wooden-crate-e46521`), lentera (`table-candle-lantern-a7b5af`), kipas tujuh warna di dinding.
- **Mars:** medan berbatu oranye + `regolith-boulder-1f1f14` + rover `exploration-rover-7afd91`.
- **Bumi:** bukit hijau, `gabled-farmhouse-c7534f`, `tall-pine-tree-ab4108`, anak `child-with-a-painted-b8a19f` mendongak.

## Cahaya & grade
- Finish `DOCUMENTARY_WARM`, exposure 1, envIntensity 0,55, hdri `sky`, AO aktif (motion memory WORLDFORGE).
- Matahari = directional light; warnanya ikut langit (putih siang, jingga senja, pucat di Mars).

## Tipografi & HUD
- Callout di atas (top 262 px), panel gelap `rgba(20,14,12,0.82)` (pelajaran EP47: teks di langit terang wajib panel gelap), judul ≥ 96 px, sub ≥ 44 px.
- Angka kunci jadi kartu: 1666, ±1.200×, ≈6×, 450 vs 700 nm, 1869, 1871, ±38×, 15 April 2015.
- Subtitle karaoke y = 1300, kata aktif biru langit `#7cc4ff`.
- Brand: papan "AUDIRA SAINS" di dunia 3D (hook, Bumi senja), `AudiraSignature`, `AudiraOutro` 3 dtk.

## Palet
| Peran | Warna |
|---|---|
| Langit siang | `#3f7fd8` → `#cfe4f5` |
| Senja Bumi | `#f08a3c` / `#ffb25e` |
| Mars siang | `#c98b56` / `#e6b88a` |
| Mars senja halo | `#7fb6e6` |
| Panel HUD | `rgba(20,14,12,0.82)` |
| Aksen | `#7cc4ff`, `#ffc93c` |
