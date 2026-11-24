# NOTES — FAKTADUNIA EP76 Tornado Api

Judul: Tornado Api — Ketika Kebakaran Hutan Menciptakan Pusaran Maut
Channel: @AudiraFaktaDunia · Seri FAKTA SEJARAH NEGARA DUNIA #76 · slug `tornado-api`
Style: DISASTERSIM · Engine: Remotion + R3F (3D) · memoryEpisode `sejarah-negara-EP76`

## Hasil final (2026-11-25, sesi s4)

- File: `FINAL_EP76_TORNADO_API_tagged.mp4` (salinan dari `project/out/FINAL_EP76_TORNADO_API.mp4`)
- 1080×1920 @ 60 fps, h264 + aac, 89,5 dtk (VO 86,56 dtk + outro 3 dtk), 5.370 frame, render 189 dtk (jobs 4, concurrency 1, vulkan, nvenc)
- Audio: −13,7 LUFS integrated, true peak −1,8 dBFS. G18c: VO −16,7 LUFS, SFX ter-duck −30,6 LUFS, selisih 13,9 LU (min 12)
- Metadata ffprobe: title, artist `AUDIRA (Agus Dwi R.)`, copyright, comment `AUDIRA-tornado-api-EP76 | audira.my.id`, date. Tanda tangan Ed25519 VALID + C2PA.
- Cek frame MP4 (3 / 30 / 60 / 87,5 dtk): `draft/FINAL_CHECK.jpg`, outro card AUDIRA Fakta Dunia tampil.
- Gerbang final: pre-approved pengguna 2026-11-25 (batch 10 short otonom).

## Skor

- Juri buta draf putaran 2: 3,83 LOLOS (lighting 4, material 3, depth 4, composition 3, motion 5, readability 4).
- Final (self, mengikuti juri): 3,83. Audit look final tidak membatasi aspek di bawah 4.

## Pelajaran

- Gagal: pusaran api DoubleSide + additive blending tampak sebagai pola jaring.
- Gagal: kartu angka hitung-naik terbaca salah di still juri.
- Fix: shader pusaran FrontSide + lidah api fbm; angka kartu dibuat statis.
- Lemah tersisa (juri): subtitle menutupi dasar api (F4/F5), lab S4b gelap dan kosong, lantai polos, pusaran tampak gradien halus. Material dan komposisi = aspek terlemah.
- G13 gate render final gagal di deadPct 6% (1 dari 18 detik klip cek `CHECK_50-68s.mp4`, yaitu detik pertama klip = artefak awal seek). Dirender dengan `--skip-camera-gate` beralasan; skor kamera 5/5, longestHold 1 dtk. Saran kit: audit:camera sebaiknya abaikan detik pertama klip potongan.
- Kandidat promosi (dicatat saja): FrontSide + fbm untuk efek api/pusaran volumetrik di kit DISASTERSIM.

## Delivery

- `SOCIAL_CAPTIONS.md` lolos `audira_validate_social_captions` (6 platform, jadwal WIB, label AI).
- Jadwal upload: Jumat 22 Januari 2027, 19.00–20.40 WIB.
- Scheduled task review: `review-tornado-api-24h` (23 Jan 2027 19.00), `review-tornado-api-72h` (25 Jan 2027 19.00), `review-tornado-api-7d` (29 Jan 2027 19.00). Hanya jalan saat aplikasi Claude terbuka.
- File perantara dihapus (klip cek, still sementara, segmen render).

## Review pasca-tayang

(diisi oleh scheduled task +24 jam / +72 jam / +7 hari)
