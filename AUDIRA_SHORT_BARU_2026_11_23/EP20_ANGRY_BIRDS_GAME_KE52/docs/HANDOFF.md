# HANDOFF — EP20 Angry Birds: game ke-52 Rovio (AUDIRA TECH, @AudiraTECH)

Ditulis 2026-11-23 oleh sesi pertama (konteks penuh). Baca file ini dulu, lalu `audira_episode_status get` (episodeDir folder ini).

## Tugas
Short 2D 9:16, 80–90 dtk, final 1080×1920@60, channel AUDIRA TECH. Pipeline 11 tahap global (`C:\Users\ASUS\.claude\CLAUDE.md`), engine skill `audira-2d-motion` (dipakai: HyperFrames 2D canvas pixel art).
Hanya ubah folder ini. Folder saudara EP01–EP19 dikerjakan sesi lain paralel: baca boleh, ubah jangan.
Ilustrasi buatan sendiri: tanpa logo Rovio/Angry Birds, tanpa karakter resmi. Burung = burung bulat generik (variasi warna oranye/kuning/teal, alis marah), babi = gumpalan hijau generik. Tokoh nyata (Jaakko Iisalo, pendiri) = siluet piksel + papan nama. Chip "ILUSTRASI, BUKAN CUPLIKAN ASLI".

## Sudah selesai
- Riset: `research/SOURCE_REGISTER.md` (F1–F20 + Framing hati-hati). Wajib: "di ambang bangkrut" (bukan bangkrut), 51 game sebelumnya banyak untuk klien (bukan "51 kali gagal"), flu babi = "konon".
- Gerbang style: pengguna memilih **PIXELSTORY** (acc tercatat di STATUS). Alternatif ditolak: PAPERWORLD, COMICFORGE. `style/style-options.jpg`, `style/cover-reference.jpg` sudah ada. BELUM: `style/STYLE_DECISION.md` (baris `Style: PIXELSTORY`, alasan, alternatif ditolak + alasan, tanggal, approved: yes, engine: hyperframes) dan `style/cover-topic.png`.
- Naskah: `project/script-lines.json` (s1–s8, markup `{display|spoken}`, 206 kata ucapan).
- **VO DIKUNCI** (jangan generate ulang): MCP `audira_generate_voiceover` per baris speed 0.95 → `audio/work/clips-raw/sN.wav/.json` → `audio/work/meta-raw.json` → `python lib/vo.py x tts --skip-tts` → `python lib/vo.py x build --tempo 1.0`. Hasil `audio/VO_MASTER.wav`, `project/timeline.json`: speech 84.70 s, film 87.7 s. (`vo.py tts` langsung gagal: CARTESIA_API_KEY tidak ada di .env → pakai MCP.)
- Pipeline disalin dari EP05 PlayStation (folder saudara, PIXELSTORY HyperFrames): `project/lib/` (hflib.mjs, shell.mjs, audio_lib.py, master.py, qc.py, build-srt.py, vo.py, series.json = AUDIRA TECH), `project/hf/` (hyperframes.json, assets/brand, assets/img/grain.png), `audio/sfx/*.mp3`.

