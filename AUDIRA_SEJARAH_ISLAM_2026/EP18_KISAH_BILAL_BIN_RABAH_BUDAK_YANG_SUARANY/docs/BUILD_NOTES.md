# BUILD_NOTES — EP18 Bilal (Sesi B, serah terima s2 ke s3)

Style: PAPERWORLD

## Sudah selesai
- Tahap 5: `project/` = starter + kit paperworld saja (kit lain, templates, scenes contoh selain showcase, SERIES.json, model template dihapus). `node_modules` = junction ke `F:\AUDIRA-SKILL-MOTION\node_modules`. `channel.json` = QISSAH @AUDIRAQISSAH. check-env Ready, smoke jalan, preflight tanpa blocker. `tsc`: 2 error bawaan di `src/core/qa/scene-qa.tsx` (abaikan). `public/brand/` sudah berisi stacked-reversed.svg.
- Tahap 6: VO dikunci 87,68 dtk (`public/audio/vo.wav`, `vo-words.json`, `vo.timing.json`; teks `audio/vo_tts.txt`). Lafal lolos cek Whisper (Audira, Ahad, Ka'bah, nama Arab). Kata "Audira" di karaoke ditulis AUDIRA.
- `public/tex/fibre.png`, `kraft.png` (RGBA, dari `tools/make_tex.py`), dipakai sebagai pattern `fib` / `krf` yang ikut bergerak dengan kartu.
- `src/ep18/timing.ts`: FILM 91,0 dtk, OUTRO 3,0, XFADE 0,4, 15 adegan, CALLOUTS (8 jenis: letters, ribbon, tag, plate, cite, note, stamp, sign).
- `src/ep18/pieces.tsx`: PaperDefs, P, K, Pool, Rays, Haze, FG, Ring/Rings, Ground, Peaks, Sun, Boulder, Pebbles, Scraps, Fig (berdiri, dari belakang), Seated, Lying, House, Palm, Kaaba, Minaret, Stars, Cloud, Leaf, Flower. Belum pernah dirender: cek still lebih dulu.

## Belum: urutan
1. `src/ep18/camera2d.ts`: salin dari `F:/AUDIRA-EPISODES/QISSAH/AUDIRA_KISAH_ISLAM_2026/EP46_IBLIS_MENOLAK_SUJUD/project/src/ep46/camera2d.ts` (cam2d + rigPose).
2. `src/ep18/Film.tsx`: pola EP46 `Film.tsx` (Fiber, karaoke per kata, AudiraOutro seconds=3, AudiraSignature seed `sejarah-islam-EP18` handle `@AUDIRAQISSAH`, komposisi Ep18Preview/Ep18Final/Ep18Cover di Root). Callout punya 8 bentuk:
   letters = huruf kertas Anton satu per satu dengan ekstrusi text-shadow + pop berurutan, ref kecil di bawah; ribbon = pita lipat; tag = label koper bertali ke tepi atas, berayun; plate = papan nama berwarna (col); cite = strip sumber kecil dengan ikon buku; note = kertas sobek + selotip; stamp = cap merah; sign = papan penunjuk arah kayu.
   Karaoke: Manrope 64 px, plat selebar isi (bukan penuh), top 1290, emas aktif, jarak kata ≥ 0,4em, bounce ≤ 1,04.
   Cahaya global jangan seragam: overlay soft-light diberi warna per adegan.
3. `src/ep18/scenes.tsx` (pecah 2–3 file). Tiap adegan: BG parallax 0,35, MG, FG blur; gerak kamera sendiri + push-in linear sampai akhir; Ground dan FG mengisi sampai y 2000 (bagian bawah jangan kosong). Kata kunci komposisi:
   - S1 0–5,6: makro low, langit putih terik, Sun r 330 di (640,520), Peaks pucat y 900; Lying selebar ±900 di y 1180; Boulder r 300 jatuh ke dada (dampak 0,9 dtk, Scraps, guncang), menekan; di 4,34 AHAD + Rings emas dari bawah batu, batu terangkat sedikit.
   - S2 5,6–14,7: aerial turun ke kota Makkah (House bertumpuk di lembah di antara Peaks); 10,6 zoom-out: kota berdiri di kitab terbuka, punggung kitab bercap AUDIRA.
   - S3a 14,7–18,2: low angle, Umayyah terakota raksasa di kanan menunjuk ke kiri, Bilal gading kecil di ambang pintu bercahaya.
   - S3b 18,2–28,2: wide jurang oranye, matahari naik ke puncak (21,5), dua pelayan condong mendorong batu dari kanan ke dada Lying (22,6–23,8), Umayyah menunjuk; 25,3 dan 27,2 dua papan arah.
   - S4a 28,2–32,8: makro samping batu memenuhi 60% atas; tangan dari lengan gading terangkat dengan satu jari telunjuk; Rings di 30,6 dan 31,15.
   - S4b 32,8–39,2: tebing senja, Waraqah (indigo, tongkat) besar di kiri berjalan lalu berhenti 35; jauh di bawah batu kecil + Bilal + Rings.
   - S5a 39,2–44,55: gerbang teduh; Abu Bakar (teal) kiri, Umayyah kanan; figur gading bergeser kanan→kiri 41,9, figur cokelat kiri→kanan 42,6, dua panah kertas.
   - S5b 44,55–51,45: close-up rantai karton diagonal, putus di 47,9, serpih emas, cahaya pecah.
   - S6a 51,45–54,8: kampung Madinah subuh indigo, truck melewati atap, warga keluar menoleh, Palm, jendela menyala.
   - S6b 54,8–58,8: Bilal besar (±1000 px) dari belakang di atap, tangan ke telinga, Rings ke fajar, jendela menyala beruntun.
   - S6c 58,8–65,3: kiri orang tidur + awan mimpi kertas berisi cincin emas; pan ke kanan 62,5: dua Seated berhadapan, pita suara emas pindah ke Bilal; ring besar 64,2.
   - S7a 65,3–73,85: FG batu lama (kini terang, ada bunga) lalu tilt naik ke Kaaba di lembah fajar, Fig gading kecil di atap, kerumunan dari belakang; impact + rings raksasa di 70,64.
   - S7b 73,85–77,85: jejak kaki emas menyala menaiki bukit ke cahaya (tanpa gambar surga).
   - S8a 77,85–81,3: Damaskus senja lavender (gerbang lengkung, rumah, siprus, gunung). Tanpa menara (anakronis tahun 640).
   - S8b 81,3–91: bola bumi kertas, Minaret di sepanjang lengkung menyala beruntun, lima matahari 84,75, Rings; pita "AUDIRA QISSAH" 86,5.
4. SFX: salin `sfx/cues/auto.py` jadi `ep18.py` (pola EP46: CALLOUT_T dari timing), `TARGET_LUFS = -28.0`, payoff 70,64, `PYTHONUTF8=1 npm run sfx`; perlu `SHOTLIST.md`.
5. Tahap 8 sesuai brief.

Catatan lingkungan: perintah Bash ditulis ulang hook `rtk`; jangan mengirim beberapa Bash dalam satu balasan (classifier menolak salah satunya).

## Serah terima s3 ke s4 (2026-11-26)
Sudah ditulis di s3 (belum ditypecheck, belum dirender):
- `src/ep18/camera2d.ts` (cam2d + rigPose, pola EP46).
- `src/ep18/set.tsx`: Svg (PaperDefs), L (layer parallax: cam {x,y,z}, k 0.2 jauh / 1 subjek / 1.7 FG), Sky (lembar langit berlapis), Txt (teks Anton di dalam dunia), Arrow (panah kertas busur).
- `src/ep18/Film.tsx`: GRADE per adegan (soft-light warna kunci/bayangan), 8 bentuk callout, karaoke Manrope 64 plat selebar isi top 1290, transisi sobek kertas (wipe, arah bergantian), AudiraOutro 3 dtk, AudiraSignature seed sejarah-islam-EP18 @AUDIRAQISSAH, Ep18Cover (frame t=5.1 + AHAD + pita BILAL BIN RABAH). Mengimpor `SCENE_MAP` dari `./scenes`.
- `src/Root.tsx`: Ep18Preview, Ep18Final, Ep18Cover terdaftar.
- `src/ep18/scenes1.tsx`: S1, S2, S3a, S3b selesai (export juga `shake`).
- pieces.tsx: `sleeve` diekspor, `Lying` punya prop `col` (default ivory). timing.ts: callout ribbon "AUDIRA QISSAH" 86.49–88.0 y 1120.

Belum:
1. `src/ep18/scenes2.tsx`: S4a, S4b, S5a, S5b (komposisi di daftar atas; S5b rantai karton: Link = elips stroke berlapis, putus 47.91, figur gading berdiri di cahaya di antara dua patahan).
2. `src/ep18/scenes3.tsx`: S6a, S6b, S6c, S7a, S7b, S8a, S8b.
3. `src/ep18/scenes.tsx`: `export const SCENE_MAP: Record<SceneId, React.FC<{t:number;lt:number}>>` dari scenes1-3.
4. `npx tsc --noEmit` (abaikan 2 error bawaan scene-qa.tsx), still per adegan → satu contact sheet kecil, perbaiki, lalu cover-topic.png, SHOTLIST.md, SFX, preflight, tahap 8.
Catatan: tulis file kode dengan tool Write, bukan heredoc Bash (hook rtk merusak heredoc panjang).

## Serah terima s4 ke s5 (2026-11-26)
Selesai di s4:
- `src/ep18/scenes2.tsx` (S4a–S5b), `scenes3.tsx` (S6a–S8b), `scenes.tsx` (SCENE_MAP). `npx tsc --noEmit` bersih (selain 2 error bawaan scene-qa.tsx).
- Still semua 15 adegan dicek (contact sheet). Perbaikan: S6c dua Seated digeser ke 780/1180 + lampu gantung, pan cam.x ke 420; S7b jejak kaki lebih besar dan bergaris tepi gelap; Pool putih S7b dikurangi.
- Audit layout: latar ivory root dipindah ke div saudara (bukan ancestor teks) di Ep18Final/Preview/Cover; bayangan `Txt` diberi `data-layout-ignore`; AUDIRA di punggung kitab S2 muncul mulai 10,4; huruf callout `letters` kini terakota gelap (#9E3E26/#8E3420) dengan ekstrusi terraDk, kecuali `col: "gold"` (dipakai "5× SEHARI" di langit gelap); pita ribbon punya backgroundColor terakota.
- `draft/stills_r2/` (7 frame) audit: "no aspect capped below 4" (lighting/material/depth/composition 5, readability ≥ 4).

Berikutnya (s5): render `style/cover-topic.png` (komposisi Ep18Cover, 1080×1920) dan tampilkan; `SHOTLIST.md`; SFX `sfx/cues/ep18.py` (pola EP46, CALLOUT_T dari timing, TARGET_LUFS -28, payoff 70,64, `PYTHONUTF8=1 npm run sfx`); preflight; lalu tahap 8 penuh (contact sheet 540×960 frame kunci, audit:visual, THEME_CHECK G22, G24, klip ≤ 20 dtk 540×960 → audit:camera, `npm run audit:rig -- src/ep18/camera2d.ts rigPose`, record_score self + juri buta, maks 2 putaran). Hapus `draft/stills_r2` bila tak perlu. Lalu handover newSession ke Sesi C.
Frame per adegan yang bagus untuk contact sheet: 4.9s,8.5s,16.5s,23.2s,31.6s,37s,42.9s,48.6s,53.5s,57s,63.8s,71.2s,76.5s,80s,87s.
