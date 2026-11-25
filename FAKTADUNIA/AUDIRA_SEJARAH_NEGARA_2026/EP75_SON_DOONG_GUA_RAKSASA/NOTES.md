# NOTES — EP75 Son Doong, Gua yang Muat Satu Blok New York (WORLDFORGE, Remotion + R3F)

## Tahap 0–4 (s1, 2026-11-24)
- Judul bank topik "lebih besar dari Kota New York" keliru; sumber hanya menyebut ruang muat SATU BLOK New York. Judul diganti.
- Riset 13 fakta (Wikipedia, National Geographic, Oxalis). Naskah 198 kata. Ejaan TTS di `research/vo_tts.txt` ("Ho Kan", "Hang Son Dong", "Audira").

## Tahap 6–8 (s2–s5)
- VO Cartesia 83,41 dtk (dikunci), film 86,4 dtk. 11 adegan, 18 shot, 28 kartu HUD.
- SFX stem −26 LUFS (`PYTHONUTF8=1 npm run sfx` di Windows).
- Juri buta r1: **3.33 PERLU POLES** (L3 M2 D3 C3 Mo5 R4). Self 4.17. Kelemahan: dinding gua dan aliran kalsit terlihat plastik datar.
- Poles r2 (s5): tekstur prosedural batu kapur `limeGrain` (strata horizontal mengikuti lorong + noda tetes vertikal + speckle, bump 3) untuk tabung gua; `flowGrain` (kanal tetes vertikal, clearcoat) untuk stalagmit dan dinding kalsit 60 m; mutiara gua roughness 0,45 + bump; kamera S4 shot 1 dan S8 shot 1 dibawa lebih dekat ke pemanjat.
- Rim light semua adegan dinaikkan (rim 0,55–0,8 × 2,2). Ceiling depth tetap 3 (separasi subjek 22,3 vs cover 36,6).
- Klip kamera r2 gagal (timeout Remotion 33 dtk, GPU dipakai sesi paralel); camera.json r1 (skor 5) dipakai.
- Juri buta r2: **3.67** (L4 M3 D3 C3 Mo5 R4), self 3.83. **Diterima 3.67 setelah 2 putaran** (aturan ≥ 3.5). Kelemahan juri: dinding kalsit 60 m F6 terbaca papan kayu, pemanjat hanya titik. Lesson failed dicatat.

## Tahap 10 (s5)
- `SOCIAL_CAPTIONS.md` 6 platform + Jadwal Upload (WIB) Kamis 21 Januari 2027 19.00 + Label Konten AI, validator ok. Chapter dari vo-words.json.

## Tahap 9 — Final (s6–s7, 2026-11-25)
- Gerbang final pre-approved pengguna 2026-11-25 (batch 10 short otonom).
- Render `SonDoongFinal` 1080×1920 @ 60: 5184 frame dalam 253 dtk (≈20 fps, `--jobs=4 --concurrency=1 --gl=vulkan --encoder=nvenc`), lewat `_render.lock`. Shell s6 mati saat render; proses selesai sendiri, s7 menunggu pid lalu melanjutkan.
- Master: −13,7 LUFS, true peak −1,9 dBFS (diukur ulang ebur128 pada file tagged). Graph G18 (VO loudnorm −16, SFX −26 LUFS stem, duck ratio 8).
- `FINAL_EP75_SON_DOONG_tagged.mp4`: ffprobe artist "AUDIRA (Agus Dwi R.)", comment "AUDIRA-son-doong-EP75 | audira.my.id", tanda tangan Ed25519 VALID + C2PA.
- `audira_qa_video` hardOnly: PASS (20 potongan, 0 KEDIP/LONCAT/BLACK/WHITE). Laporan `draft/qa-final/qa-video.json`.
- Skor final (self = juri r2): 3.67 (L4 M3 D3 C3 Mo5 R4). audit:visual final tetap mengunci depth 3.

