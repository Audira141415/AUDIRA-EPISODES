# NOTES — Cara Kerja QRIS (EP01)

Style: BONGKAR · Engine: Remotion 2D (SVG, studio abu terang, lapisan isometrik) · Channel: AUDIRA Explained (@AudiraExplained)

## Riwayat style
- ISOCRAFT: juri buta final 3,67 → poles → draf r4 3,5. Gagal.
- CIRCUITFORGE: juri 2,67 → 3,0 (semua aspek 3). Gagal.
- BONGKAR (pilihan pengguna 2026-11-23): draf r1 3,5 → r2 3,83 LOLOS (L4 M4 D4 C3 Mo5 R3).

## Yang berhasil (worked)
- Lapisan cahaya soft-light arah 135° + dinding/lantai gradien + bokeh foreground menaikkan lighting/material/depth juri 3 → 4.
- Wrapper kamera per scene ala EP12 (push-in, drift Y, roll, sway X): audit:camera klip 5/5, 0% parked, 0 hentakan.
- Kartu HUD per angka/tahun (17·08·2019, EMVCo, GPN, 71,91 JT) dan header kicker + judul tiap adegan.
- G22: juri final menilai 9/9 frame cocok dengan kata VO.

## Yang gagal (failed)
- Label kecil (layar HP, kartu "Perintah bayar", stiker aplikasi, tag rak "Jalin", "Gerbang Pembayaran Nasional") dan 40% bawah lantai kosong / pita blur gelap → komposisi dan readability 3.
- Adegan jaringan (server, peta + ikon orang): subjek kecil mengambang di ruang abu, server/peta terbaca plastik mainan → juri final M3 C3.

## Perbaikan (fix)
- `project/scripts/lib/layout-probe.js` kini membaca `fill` teks SVG + `svgBoxBehind`. Sebelumnya chip label putih-di-hitam terbaca kontras 1,2:1.
- `project/scripts/render-final.mjs`: `fs.renameSync(tagged, out)` kena EPERM di F: saat menimpa final → `copyFileSync` + `unlinkSync`. Langkah sign/audit sesudahnya dijalankan manual (`npm run sign`).
- Channel gate render:final menolak komposisi sisa starter `src/scenes/news/PenggantiGibranWapres.tsx` (handle "@audira") walau tidak dirender → prop `handle` dihapus agar ikut handle channel.
- (dari sesi ISOCRAFT) `scripts/sign-video.mjs` perlu `await` pada signFile/verifyFile; `lib/sign.mjs` pakai copy+unlink.

## QA final (2026-11-23)
- `FINAL_VIDEO.mp4`: 1080×1920 @ 60 fps, 4872 frame, 81,2 dtk, h264 + aac.
- Audio: −13,7 LUFS, true peak −1,9 dBFS (G18 ok). G18c: VO −16,7 LUFS, SFX ter-duck −34,9 LUFS, selisih 18,2 LU.
- Metadata ffprobe: title "Cara Kerja QRIS", artist "AUDIRA (Agus Dwi R.)", copyright "© 2026 AUDIRA - Agus Dwi R. All rights reserved.", comment "AUDIRA-ep01-cara-kerja-qris-EP01 | audira.my.id", date 2026-11-23.
- Signature: VALID (Ed25519 key 498c3302271aadce, 2026-11-23T09:25Z).
- `audira_qa_video` hardOnly: PASS (4872 frame, 0 temuan). Laporan: `draft/qa-final/qa-video.json`.
- Contact sheet final dari MP4: `draft/final/_sheet.jpg` (9 frame).
- Skor juri buta final: **3,67 PERLU POLES** (L4 M3 D4 C3 Mo4 R4), di bawah draf 3,83. Kelemahan: subjek kecil di ruang kosong (F5, F7), material server/peta plastik, label kecil, pita blur bawah. Tidak dipoles ulang (kode `qris2d/*` dikunci oleh brief sesi). **Pengguna memutuskan kirim apa adanya (2026-11-23).**

## Teknis
- VO 77,63 dtk, offset 0,3 dtk; film 81,2 dtk (outro 78,2–81,2). SFX `public/audio/sfx.wav` −26 LUFS.
- Render: `npm run render:final -- --comp=QrisFinal --out=../FINAL_VIDEO.mp4 --vo=public/audio/vo.wav --offset=0.3 --sfx=public/audio/sfx.wav --jobs=6 --concurrency=2 --gl=vulkan --encoder=nvenc --log=error --title="Cara Kerja QRIS" --slug=ep01-cara-kerja-qris --ep=EP01` (TEMP/TMP=F:\_tmp_ep01qris), 358,8 dtk render.
- Tanda tangan bergerak: `AudiraSignature` seed `ep01-cara-kerja-qris`, handle dari channel.

## Pasca-tayang (24j / 72j / 7h)
Scheduled task: `review-ep01-cara-kerja-qris-24h`, `review-ep01-cara-kerja-qris-72h`, `review-ep01-cara-kerja-qris-7d` (upload default Selasa 24 Nov 2026 19.00 WIB).

| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |
