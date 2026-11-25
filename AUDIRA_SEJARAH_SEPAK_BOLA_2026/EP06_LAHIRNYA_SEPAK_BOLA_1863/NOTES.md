# NOTES — EP06 Lahirnya Sepak Bola Modern 1863

Seri: Sejarah Sepak Bola (AUDIRA) · Channel: SPORTFACTS (@AudiraSportFacts) · Style: VINTAGEFORGE · Final 2026-11-14.

## Hasil
- Final `FINAL_VIDEO.mp4`: 1080×1920 @ 60, 83.3 dtk, 340 MB. qa:gate GREEN.
- Tanda tangan Ed25519 VALID (`FINAL_VIDEO.mp4.sig.json`), metadata kepemilikan (title/artist/copyright/comment) tertulis. C2PA tak di-embed di studio ini (sama seperti EP05 yang sudah tayang; studio pakai `scripts/sign-video.mjs`, bukan c2patool).
- FINAL_CHECK.jpg 8 frame: bersih, tak ada black-frame NaN+bloom. Sepia konsisten, karaoke caption sinkron, cover frame cocok dengan `style/cover.json`, handle @AudiraSportFacts + AudiraSignature terlihat.
- Render batch 20261113-234406, 1 film, --jobs=6 --concurrency=2 vulkan/nvenc, 131.4 dtk. TMP F:\render-tmp.

## Skor
- Juri buta (sesi sebelumnya): 3.83. Self final: 3.83 (lighting 4, material 4, depth 4, composition 3, readability 4, motion 4).
- Ceilings look.json: lighting/material/depth/composition = 4.

## Pelajaran
- **Motion fix (sesi sebelumnya):** motion draf 3 → 4 diperbaiki sebelum handover (lihat camera.json score 4).
- **Composition cap 3x (rule 6c):** composition tetap 3 setelah 3 putaran draf. Adegan debat padat kartu HUD menumpuk membuat subjek 3D kurang dominan. Diambil draf terbaik, finalisasi override pengguna di 3.83 — tidak poles/draf lagi (rule 6c). Untuk VINTAGEFORGE episode padat-teks: kurangi kartu serempak atau perbesar subjek hero.
- **Worked:** tavern sepia + candle practical + grade sepia → lighting/material/depth mentok ceiling 4. Buku Laws of the Game + bola kulit tua sebagai hero prop = anchor adegan jelas.
- **Kandidat promosi motion-memory:** parameter `grade` sudah membaik di 2 episode VINTAGEFORGE → tawarkan ke pengguna untuk dimasukkan permanen ke kit.

## VO / Audio
- VO Cartesia (id), 82.3 dtk, offset 0, tanpa musik/SFX. Audio Master Clock; beat timeline cocok (hook 0.1 / konteks 5.9 / pengembangan 17.2 / penjelasan 48.0 / payoff 59.8 / outro 73.7).

## Upload
- Caption 6 platform lolos `audira_validate_social_captions`. Jadwal Rabu 18 Nov 2026 slot malam 19.00–20.15 WIB (EP05 17 Nov, EP06 18 Nov). Label AI tiap platform. Teks cover: SEPAK BOLA LAHIR 1863.
- Berikutnya EP07: Piala Dunia Pertama, Uruguay 1930.