## Pelajaran
- Gagal: kedalaman interior gua (subjek skala manusia terlalu kecil, dinding kalsit terbaca kayu). Lain kali: subjek manusia lebih besar di FG + kabut volumetrik berlapis FG/MG/BG.
- Berhasil: tekstur prosedural `limeGrain` / `flowGrain` menaikkan material 2→3 dan lighting 3→4 dalam satu putaran.
- Kandidat promosi kit (dicatat saja, tidak ditawarkan): `limeGrain` / `flowGrain` sebagai material batu kapur bawaan WORLDFORGE.

## Review terjadwal (tahap 11)
- `review-son-doong-24h` — 2027-01-22 19.00 WIB
- `review-son-doong-72h` — 2027-01-24 19.00 WIB
- `review-son-doong-7d` — 2027-01-28 19.00 WIB
- Task hanya jalan saat aplikasi Claude terbuka (bila tertutup, jalan saat dibuka lagi).

## Pasca-tayang
| Cek | Views | Retensi rata-rata | Hook 0–3 dtk | Catatan |
|---|---|---|---|---|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |

## Tahap 9 — Final (s6, 2026-11-25)
- Gerbang final pre-approved pengguna 2026-11-25 (batch 10 short otonom). Antre `_render.lock` di belakang EP07 (00:03–00:20Z).
- `npm run render:final -- --comp=SonDoongFinal --out=../FINAL_EP75_SON_DOONG.mp4 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --title="Gua yang Muat Satu Blok New York" --slug=son-doong --ep=EP75 --jobs=4 --concurrency=1 --gl=vulkan --encoder=nvenc --skip-memory-gate="juri buta r2 3.67 diterima setelah 2 putaran"`.
  Percobaan pertama ditolak gate memori (juri belum LOLOS); `--skip-memory-gate` sesuai aturan ≥ 3.5 setelah 2 putaran.
- 5184 frame dalam 253 dtk (~20 fps). G18c: VO −16,2 LUFS, SFX ter-duck −29,7 LUFS, gap 13,5 LU.
- Master: −13,7 LUFS, true peak −1,9 dBFS, h264 1080×1920 @ 60, 86,408 dtk. Tanda tangan Ed25519 + C2PA di `FINAL_EP75_SON_DOONG.mp4` (`.sig.json`).
- `FINAL_EP75_SON_DOONG_tagged.mp4`: metadata title/artist/copyright/comment/date dicek ffprobe.
- Log render menampilkan 404 untuk `models/polyfork/terrain/rock-cave-ledge-2a9532.glb` dan `ruined-lair-wall-176561.glb`: hanya probe subfolder `assetType`; AssetModel memuat `public/models/polyfork/<id>.glb`. Frame final dicek (t 2/20/45/70/84), adegan utuh.
- audit look final: depth tetap dibatasi 3 (sama dengan draf). record_score final self 3.67.

## Tahap 10 — penutup (s6)
- Lesson: WORLDFORGE worked (limeGrain/flowGrain + setelan render), GLOBAL fix (`--skip-memory-gate` untuk draf diterima 2 putaran; 404 probe AssetModel).
- Kandidat promosi kit (GLOBAL, dicatat saja): jobs (5 ep), concurrency (2 ep), TARGET_LUFS (2 ep), assetClone (2 ep).
- Scheduled task review (fire 19.00 WIB): `review-son-doong-24h` 2027-01-22, `review-son-doong-72h` 2027-01-24, `review-son-doong-7d` 2027-01-28. Mengikuti jadwal upload seri Kamis 21 Januari 2027 di SOCIAL_CAPTIONS.md. Task hanya jalan saat aplikasi Claude terbuka.
- Topik 028 ditandai `[x] SEJARAH_NEGARA/EP75` di bank topik.

## Pasca-tayang

| Cek | Tanggal | TikTok | IG Reels | YT Shorts | FB Reels | X | Threads | Catatan |
|---|---|---|---|---|---|---|---|---|
| 24j | 2027-01-22 | | | | | | | |
| 72j | 2027-01-24 | | | | | | | |
| 7h | 2027-01-28 | | | | | | | |