## Referensi kode (baca-saja)
`F:\AUDIRA-EPISODES\AUDIRA_SHORT_BARU_2026_11_23\EP05_PLAYSTATION_DARI_NINTENDO\project\` — `world2d.js` (buffer 180×270, view 135×240 ×8 nearest, primitives px/R/D(dither Bayer)/G/circ/ring/line/T(font 3×5)/TC/pool/cone/vignette/boards/under/person/plate; scene fungsi sc*(t); director `draw(t)` dengan cam {x,y,z}, CUTS fade INK 0.18 s; `export const ANCHORS=[...]`; export `create(canvas,K,AT)`), `build-video.mjs` (panel HTML `.p` data-in/out, `.ct` counter, data-at/data-fx lit, writeWorld opts: ep, bg, sig, extraAt, panelIn/Out steps; writeCaptions top 1300; writeIndex), `mix.py` (musik chiptune numpy + SFX, duck di bawah VO). Ganti ep "20", sig "EP20_ANGRY_BIRDS_GAME_KE52", judul.
Snapshot/render (dari project/): `node build-video.mjs && cd hf && TEMP='F:\hf-render-tmp' TMP='F:\hf-render-tmp' npx hyperframes snapshot --no-end --at "..."`; final `npx hyperframes render -o ../out/raw.mp4 -f 60 -q standard -w 6`, `python lib/master.py out/raw.mp4 ../FINAL_VIDEO.mp4`, `python lib/qc.py`, metadata ffmpeg (comment `AUDIRA-angry-birds-game-ke52-EP20 | audira.my.id`), `audira_qa_video` hardOnly.
Pelajaran PIXELSTORY wajib: beda set/sudut tiap beat; lantai bertekstur + dither; maks judul + 1 chip per frame; Stamp ≤ 860 px tanpa rotasi; chip seri ≥ 250 px dari atas; frame contact sheet ≥ 0,3 dtk dari cut; isi bagian bawah set close-up.

## Timeline (detik VO, kata display; anchor `sN:kata`, duplikat `#2`)
s1 0.1–10.58: 51@0.1 hit@4.0 Lalu@5.2 ke-52@6.6 menyelamatkan@7.8 kebangkrutan.@9.8
s2 10.74–19.53: Rovio,@11.2 Finlandia@12.9 mahasiswa@14.7 2003.@15.6 pesanan@18.2 perusahaan@18.8
s3 19.69–28.31: 2009,@20.3 bangkrut.@22.3 menyusut@23.5 50@24.1 12.@25.0 Uangnya@26.2 satu@27.5
s4 28.47–39.50: Desainer@28.5 Jaakko@29.6 menggambar@30.9 marah,@33.0 sayap@34.2 kaki.@35.1 Musuhnya@36.0 hijau,@36.9 flu@38.9
s5 39.66–49.72: tarik@40.9 lepaskan@41.9 robohkan@43.0 Digarap@44.5 bulan,@45.3 membengkak@46.7 €100.000.@48.6
s6 49.88–61.75: 11@49.9 Angry@52.1 iPhone@53.4 US$0,99.@54.4 Februari@56.1 nomor@59.2 Inggris,@59.8 Amerika.@61.1
s7 61.91–73.79: menembus@62.4 1@62.8 2012,@63.7 5@65.7 Filmnya@66.7 US$352@67.5 2023,@69.6 Sega@70.8 €706@72.3
s8 73.95–84.70: 51@74.2 latihan.@77.4 menyerah,@79.2 mencoba@80.3 Tulis@81.7 ikuti@83.6 AUDIRA@84.1

## Rencana adegan (PIXELSTORY 2D, set & sudut beda tiap beat, ≥ 8 set)
1. s1 HOOK: dinding 51 kartrid/layar kecil "GAME OVER" menyala satu per satu (counter 0→51), lalu pada "ke-52" satu kartrid emas bersinar + banner "LEVEL 52"; panel "GAME KE-52 / PENYELAMAT STUDIO".
2. s2 Helsinki salju malam, kantor kecil, 3 siluet mahasiswa + papan "ROVIO · 2003"; potong ke meja penuh kotak game pesanan "UNTUK KLIEN" (tanpa logo EA/Namco, cukup teks "PESANAN").
3. s3 kantor sepi: meja kosong, kursi berdebu, counter karyawan 50→12 (figur menghilang), dompet/brankas dengan 1 koin "DANA 1 GAME"; langit badai.
4. s4 meja desainer: siluet + plate "JAAKKO IISALO", kertas sketsa burung bulat marah tanpa sayap/kaki muncul; lalu babi hijau gumpalan + koran "FLU BABI" (chip "konon").
5. s5 level gameplay piksel ciptaan sendiri: ketapel Y, burung ditarik (tarik), melesat (lepaskan) lintasan titik, menara balok kayu/kaca runtuh (robohkan), babi pop; lalu kalender 8 bulan + koin €25K→€100K (×4) di papan.
6. s6 ponsel layar sentuh generik raksasa (tanpa logo Apple) di etalase, label harga "$0,99", tanggal "11.12.2009"; tangga tangga chart "#1" naik ke puncak dengan bendera teks "INGGRIS" lalu "AMERIKA".
7. s7 PAYOFF: counter unduhan 1 MILIAR → 5 MILIAR+ dengan hujan ponsel; layar bioskop "US$352 JUTA" (neon "AUDIRA TECH" di gedung bioskop = brand di dunia); peti harta "SEGA €706 JUTA · 2023".
8. s8 kembali ke dinding 51 GAME OVER yang kini berubah jadi tangga 52 anak tangga menuju burung di puncak sunrise; "LATIHAN, BUKAN SIA-SIA"; CTA "TULIS DI KOMENTAR"; outro card shell.mjs (ep "20").

