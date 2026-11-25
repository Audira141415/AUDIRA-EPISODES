# NOTES — EP08 Cara Kerja Petir: Awan ke Tanah dalam 1/100 Detik

Style: DISASTERSIM · Remotion 4 + R3F · 1080×1920 @ 60 · film 87,3 dtk (VO 84,10 + outro 3,2)

## Yang berhasil (worked)
- 8 adegan mengikuti VO (sambaran hook → kumulonimbus → penampang muatan → pemimpin bertingkat → arus balik → kanal 28.000 °C → anak menghitung detik → anak masuk rumah). Juri buta putaran 1: 3,83 LOLOS (lighting 4, material 3, depth 4, composition 4, motion 5, readability 3). G22 8/8 cocok.
- Kanal kilat jingga membara (adegan panas) dan jendela hangat vs badai biru menaikkan lighting.
- Anak (neighborhood-child) di latar depan + rumah + kilat jauh memberi 3 lapis kedalaman (depth 4).

## Yang gagal (failed) + perbaikan (fix)
- Badge muatan +/− sebagai `<sprite>` tampil sebagai kotak hitam di bawah AO. Fix: disc `circleGeometry` + bar `planeGeometry` yang menghadap kamera.
- GLB anak ber-rig tampil T-pose. Fix: prop `clip`/`clipTime` di `src/core/assets/AssetModel.tsx` (AnimationMixer.setTime dari jam frame; klip Idle/Walk). **Kandidat promosi kit (tidak ditawarkan, aturan batch otonom):** pasang di starter AUDIRA-SKILL-MOTION bersama fix SkeletonUtils.clone EP09.
- Halo kilat silinder 6 sisi ×12 lebar terlihat seperti balok ungu. Fix: 12 sisi, halo ×8.
- Rumah di adegan jarak terlalu dekat kamera → dinding terpotong. Dipindah ke belakang anak.
- `src/brand/channel.json` masih @AudiraExplained dari template: jalankan `npm run channel` sebelum still pertama.
- Juri: awan puff bola matte terbaca plastik (material 3); subline hook di atas kilat terang kurang kontras (sudah dimajukan ke 3,5 dtk dan 46 px).
- render:final ditolak gerbang channel oleh sisa template `src/scenes/news/PenggantiGibranWapres.tsx` (handle @audira) → `--skip-channel`. Part 4 sempat gagal `ERR_SOCKET_NOT_CONNECTED` memuat font (transien), lolos saat diulang.

## Teknis
- Offset VO: 0. VO Cartesia speed 1.04, 208 kata.
- SFX: `PYTHONUTF8=1 npm run sfx -- --duration=87.3` (SHOTLIST.md dibuat dari timeline.ts) → −26,0 LUFS, TP −5,8 dBFS. G18c: VO −16,7, SFX duck −30,3, selisih 13,6 LU.
- Render: `npm run render:final -- --comp=PetirFinal --out=../FINAL_EP08_PETIR.mp4 --vo=public/audio/vo.wav --offset=0 --sfx=public/audio/sfx.wav --jobs=4 --concurrency=1 --gl=vulkan --encoder=nvenc --skip-channel=...` (kunci `_render.lock`).

## Pasca-tayang (24j / 72j / 7h)
| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |

## Jadwal review (tahap 11)
Scheduled task sekali jalan (upload Kamis 26 Nov 2026 19.00 WIB): `review-cara-kerja-petir-24h` (27 Nov 19.00), `review-cara-kerja-petir-72h` (29 Nov 19.00), `review-cara-kerja-petir-7d` (3 Des 19.00).

## Final (s5, 2026-11-25)
- Render s4 berhenti di 45/60 segmen tanpa error di log (sesi diam). Resume s5 `--jobs=3 --concurrency=2` 15 segmen, 63 dtk.
- FINAL_EP08_PETIR_tagged.mp4: 87.3 dtk, -13.7 LUFS, TP -1.8 dBFS, metadata AUDIRA dicek ffprobe. Skor final juri 3.83.
