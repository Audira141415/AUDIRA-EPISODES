# NOTES — EP77 Katakombe Paris

Style: PAPERWORLD (s7, ganti dari CHRONICLE) · Remotion + R3F 3D · VO Cartesia 89.21 dtk (dikunci, jangan generate ulang) · film 92.2 dtk, outro 89.2–92.2.

## FINAL (s8, 2026-11-25)

- **Final:** `FINAL_EP77_KATAKOMBE_PARIS_tagged.mp4` — 1080×1920 @ 60, 5532 frame, 92.2 dtk, −13.7 LUFS, TP −1.8 dBFS, metadata AUDIRA (title/artist/copyright/comment/date) dicek ffprobe, tanda tangan Ed25519 VALID + C2PA. Audit look final: tidak ada aspek di bawah 4.
- **Juri draf PAPERWORLD:** putaran 1 **3.83 LOLOS** (L3 M4 D4 C3 Mo5 R4). Self 4.33 (over-rate +1 lighting/composition/readability). Kelemahan juri: F3 runtuhan Rue d'Enfer tidak terbaca (setengah bawah grid batu bulat), F5 gerobak keruh coklat, F8 wash rata, tengkorak/tangga terbaca plastik halus.
- **Gerbang final:** pre-approved user 2026-11-25 (batch 10 short otonom).
- **Render:** `_render.lock` (menunggu EP74 ±15 menit). Percobaan 1 gagal G18c (gap VO–SFX 11.7 LU < 12) → `public/audio/sfx.wav` diturunkan −2 dB (cadangan asli `F:/render-tmp/ep77_sfx_pre_g18c.wav`), gap jadi 13.7 LU. Percobaan 2 gagal channel gate (sisa template `src/scenes/news/PenggantiGibranWapres.tsx` handle `@audira`, tidak diimpor) → `--skip-channel`. Percobaan 3 `--jobs=6` part 20 `net::ERR_SOCKET_NOT_CONNECTED` → lanjut `--jobs=3 --concurrency=1`, segmen jadi dilewati, 4016 frame sisa dalam 206 dtk.
- Perintah: `RENDER_TMPDIR=F:/render-tmp npm run render:final -- --comp=KatakombeFinal --out=../FINAL_EP77_KATAKOMBE_PARIS.mp4 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --offset=0 --jobs=3 --concurrency=1 --gl=vulkan --encoder=nvenc --skip-channel=... --title=... --slug=katakombe-paris --ep=EP77`, lalu file di-rename `_tagged` (metadata sudah ditulis render:final).
- **Cover topik:** `style/cover-topic.png` (KatakombeFinal 3.6 dtk) + `style/cover_1080x1350.png`.
- **Review terjadwal (tahap 11):** `review-katakombe-paris-24h` (Min 24 Jan 2027 19.00 WIB), `review-katakombe-paris-72h` (Sel 26 Jan 2027 19.00), `review-katakombe-paris-7d` (Sab 30 Jan 2027 19.00). Hanya jalan saat aplikasi Claude terbuka. Upload: Sabtu 23 Jan 2027 mulai 19.00 WIB.
- **Topik:** baris 022 `audira-faktadunia/topics.md` tanpa `(proses)` (AUDIRA-ALL-SKILL `b7b112b`).

## Pelajaran s7–s8 (PAPERWORLD)

- worked: reskin PaperSkin (semua permukaan jadi karton berlapis + tepi potong pucat) menyelamatkan scene yang gagal material di CHRONICLE tanpa membangun ulang geometri/kamera/VO; juri naik 3.33 → 3.83.
- worked: lampu CHRONICLE ×0.32 + fill dingin per adegan untuk kertas terang.
- failed: objek bulat (tengkorak, tangga) tanpa tepi potong terbaca plastik; adegan malam tanpa key light terarah jadi datar.
- fix: G18c — stem SFX −2 dB bila gap VO–SFX < 12 LU.

## Kandidat promosi kit (dicatat saja, s8)

- Hapus `src/scenes/news/PenggantiGibranWapres.tsx` dari template starter (memicu channel gate di setiap episode FAKTADUNIA).
- Render `--jobs=6` rawan `ERR_SOCKET_NOT_CONNECTED`; `--jobs=3 --concurrency=1` stabil.