## Sisa langkah
1. STYLE_DECISION.md; docs rule 12: `docs/ART_DIRECTION.md` → `docs/SCRIPT.md` + `docs/STORYBOARD.md` (tabel ≥6 baris Scene|Waktu|BG/MG/FG/HUD|Kamera|Audio, baris `Style: PIXELSTORY`) → `docs/ASSET_MANIFEST.md`.
2. Tulis `project/world2d.js`, `project/build-video.mjs`, `project/mix.py` (pola EP05).
3. Cover topik `style/cover-topic.png` (snapshot hook ~6.8 dtk) + tampilkan.
4. `draft/contact-sheet.jpg` 8 frame + `draft/THEME_CHECK.md` → record_score self + juri buta (subagent) stage draft, lolos ≥3.8.
5. Final 60 fps + master + qc + metadata + qa_video hardOnly → `FINAL_VIDEO.mp4`; record_score final.
6. SOCIAL_CAPTIONS.md 6 platform + `## Jadwal Upload (WIB)` + `## Label Konten AI` → validator; NOTES.md; append_lesson PIXELSTORY; tampilkan caption di chat; tanya jam upload → 3 scheduled task review (+24j/+72j/+7h).

## Update sesi 2 (2026-11-23)
Selesai: `style/STYLE_DECISION.md`, `docs/ART_DIRECTION.md`, `docs/SCRIPT.md`, `docs/STORYBOARD.md`, `docs/ASSET_MANIFEST.md`, `project/world2d.js` (BARU, PIXELSTORY full-frame: buffer 180x270, view 135x240 x8 nearest, dither Bayer; 13 set: sc1 51 layar+emas 52, sc2a salju Helsinki, sc2b meja kotak KLIEN, sc3 kantor badai 50->12 + brankas 1 koin, sc4a papan gambar burung, sc4b koran FLU BABI + babi + cap KONON, sc5a level ketapel, sc5b papan 8 bulan + koin x4, sc6a ponsel etalase + $0,99, sc6b tangga chart #10->#1 + bendera, sc7a hujan ponsel + bar unduhan 5 MILIAR+, sc7b bioskop neon AUDIRA TECH US$352 JUTA, sc7c peti ROVIO + SEGA + €706 JT, sc8 layar jadi tangga + emas 52 + papan AUDIRA TECH). Belum pernah dirender: cek snapshot dulu, perbaiki error.
Belum: `project/build-video.mjs` dan `project/mix.py` (salin pola EP05 di `../EP05_PLAYSTATION_DARI_NINTENDO/project/`, ganti ep "20", sig "EP20_ANGRY_BIRDS_GAME_KE52", judul "Angry Birds game ke-52", palet PIXELSTORY: font Silkscreen tag + kartu .c, caption Pixelify top 1300).
Rencana panel HUD (tag + 1 kartu, anchor kata): P1 @0→s1:Lalu kartu counter 0→51 "GAME" (s1:51) + l2 "BELUM ADA HIT" (s1:hit); P1b s1:Lalu→s2 "GAME KE-52" (s1:ke-52) + l2 "PENYELAMAT STUDIO" (s1:menyelamatkan); P2 s2→s2:Bertahun-tahun tag "LEVEL 1 · FINLANDIA", kartu "3 MAHASISWA" (s2:mahasiswa) + l2 "ROVIO · 2003" (s2:2003); P2b →s3 "GAME PESANAN / UNTUK KLIEN" (s2:pesanan); P3 s3→s3:Uangnya tag "AWAL 2009", kartu "DI AMBANG BANGKRUT" (s3:bangkrut) + l2 counter karyawan 50→12 (a s3:menyusut, d 1.5); P3b →s4 "DANA: 1 GAME LAGI" (s3:satu); P4 s4→s4:Musuhnya tag "LEVEL 2 · DESAINER", "BURUNG MARAH" (s4:marah) + l2 "TANPA SAYAP &amp; KAKI" (s4:sayap); P4b →s5 "MUSUH: BABI HIJAU" (s4:hijau) + l2 "KONON: BERITA FLU BABI" (s4:konon); P5 s5→s5:Digarap tag "CARA MAIN", "TARIK · LEPAS" + l2 "ROBOHKAN!" (s5:tarik/lepaskan/robohkan); P5b →s6 "8 BULAN" (s5:bulan) + l2 counter €25.000→100.000 (a s5:membengkak d 1.9); P6 s6→s6:Februari tag "LEVEL 3 · RILIS", "11 DES 2009" (s6:11) + l2 "US$0,99" (s6:US$0,99); P6b →s7 "#1 APP BERBAYAR" (s6:nomor) + l2 "INGGRIS → AMERIKA" (s6:Inggris); P7 s7→s7:Filmnya tag "UNDUHAN", counter 0→1 " MILIAR" (s7:menembus) + l2 "&gt;5 MILIAR" (s7:5); P7b →s7:Tahun "FILM: US$352 JUTA" (s7:US$352); P7c →s8 "SEGA BELI ROVIO" (s7:Sega) + l2 "€706 JUTA · 2023" (s7:€706); P8 s8→s8:Tulis "51 GAME = LATIHAN" (s8:latihan); P8b s8:Tulis→s8:Ikuti?? (kata "ikuti" huruf kecil: pakai s8:AUDIRA atau @END) "TULIS DI KOMENTAR".
mix.py cue SFX: blip per layar s1 0.1–4.0, error s1:hit, riser→impact s1:ke-52, sparkle s1:menyelamatkan; wind noise s2, chime s2:mahasiswa, pop per kotak s2:pesanan; thunder s3:bangkrut, blip turun s3:menyusut, ping s3:satu; scribble s4:menggambar, pop s4:marah, error s4:sayap/kaki, pop s4:babi, thump s4:konon; creak s5:tarik, whoosh s5:lepaskan, impact+glitch s5:robohkan(+pop), coin s5:membengkak; ping s6:US$0,99, blip naik 9x s6:Februari→nomor, chime s6:nomor; riser→impact payoff s7:5, coins s7:US$352, impact s7:Sega; chime s8:latihan, ping s8:Tulis, thump outro. Musik chiptune: mayor (C) untuk s6+, minor sebelumnya.

## Update sesi 3 (2026-11-23)
Selesai: `project/build-video.mjs` (panel sesuai rencana; anchor `s1:ke-52` DIGANTI `s1:game#2+0.6` karena regex anchor membaca "-52" sebagai offset; P8b in s8:Tulis out s8:AUDIRA), `project/mix.py` (cue sesuai rencana), `style/cover-topic.png` (snapshot 6.9 dtk, sudah ditampilkan ke pengguna), `draft/THEME_CHECK.md` (8 frame semua ya), `draft/contact-sheet.jpg` (8 frame 6.9,13.5,24.5,33.6,42.3,59.8,66.2,82.5; dibuat dengan `python work/sheet.py work/draftN draft/contact-sheet.jpg 4 270`).
world2d.js diperbaiki: burung default ORG + paruh kuning (bukan merah ala karakter resmi), plate JAAKKO/IISALO 2 baris di x46 + kamera sc4a tetap x92, stack €25K–100K x=54+26i, X4 di (36,110), SEGA x40, tag €706 x128, label UNDUHAN dunia dihapus, s8 layar→tangga mulai s8:sia-sia+0.2, papan s8 "AUDIRA TECH / COBA / SEKALI LAGI" x24, salju sc2a digelapkan, arc ketapel 40 (dulu 64, burung tertutup kartu).
Skor draf: self 4.0; JURI putaran 1 = 3.17 PERLU POLES (lighting/material/depth/composition/readability 3, motion 4): lighting datar tanpa glow/haze, 35-40% bawah lantai kosong, LEVEL 52 tertutup kartu, 5 MILIAR+ menimpa bar, chip ILUSTRASI kecil, figur karyawan F3 kecil.
Poles putaran 2 SUDAH DITERAPKAN (belum dirender/dinilai): `reflect(t)` lantai mengkilap (mirror dither dari `under()`, hanya piksel lantai yang tak tertimpa) + pool CRM 0.12 di garis lantai, banner LEVEL 52 pindah ke y148 (di bawah layar emas), 5 MILIAR+ y118, sc3 zoom 1.3, chip 32px. `node build-video.mjs` sudah dijalankan.
BLOKER: drive C: penuh (0 MB) → `python mix.py` macet (ffmpeg di audio_lib.read). Jalankan mix dengan `$env:TEMP='F:\hf-render-tmp'; $env:TMP='F:\hf-render-tmp'` dan cek `audio/work/stem-*.wav` lalu `project/hf/assets/audio`. Beri tahu pengguna soal C: penuh (jangan hapus apa pun tanpa izin).
Berikutnya: snapshot ulang 8 frame → `draft/contact-sheet.jpg` → cek visual (refleksi tidak menimpa caption/benda) → record_score self + juri buta (subagent, prompt sama: jury.md + cover-reference + contact sheet + THEME_CHECK) putaran 2/2. Bila < 3.8 setelah putaran 2: kembali ke gerbang style (G16/G21). Lolos → mix → final (langkah 5–6 di atas).
