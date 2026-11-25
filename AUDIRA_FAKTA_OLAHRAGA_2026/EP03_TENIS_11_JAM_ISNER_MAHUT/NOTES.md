# NOTES — Tenis 11 Jam: Isner vs Mahut, Wimbledon 2010 (`EP03`)

> Seri Fakta Olahraga · @AudiraSportFacts · Style BROADCASTFORGE · Remotion + R3F · 1080×1920 @ 60 · 5.084 frame (±84,7 dtk).
> Tahap 10–11. Pelajaran juga disimpan di motion memory (BROADCASTFORGE + GLOBAL).

## Yang berhasil (worked)
- Kartu HUD per fakta (GELAP, 59-59, scoreboard 70-68, 11 JAM 5 MENIT, 183 GAME) terbaca jelas bahkan di contact sheet kecil.
- Gerak kamera: `draft/camera.json` skor 5.
- Remix audio tanpa render ulang video (`-c:v copy`) cukup untuk memperbaiki mix; hemat waktu GPU.

## Yang gagal (failed) + perbaikan (fix)
- Juri draf 3,83 dua kali (material & komposisi 3). Pengguna memerintahkan "langsung render" 2026-11-22, final dibuat dengan `--skip-memory-gate`.
- 2026-11-23 keluhan pengguna: "suara noise sangat kencang". Diagnosis: stem `sfx.wav` berisi bed ambience konstan −20 LUFS (short-term ±−20 sepanjang film), hanya 3,4 LU di bawah VO (−16,6). VO Cartesia bersih (noise floor −inf), jadi tidak perlu `afftdn`. Penyebab: `studio/scripts/render-final.mjs` masih graph lama (ratio 2.5, attack 15, threshold 0.1, VO tanpa loudnorm, SFX tanpa trim).
- Fix: audio di-remix dengan graph G18 (VO `loudnorm=I=-16`, SFX `volume=-10dB`, `sidechaincompress=threshold=0.015:ratio=8:attack=5:release=350`), lalu `deliver.mjs` −14. Hasil: SFX ter-duck −35,3 LUFS, selisih VO–SFX 18,7 LU (G18c ≥ 12 ✓). Graph `render-final.mjs` studio juga diperbarui ke G18.

## Teknis
- Offset VO: 0 (lead 0,1 dtk sudah di `vo.wav`/timeline).
- Parameter render: `--jobs=6 --concurrency=2 --gl=vulkan --encoder=nvenc`, render 2026-11-22.
- Master: −13,6 LUFS, true peak −2,0 dBFS. AAC 48 kHz stereo.
- Metadata ditulis ulang 2026-11-23, `npm run sign` → VALID (key 498c3302271aadce).
- File: `FINAL_VIDEO.mp4` (+ `.sig.json`), `out/final-contact-sheet.jpg`, `SUBTITLES.srt` (48 cue dari `studio/src/scenes/ep03/timeline.json`).
- Skor final (self): rata-rata 3,83 (lighting 4, material 3, depth 4, composition 3, motion 5, readability 4). Belum ada skor juri final.

## Pasca-tayang (24j / 72j / 7h)
Jadwal upload: Rabu 25 Nov 2026, 19.00–20.40 WIB (dikonfirmasi pengguna 2026-11-23).
Scheduled task review (sekali jalan, mode Auto, jalan saat aplikasi Claude terbuka):
- `review-tenis-11-jam-isner-mahut-24h` — Kamis 26 Nov 2026 19.00 WIB
- `review-tenis-11-jam-isner-mahut-72h` — Sabtu 28 Nov 2026 19.00 WIB
- `review-tenis-11-jam-isner-mahut-7d` — Rabu 2 Des 2026 19.00 WIB

| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |
