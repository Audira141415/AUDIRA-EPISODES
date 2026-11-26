# NOTES — Kisah Bilal bin Rabah (`EP18`, AUDIRA QISSAH)

> Tahap 10–11. Style PAPERWORLD, Remotion 2D SVG kertas. VO Cartesia 87,68 dtk, film 91 dtk (outro 3 dtk). Final 1080×1920@60.

## Yang berhasil (worked)
- Motion juri 5/5: kamera kontinu (audit:camera klip 44–64 dtk 5/5, parked 0%, median speed 0.097) dan audit:rig 5/5.
- Adab visual tanpa kompromi tetap terbaca: sahabat sebagai siluet kertas bersorban tanpa wajah, Nabi tidak digambarkan, kutipan sumber ditaruh di papan kertas ("IBNU ISHAQ", "UMAR BIN KHATTAB", "BUKHARI 1149 · SAHIH").
- Kata kunci besar per babak (AHAD, DITUKAR, AZAN, 5× SEHARI) jadi callout kinetik yang cocok dengan VO; THEME_CHECK 15/15.
- G18c: VO −16,3 LUFS vs SFX ter-duck −31,4 LUFS = gap 15,1 LU, jadi sfx.wav (stem −28 LUFS) tidak perlu diturunkan.

## Yang gagal (failed) + perbaikan (fix)
- Juri buta putaran 1 hanya 3,5. Putaran 2 naik ke 3,83 (lighting 4, material 4, depth 4, composition 3, motion 5, readability 3).
- Composition dan readability tetap 3: papan kutipan panjang (Abu Bakar/Umar) padat, dan kerumunan siluet di adegan Ka'bah kecil-kecil. Untuk episode PAPERWORLD berikutnya, batasi papan kutipan ≤ 8 kata dan beri satu subjek dominan per frame.

## Teknis
- Offset VO: 0 (firstSpeech 0,062 dtk).
- Render: `npm run render:final -- --comp=Ep18Final --out=../FINAL_EP18_BILAL_BIN_RABAH.mp4 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=6 --concurrency=2 --gl=vulkan --encoder=nvenc --title="Kisah Bilal bin Rabah" --slug=bilal-bin-rabah --ep=EP18`.
- 5460 frame, 61 segmen; ±10,8 fps rata-rata karena GPU dipakai bersama sesi lain.
- SUBTITLES.srt dibuat dari `project/public/audio/vo-words.json`; ejaan TTS diubah kembali ke AUDIRA dan angka tahun (580, 630, 640).
- SFX: `project/sfx/cues/ep18.py`, payoff impact 70,64 dtk.

## Jadwal review pasca-tayang
- Tayang: Sabtu, 12 Desember 2026, 19.00 WIB (TikTok pertama).
- Scheduled task: (diisi setelah dibuat)

## Pasca-tayang (24j / 72j / 7h)
| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |
