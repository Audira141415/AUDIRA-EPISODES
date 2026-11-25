# Batch EP11-EP13: ringkasan kerja (baca ini saja, jangan baca ulang rule hub)

Ditulis sesi 2, 2026-11-24. Rule hub, phase-b, rule 12, memori CHRONICLE, PIXELSTORY, dan FILMNOIR sudah dibaca; isinya diringkas di sini supaya sesi berikut hemat konteks.

## Status
- VO ketiga episode TERKUNCI: `audio/vo.wav`, `audio/timeline.json`, `studio/public/audio/epNN/vo.wav`, `studio/src/scenes/epNN/timeline.json`. Offset 0. Markup display/spoken di `docs/script-lines.json`, 6 section (hook, konteks, pengembangan, penjelasan, payoff, outro).
- Durasi: EP11 91,4 dtk (speech 87,4; 125 wpm), EP12 82,4 dtk (78,4), EP13 84,1 dtk (80,1).
- EP11 section: hook 0,1-4,0; konteks 4,4-23,7; pengembangan 24,1-45,9; penjelasan 46,3-58,2; payoff 58,6-74,4; outro 74,8-87,3.
- EP12 section: hook 0,1-5,4; konteks 5,8-27,8; pengembangan 28,2-39,2; penjelasan 39,7-51,4; payoff 51,8-66,6; outro 67,0-78,2.
- EP13 section: hook 0,1-3,2; konteks 3,7-18,6; pengembangan 19,0-42,1; penjelasan 42,6-55,5; payoff 56,0-73,1; outro 73,6-79,9.
- STYLE_DECISION ketiganya sudah `approved: yes`. MASTER_INDEX sudah memuat EP11-13.
- EP11: engine R3F siluet (salin `studio/src/scenes/ep05/` yaitu chronicle/, Film.tsx, hud.tsx, sets.tsx, timing.ts), bukan 2D datar.
- BELUM: ART_DIRECTION, STORYBOARD (min 6 baris), ASSET_MANIFEST, SHOTLIST (tiga docs pertama wajib baris `Style: <ID>` persis), cover-reference, cover-topic, kode, SFX, draf, preflight.

## Format docs (contoh: EP05/docs)
- SHOTLIST: baris `Style:`, `Hook:`, `Offset: 0`, tabel `# | Waktu | Objek | Aksi | Kamera | Teks layar | Beat`; dipakai `npm run sfx`.
- STORYBOARD: `Scene | Waktu | BG/MG/FG/HUD | Kamera | Audio`.
- ART_DIRECTION: Gagasan, Look, Material (min 5), Palet (min 4 hex), Tipografi, Cahaya per chapter, Penggambaran.
- THEME_CHECK: `Frame | Detik | Kata VO | Subjek di layar | Cocok`, min 6 baris, semua `ya`, diisi dari gambar (bukan niat kode), sebelum juri.

## Gerbang
- Juri buta = subagen yang hanya melihat contact sheet, cover quality-bar, ceiling, rubrik (`F:/AUDIRA-SKILL-MOTION/qa/jury.md`), dan kolom Frame/Detik/Kata VO. Maks 2 putaran. LOLOS rata-rata >= 3,8 tanpa aspek < 3; setelah 2 putaran terbaik >= 3,5 diterima; di bawah itu ganti style (tulis ulang docs). Baca contact sheet sebagai gambar sebelum record_score; skor tidak boleh melebihi ceiling `runs[]`. Skor 4-5 wajib evidence.
- G13 sebelum final: `draft/camera.json` (audit:camera) deadPct <= 5, longestHold <= 1,5, medianSpeed >= 0,04; `draft/look.json` diversity >= 30 (audit:visual).
- G14 rig 5/5 hanya Remotion 3D (EP11); PIXELSTORY dikecualikan.
- G19 qa-scene: ep05 memakai pengganti `audira_qa_video` hardOnly dengan daftar cut.
- G18: final `--vo` dan `--sfx` per episode; stem -20 pasangan `volume=-10dB`; VO min 12 LU di atas SFX (G18c diukur otomatis oleh render-final). Final -14 LUFS, TP < -1.
- Perintah final EP05 (pola): `npm run render:final -- --comp=Ep05Final --out=../<EP>/FINAL_<...>.mp4 --vo=public/audio/ep05/vo.wav --sfx=public/audio/ep05/sfx.wav --jobs=6 --concurrency=2 --gl=vulkan --encoder=nvenc --log=error --title="..." --slug=... --ep=EP05`.

## Pelajaran wajib
- Umum: satu subjek per frame; stamp maks 860 px tanpa rotasi di aksi; maks judul + 1 chip per frame; frame contact sheet >= 0,3 dtk dari tiap cut dan setelah angka terkunci; teks sekunder >= 36 px; subjek hook = kata VO pada detik itu.
- CHRONICLE: captionY 1300, kaki subjek y <= 1290, faceShot dist 7 fov 42 targetY 0,89, outlineGain 2,2 halo 0,45 fog 0,016, label >= 40 px; 7 set berbeda di ep05; rim/halo dinaikkan di set gelap; grain + dust motes + god-rays; karaoke pecah > 24 karakter; kutipan di panel gelap.
- PIXELSTORY: film sebagai gim 16-bit per set (scoreboard, LevelBanner, LifeBar, Stamp); tiap beat beda set/sudut/jarak; dither hanya langit/cahaya, bentuk bersih + pool cahaya tegas; tekstur lantai; >= 3 lapis + rim; NearLayer dikunci di y 1530 supaya bawah tidak kosong; sprite scale >= 1,4 di wide; hook berisi aksi utama, bukan kartu. EP08 (gagal 3,0 dan 3,17) jangan ditiru, EP01 (4,0) dan short-baru-2026-EP22 (4,0) ditiru.
- FILMNOIR: exposure 0,72, envIntensity 0,1; key + rim dingin mengikuti target kamera; hero prop >= 60% lebar; satu subjek terang sepanjang tiap scene; reveal memperlihatkan mekanisme utuh di permukaan terang; abu kecuali satu warna aksen; rata-rata juri final 3,61, jadi lighting (bobot 1,5) dan depth (1,3) paling penting. Skor terbaik: sejarah-sepak-bola-EP08 draf 3,83.

## Fakta wajib
Lihat SOURCE_REGISTER tiap episode. EP11: catatan layar "versi Olympedia" saat tertidur. EP12: jangan tampilkan tahun luka paha, waktu finis, atau klaim siapa jatuh di semifinal. EP13: bantahan Boris wajib tampil. Semua angka VO = callout kinetik. Tanpa wajah dan logo nyata.

## Jebakan
- Set TEMP/TMP ke F:/temp. Hook mengubah find/ls/wc/tail/df menjadi `rtk ...` (auto mode menolak); pakai python, cat, Read, Write.
- PYTHONUTF8=1 saat mencetak file docs.
- Kepala konteks sesi sudah besar (CLAUDE.md + daftar tool); sesi hanya punya sekitar 100 ribu token kerja. Jangan baca rule hub lagi. Satu sesi = satu episode.
- SERIES.json account.code "AUDIRA": cek `npm run channel` menghasilkan @AudiraSportFacts di outro.