## Arsip s6 (CHRONICLE)

## Status (s6, 2026-11-25) — BUNTU di gerbang juri draf

- Juri buta putaran 1: **3.33** (L3 M3 D3 C3 R3, motion 5). Putaran 2: **3.17** (L3 M2 D4 C3 R2, motion 5).
- Skor terbaik 3.33 < 3.5 → aturan pipeline: style CHRONICLE dinyatakan tidak cocok; **ganti style lalu ulang tahap 4 (G21)**. Render final TIDAK dijalankan.
- Alasan berhenti: ganti style = bangun ulang ART_DIRECTION/STORYBOARD/ASSET_MANIFEST + scene + cover + draf (tahap 4–8), di luar cakupan sesi s6; brief: buntu → catat + handover + berhenti.
- Yang tetap bisa dipakai: naskah, VO (`project/public/audio/vo.wav`, `vo-words.json`), SFX (`sfx.wav`, G18c 14 LU), `SOCIAL_CAPTIONS.md` (validator lolos, jadwal Sabtu 23 Jan 2027), `SUBTITLES.srt` (ejaan tampilan asli), `research/SOURCE_REGISTER.md`, `draft/THEME_CHECK.md` (perlu ditulis ulang untuk style baru).

## Kritik juri (ringkas)

- Batu kapur berstrata (pita oranye) terbaca **papan kayu**; fill lebih terang di s6 memperparah.
- Tulang instanced (kapsul + oval) terbaca **roti/plastik**, walau sudah diberi map + bump di s6.
- F4 "dinding jebol" = tumpukan blok wireframe merah, tidak terbaca sebagai tanah jebol (G22 cap readability 2).
- F3 runtuh: lubang kosong tanpa subjek jelas.
- Semua frame satu cuci warna oranye (satu lentera) → lighting 3.
- Kuat: kamera 5/5, kedalaman lorong (F1) dan tangga spiral (F8).

## Perubahan kode s6 (masih di working tree)

- `CutEarth`: fill pointLight 16 → 60 + dua fill samping 35.
- `City` prop `cut`: Ground digeser ke z < 0 agar tidak menutup muka potongan dari kamera (penyebab separuh bawah hitam S2).
- S3A: jalan di sekitar lubang `darkMat` → `cobble()`, dua pointLight di lubang (hangat + bulan).
- `boneMat`: tekstur bintik kanvas + bumpMap; `clothMat` #23222b roughness 0.55, sil gain gerobak 1.4.
- Kartu HUD: subjudul opacity 0.95; kartu kutipan gerbang tidak lagi mengulang teks Prancis (sub "tulisan di gerbang osuarium").

## Pelajaran s5 (dari handover)

- `Embers` size default kit 0.12; 0.6–1.1 = gumpalan putih. Pakai 0.06–0.12.
- Kartu HUD keluar = fade, bukan mengecil (mengecil terbaca glitch).
- `Tunnel` w3.6 h3.7 agar portal tidak tertutup lintel/plafon.
- Stub `src/data/map-nusantara.json` wajib untuk kit `relief.ts` agar tsc bersih.
- Ground R3F di depan potongan tanah (cross-section) menutup muka potongan bila kamera di y ≈ 0 (s6).

## Kandidat promosi kit (dicatat saja)

- CutEarth/cross-section: Ground harus dipotong di bidang potongan (prop `cut`).
- Kartu HUD fade-out default.

## Langkah berikutnya (sesi baru)

1. `audira_recommend_fallback_style` failedStyles ["CHRONICLE"]; pilih style dengan material batu/tulang terbukti (kandidat: MARBLEMUSEUM, CINESTORY, ABYSSFORGE, VISUALINVESTIGATION) — AI pilih sendiri, lapor satu baris.
2. Ulang tahap 4 (G21: docs baris `Style: <ID>`), cover topik baru, scene, draf, juri (maks 2 putaran).
3. Tahap 9–10 sesuai brief batch (pre-approved user 2026-11-25), render pakai `_render.lock`, `--vo=public/audio/vo.wav --sfx=public/audio/sfx.wav`.
4. Scheduled task review dan commit topik 022 BELUM dibuat (menunggu final).
