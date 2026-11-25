# NOTES — Rumble in the Jungle 1974 (`EP05`)

> Tahap 10–11. Pelajaran agar episode berikut mulai dari kualitas lebih tinggi. Juga disimpan di motion memory CHRONICLE (+ GLOBAL).

## Yang berhasil (worked)
- Siluet tinta tanpa wajah dengan kontur warna per tokoh (Ali amber, Foreman crimson, wasit ivory, partner biru-abu) membuat tokoh nyata terbaca tanpa menampilkan wajah.
- 7 set berbeda (ring hook, peta Kinshasa, panggung tirai, kamp latihan malam, stadion subuh, tali ring rope-a-dope, KO + fajar) memberi multi-scene penuh; set ring tidak muncul lebih dari 2 frame di contact sheet.
- Hook dibuka di frame cover (Ep05CoverA) tetapi Foreman tetap berdiri (guard) sampai kata "subuh", baru KO. Chip "40 LAGA · 40 MENANG" sinkron dengan VO.
- Juri buta draf r9 LOLOS 4/4/4/4/4 + motion 5 (rata-rata 4,17). Klip KO audit:camera 5/5 (deadPct 0, medianSpeed 0,122).

## Yang gagal (failed) + perbaikan (fix)
- Draf butuh 9 ronde juri. Penyebab utama: caption karaoke menutupi kaki subjek, label < 34 px, set ring berulang, material kanvas datar.
- Fix komposisi: framing kaki subjek di layout y ≤ 1290 agar caption (y 1300) tidak menutup subjek. Contoh: faceShot d≈7, fov 42, target y 0,89 (kaki y≈1264); kamp target y 1,18; KO kamera z 1,4 fov 58.
- G22 (juri r8, readability 2): hook menampilkan KO saat VO masih menyebut rekor 40–0. Fix: subjek hook harus sama dengan kata VO; KO baru muncul pada kata "subuh".
- KO look: kontur dinaikkan (outline gain 2,2, halo 0,45, fog 0,016) agar siluet tidak tenggelam.
- Sisa catatan juri (tidak dibuka ulang): f6 siluet gelap di atas kanvas gelap; subline f3 tepat di batas minimum 34 px.
- G19: `audira_qa_scene` macet (timeout di 381/2561 frame) karena studio seri tidak punya `scripts/qa-scene.mjs` dan ep05 tidak menandai `<Solid>`. Pengganti: `audira_qa_video` hardOnly pada MP4 final dengan daftar cut.

## Teknis
- Offset VO: 0 (VO di-mix di render final, `public/audio/ep05/vo.wav`), film 85,37 dtk, 5123 frame @ 60.
- Cut (dtk): 8.94, 13.80, 27.22, 31.72, 43.10, 56.58, 66.76, 71.16.
- Render final: `npm run render:final -- --comp=Ep05Final --out=../EP05_RUMBLE_IN_THE_JUNGLE_1974/FINAL_EP05_RUMBLE_IN_THE_JUNGLE.mp4 --vo=public/audio/ep05/vo.wav --sfx=public/audio/ep05/sfx.wav --jobs=6 --concurrency=2 --gl=vulkan --encoder=nvenc --log=error --title="Rumble in the Jungle 1974" --slug=rumble-in-the-jungle-1974 --ep=EP05` + `GPU_LOCK.md`.
- Mix G18: VO `loudnorm=I=-16`, stem SFX `volume=-10dB`, duck `ratio=8 attack=5 release=350 threshold=0.015`.
- Subtitle: `SUBTITLES.srt` (45 cue) dibuat dari `studio/src/scenes/ep05/timeline.json`.

## QA final
- `FINAL_EP05_RUMBLE_IN_THE_JUNGLE.mp4`: 1080×1920 @ 60, 5123 frame, 85,40 dtk, render 116 dtk (44 fps).
- Loudness: −13,6 LUFS, true peak −2,1 dBFS. VO −16,3 LUFS vs stem SFX setelah trim −30,0 LUFS = 13,7 LU (≥ 12, G18c).
- Metadata ffprobe: title, artist "AUDIRA (Agus Dwi R.)", copyright © 2026, comment `AUDIRA-rumble-in-the-jungle-1974-EP05 | audira.my.id`, date 2026-11-23. Signature Ed25519 VALID + C2PA.
- qa-video hardOnly: PASS. 7 LONCAT di-allow karena efek sengaja: Flash 0,02 & "subuh" 6,27, RedPulse "robek" 30,43, jolt "bomaye" 40,50, Flash "roboh" 62,67, kilat 69,40 & 77,78. Fade InkCut di cut terencana tidak terdeteksi sebagai lompatan.
- Frame dari MP4 (`out/final-contact.jpg`): outro card AUDIRA + Created by Agus Dwi R., tanda tangan AUDIRA kecil di pojok kanan atas, brand di dunia ("AUDIRA · KINSHASA 1974" pada papan ring outro), caption bersih dari subjek.

## Review terjadwal
Upload dikonfirmasi pengguna: Jumat 27 Nov 2026, TikTok 19.00 WIB (platform lain tiap 20 menit sampai Threads 20.40).
- `review-rumble-in-the-jungle-1974-24h`: Sabtu 28 Nov 2026 19.00 WIB
- `review-rumble-in-the-jungle-1974-72h`: Senin 30 Nov 2026 19.00 WIB
- `review-rumble-in-the-jungle-1974-7d`: Jumat 4 Des 2026 19.00 WIB

Task sekali jalan (mode Auto) dan hanya berjalan saat aplikasi Claude terbuka. Bila aplikasi tertutup, task jalan saat aplikasi dibuka lagi.

## Pasca-tayang (24j / 72j / 7h)
| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |
