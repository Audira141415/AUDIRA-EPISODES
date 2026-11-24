# NOTES — EP09 Kenapa Laut Dalam Lebih Misterius dari Luar Angkasa

Style: ABYSSFORGE · Remotion 4 + R3F · 1080×1920 @ 60 · film 86,6 dtk (VO 83,36 + outro 3,2)

## Yang berhasil (worked)
- 8 adegan berbeda mengikuti VO (Bulan → permukaan → turun per zona → tekanan → palung vs Everest → sonar → ikan pemancing → naik). Juri buta putaran 2: 4,0 LOLOS (lighting 4, material 4, depth 3, composition 4, motion 5, readability 4).
- Descent zona dengan meteran kedalaman (fungsi depthAt(t) dikunci ke VO) + nama zona per kartu: terbaca tanpa suara.
- Lanternmaw3D dari kit abyssforge sebagai ikan pemancing (umpan menyala keyed ke kit-time 8,6 dtk → offset t − 60,8).
- Gunung Everest prosedural (kerucut bergerigi + warna vertex batu/salju) lebih terbaca daripada GLB karst-limestone-peak (terlihat seperti pilar berpohon).
- Rim light cyan + magenta di belakang semua adegan menaikkan material/komposisi di mata juri (3 → 4).

## Yang gagal (failed) + perbaikan (fix)
- GLB hewan "-base" (dolphin, octopus, jellyfish, shark, angler-one) ber-rig SkinnedMesh: `scene.clone(true)` di AssetModel tidak mengikat ulang tulang, semua model menumpuk di titik asal dunia. Fix: `SkeletonUtils.clone` di `src/core/assets/AssetModel.tsx`. **Kandidat promosi kit (tidak ditawarkan, aturan batch otonom):** pasang fix ini di starter AUDIRA-SKILL-MOTION.
- `angler-one-base` ternyata karakter manusia-ikan, bukan ikan pemancing. Cek still sebelum memakai aset bernama hewan.
- Sprite glow Bumi (opacity 0) tetap tampak sebagai kotak hitam saat AO aktif: jangan render sprite bila glow 0.
- Halo `Glow` (sphere aditif) jadi cakram abu karena kabut: set `material.fog = false`.
- Hook hadal awalnya kosong: dinding batu di x ±2,9 di luar frame (FOV 44 di 9:16 hanya ±1,8 unit pada jarak 8).
- Depth tetap tertahan ceiling 3 (subject separation 28 vs cover 54): latar navy datar. Lain kali: lapisan haze/occluder FG per adegan.
- Juri putaran 1: 3,67 (astronaut T-pose terpotong rover, caption menimpa Bumi, hiu terpotong).
- VO speed 1.0 = 92,4 dtk untuk 212 kata; speed 1.06 = 83,4 dtk.
- start_session sesi lanjutan ditolak app (giliran dipicu event otomatis) → episode diselesaikan di sesi s1.

## Teknis
- Offset VO: 0. VO Cartesia speed 1.06, 212 kata.
- SFX: `PYTHONUTF8=1 npm run sfx -- --duration=86.6` → −29,0 LUFS, TP −9,7 dBFS.
- Render: `npm run render:final -- --comp=AbyssFinal --out=../FINAL_EP09_LAUT_DALAM.mp4 --vo=public/audio/vo.wav --offset=0 --sfx=public/audio/sfx.wav --jobs=4 --concurrency=1 --gl=vulkan --encoder=nvenc` (TEMP di F:, kunci `_render.lock`).

## Pasca-tayang (24j / 72j / 7h)
| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |

## Jadwal review (tahap 11)
Scheduled task sekali jalan (upload Kamis 26 Nov 2026 19.00 WIB): `review-laut-dalam-misterius-24h` (27 Nov 19.00), `review-laut-dalam-misterius-72h` (29 Nov 19.00), `review-laut-dalam-misterius-7d` (3 Des 19.00). Mode izin sesi tidak tersimpan di task (dibuat dari giliran otomatis): run bisa berhenti meminta izin.
