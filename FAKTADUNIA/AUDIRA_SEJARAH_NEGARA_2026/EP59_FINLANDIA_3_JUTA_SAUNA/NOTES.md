# NOTES — EP59 Finlandia 3 Juta Sauna

Style: WORLDFORGE (Remotion + R3F). FELTCRAFT gagal juri 2× sebelumnya (G21 → WORLDFORGE).

## Draf (2026-11-24)
- Juri buta WORLDFORGE r1: 3,67 (lighting 3, material 3, depth 3, composition 4, motion 5, readability 4).
- Juri buta WORLDFORGE r2: 3,67 (lighting 3, material 3, depth 4, composition 3, motion 5, readability 4). Self r2: 4,17.
- **Diterima 3,67 setelah 2 putaran** (aturan ≥ 3,5, keputusan pengguna 2026-11-23). Draf terbaik = r2 (kode sekarang).
- Lesson failed dicatat: eksterior salju masih datar (hemi/env terlalu terang), tambang terlalu terang, batu kiuas low-poly, meja F6 kotak polos, crop F1/F2/F5.

## Poles r2 (s6)
- Matahari rendah samping-belakang (`SUN` di SaunaFilm.tsx, target bayangan ikut kamera) + fill dingin depan + `Haze` lapis BG.
- Uap/asap: plane `Billboard` + tekstur radial di `FX_LAYER`. Sprite/plane di layer default jadi kotak hitam/bertepi karena pass GTAO.
- F3 apartemen: GLB `postwar-apartment-slab-cee5f9` (bata, berjendela); kantor `prewar-apartment-house-1081a6`.
- F4 tambang: dinding batu gelap, rel + 2 lori, kabin lebih kecil/jauh, lampu gantung bertudung.
- F6 sauna asap: dinding jelaga bergaris papan, celah cahaya + berkas, figur berhanduk, asap langit-langit.
- F7 Berlin: kolonade stadion + 6 tiang banner polos (tanpa cincin Olimpiade).

## Audio
- VO 78,95 dtk (terkunci), film 82 dtk. G18c: VO −16 LUFS vs SFX efektif −30 LUFS = 14 LU.

## Final (s7, 2026-11-24)
- Render final r1 (`out/FINAL_glitch_r1.mp4`) dan r2 (`FINAL_EP59_FINLANDIA_SAUNA.mp4`, --jobs=3 --parts=18 --concurrency=1): audio −13,7 LUFS, TP −1,9 dBFS; metadata + Ed25519/C2PA VALID. **Tapi qa_video FAIL** (r2: KEDIP 66,45; LONCAT 25,42 / 35,92 / 63,77 / 68,33 dtk): model hilang/hitam (material belum siap) sampai tab render baru mulai (63,77 = frame 3826 dan 68,33 = frame 4100 = awal part).
- Diagnosa: render dingin `npx remotion render ... --frames=3960-4010` BERSIH → kebocoran sumber daya GPU di tab yang jalan lama (±270 frame per part), bukan kode adegan.
- Rencana s8: render ulang dengan part pendek (`--parts=60 --jobs=3 --concurrency=1`, ±82 frame per tab) lalu qa_video hardOnly. Bila masih ada frame rusak: render dingin rentang ±30 frame di sekitar titik itu dan sambung (atau tambah parts).
- Render gagal sebelumnya: Chrome OOM karena C: penuh (1,9 GB). Pakai `TEMP=F:\temp\remotion-tmp`.
- `--skip-channel` dipakai: handle salah hanya di scene scaffold `PenggantiGibranWapres` (tidak dirender); SaunaFilm ambil handle dari channel.json (@AudiraFaktaDunia).
- SOCIAL_CAPTIONS.md (jadwal Selasa 5 Jan 2027 19.00–20.40 WIB) + SUBTITLES.srt (ejaan löyly/Pyhäsalmi diperbaiki) sudah jadi, validator lolos.

## Final (s8, 2026-11-24) — SELESAI
- **Final:** `FINAL_EP59_FINLANDIA_SAUNA.mp4` (r4), 1080×1920 @ 60, 4920 frame, 82,0 dtk, 173 MB. Render 290 dtk (`--jobs=3 --parts=60 --concurrency=1 --gl=vulkan --encoder=nvenc`, TEMP di F:).
- **qa_video hardOnly: PASS** (cuts shotlist; 15 cut terdeteksi, 0 tak terencana).
- **Audio:** −13,7 LUFS, TP −1,9 dBFS; G18c VO −16,4 vs SFX ter-duck −28,5 (gap 12,1 LU).
- **Metadata ffprobe:** title, artist `AUDIRA (Agus Dwi R.)`, copyright `© 2026 AUDIRA - Agus Dwi R. All rights reserved.`, comment `AUDIRA-finlandia-sauna-EP59 | audira.my.id`, date 2026-11-24. Ed25519 VALID + C2PA tertanam.
- **Contact sheet final:** `out/final-contact-sheet.jpg`. Skor final (self) 3,83; depth dibatasi 3 oleh audit:visual. Draf juri 3,67 (diterima setelah 2 putaran).
- **Pelajaran r3:** parts=60 menghilangkan glitch bocoran GPU, tapi LONCAT 25,42 dan 35,92 dtk tetap muncul di detik yang sama seperti r2 → bug adegan, bukan GPU:
  - 25,42 dtk: kamera dive turun melewati y=0 di r≈1,60, tepat di tepi `Ground hole=1.6` → menembus cincin salju. Fix: lubang 2,2, sumur r 2,22, lampu sumur x 2,05 / light 1,7 (`scenes.tsx` SceneD).
  - 35,92 dtk: sprite uap löyly (`Smoke`) mulai di tengah umur → muncul langsung opacity penuh. Fix: opacity × fade-in 35,9→36,4 dan fade-out 43,0→43,5 (`scenes.tsx` SceneE).
  - Klip cek 540×960 dua rentang PASS sebelum render penuh r4.
- **Lesson memory:** WORLDFORGE + GLOBAL kind fix (part pendek + bedakan glitch GPU vs bug adegan). Kandidat promosi muncul: `concurrency` (3 episode), `jobs` (2 episode).
- **Dihapus:** `out/FINAL_glitch_r1..r3.mp4`, `project/out/seg`, klip cek.
- **Review terjadwal** (upload Selasa 5 Jan 2027 19.00 WIB): `review-finlandia-sauna-24h` (6 Jan 19.00), `review-finlandia-sauna-72h` (8 Jan 19.00), `review-finlandia-sauna-7d` (12 Jan 19.00). Task hanya jalan saat aplikasi Claude terbuka.
