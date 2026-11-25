# NOTES — Phelps Menang 0,01 Detik (`EP07`)

> Seri Fakta Olahraga · style TOYDIORAMA · Remotion + R3F · 9:16. Tahap 10–11.

## Hasil
- Final: `FINAL_EP07.mp4` (1080×1920 @ 60, 91,5 dtk, h264 nvenc, yuv420p). Master render: `studio/out/ep07/FINAL_EP07.mp4`.
- Audio: −13,6 LUFS integrated, true peak −2,0 dBFS (graph G18, `--vo` + `--sfx`). Draf G18c: VO −16 vs SFX efektif −30 LUFS.
- Metadata kepemilikan + tanda tangan Ed25519: VALID (`npm run verify`). Judul metadata diganti ke "Phelps Menang 0,01 Detik" saat menyalin ke folder episode (`-c copy`), tanda tangan tetap VALID.
- Skor: draf juri buta 3,83 (L4 M4 D4 C3 Mo5 R3); final self 4,0 (L4 M4 D4 C3 Mo5 R4).
- QA: `draft/qa-video.json` PASS (3 CHECK diberi verdict di `draft/qa-video.review.json`). qa-scene tanpa probe: scene EP07 tidak memakai `<Solid>`.

## Yang berhasil (worked)
- Panel gelap opaque di belakang angka besar (1,5–2,5 KG dan 1/10.000) membuat angka terbaca di atas air terang.
- Filmstrip chip 176×140 dengan frame tengah kuning: ide "1/10.000 detik per frame" langsung terbaca.
- Render 5.492 frame dalam 171 dtk (6 job, concurrency 2, vulkan, nvenc).

## Yang gagal (failed) + perbaikan (fix)
- qa-video LONCAT 91,7 di 71,4 dtk: pose Phelps wave→cheer meloncat 1 frame. Fix: `mixPose` + `poseOverride`, blend 0,4 dtk.
- Tangan touchpad melompat keluar saat press = 0 (`+3`). Fix: `lerp(4.6, 0.42, press)`.
- Figur ofisial Serbia muncul mendadak (65,1 dtk). Fix: skala ber-ease 0,5 dtk.
- Kartu kertas SPITZ di rak medali masih tertutup Phelps/terpotong di close-up payoff (≈72 dtk). Diterima (komposisi 3). Episode berikut: label rak ≤0,5 lebar atau pindah ke HUD.
- `audira_qa_scene` EPERM: file `VERSION` chrome-headless-shell di studio hilang. Fix: tulis `157.0.8080.0`, jalankan qa-scene/qa-video lokal dari `studio/scripts`.

## Teknis
- Offset VO: 0 (VO terkunci `studio/public/audio/ep07/vo.wav`).
- Parameter render: `npm run render:final -- --comp=Ep07Final --out=out/ep07/FINAL_EP07.mp4 --vo=public/audio/ep07/vo.wav --sfx=public/audio/ep07/sfx.wav --jobs=6 --concurrency=2 --gl=vulkan --encoder=nvenc --log=error --slug=phelps-menang-0-koma-01-detik --ep=EP07`.
- Review terjadwal: `review-phelps-0-01-24h`, `review-phelps-0-01-72h`, `review-phelps-0-01-7d` (upload asumsi Minggu, 29 Nov 2026 19.00 WIB).

## Pasca-tayang (24j / 72j / 7h)
| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |
