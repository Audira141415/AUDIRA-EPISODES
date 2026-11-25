# NOTES — Wilt Chamberlain 100 Poin, 2 Maret 1962 (`EP10`)

> Tahap 10–11. Style VINTAGEFORGE · Remotion + R3F · 9:16 · film 80,40 dtk (VO selesai 76,40 dtk).

## Skor
- Juri buta putaran 1: 3,67 PERLU POLES (composition 3, readability 3).
- Juri buta putaran 2: **3,83 LOLOS** — lighting 4, material 3, depth 3 (ceiling audit), composition 4, motion 5, readability 4.

## Yang berhasil (worked)
- Papan skor kayu manual + flip angka 23 → 41 → 69 → 100 membawa cerita tanpa footage.
- Kartu "0 REKAMAN VIDEO" di hook = hook kuat untuk topik tanpa arsip video.
- Pita radial gelap di belakang karaoke menaikkan keterbacaan caption di lantai/kertas terang (readability 3 → 4).

## Yang gagal (failed) + perbaikan (fix)
- Teks papan 3D meluber/terpotong (HERSHEY ARENA, ARENA · MALAM INI, RADIO) → fix: `serifBoard` auto-fit (`measureText`, maks 86% lebar papan); hoarding HERSHEY dipersempit ke 1,6; kartu RADIO dipindah ke atas meja.
- Garis gelap di papan B1 = bayangan `PoolLight` (spotlight castShadow) → fix: `pool={false}` di adegan luar ruang yang sudah memakai `SunLights`.
- Adegan arsip E3 overexposed, foto "100" pucat → fix: `pool={false}` + exposure 0,7.
- Juri: figur `ToyPerson` + props terbaca plastik glossy, bukan kertas/kuningan VINTAGEFORGE (material 3); latar coklat datar tanpa haze (separation 42 vs cover 74). Episode VINTAGEFORGE berikut: material kertas/kuningan untuk figur, haze + rim light di latar.

## Teknis
- Offset VO: 0 (VO mulai 0,10 dtk; timing dari `studio/src/scenes/ep10/timeline.json`).
- Contact sheet putaran 2: `studio/out/ep10-draft3` (0,15 · 9 · 17,5 · 24,2 · 41 · 55,9 · 63 · 74,5 dtk).
- Render final: `npm run render:final -- --comp=Ep10Final --vo=public/audio/ep10/vo.wav --sfx=public/audio/ep10/sfx.wav --jobs=2 --concurrency=2 --gl=vulkan --encoder=nvenc` (jobs 2 karena studio dipakai bersama EP06–EP09).
- Audio G18: VO loudnorm −16, stem SFX −20 LUFS @ −10 dB (efektif −30), G18c 14 LU.

## Pasca-tayang (24j / 72j / 7h)
| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |
