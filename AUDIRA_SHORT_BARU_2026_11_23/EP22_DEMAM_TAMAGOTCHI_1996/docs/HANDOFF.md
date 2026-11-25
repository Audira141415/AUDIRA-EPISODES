# HANDOFF — EP22 Demam Tamagotchi 1996 (update sesi 2, 2026-11-23)

Channel **AUDIRA TECH (@AudiraTECH)**, style **PIXELSTORY** (acc pengguna), engine Remotion 2D. Signature seed `demam-tamagotchi-1996`.
Hanya ubah folder ini (sesi lain jalan paralel di EP saudara). Tidak ada gerbang lagi: semua otomatis sampai final.

## Selesai (sesi 1–2)
- Tahap 1–3. `style/STYLE_DECISION.md` ditulis (Style: PIXELSTORY, approved: yes). BELUM: `style/cover-topic.png` (render dari adegan hook film setelah Film.tsx jadi, mis. komposisi `Ep22Cover`).
- `docs/ART_DIRECTION.md`, `docs/script-lines.json` (195 kata, 6 bagian, markup `{tampil|ucap}`).
- **VO terkunci**: Cartesia voice 04b567df…, `audio/work/vo-raw.wav` (82,57 dtk) → `python _tools/vo_tighten.py .` → `audio/vo.wav` + `audio/timeline.json` → `python _tools/make_timeline_ep22.py` (jalankan dari folder episode) → `project/src/scenes/ep22/timeline.json` (lead 0,1, voEnd 82,726, **total 86,726**) + `project/public/audio/ep22/vo.wav`. Jangan generate VO ulang.
- **Proyek** `project/` = salinan proyek EP06 (Easter Egg, PIXELSTORY, AUDIRA TECH) tanpa out; `node_modules` = junction ke `F:\AUDIRA-EPISODES\AUDIRA_SEJARAH_SEPAK_BOLA_2026\studio\node_modules`. Tools di `_tools/`.
- Folder scene `project/src/scenes/ep22/` MASIH BERISI KODE EP06 (Film.tsx, sets.ts, sprites.ts, hud.tsx, timing.ts, Cover.tsx, index.ts) — harus ditulis ulang untuk EP22. `src/Root.tsx` masih Ep06 → ganti ke Ep22Cover/Ep22Preview/Ep22Final, SLUG `demam-tamagotchi-1996`, import `./scenes/ep22/index.ts`. `project/SERIES.json` sudah TECH (ubah nama series ke EP22).
- Catatan: heredoc di Bash tool gagal untuk teks panjang berisi tanda kutip → tulis file dengan Write tool.

## Arsitektur yang dipakai (pelajari dari kode EP06 di ep22/)
- `sets.ts`: `createAlbedo(w,h,ox,oy)` + `painter` (put/rect/hline/vline/disc/ring/line/poly/shade; material RAMPS: wood woodDark plaster paper metal book1 book2 book3 leaf sky amberLamp ivoryLit teal screen dusk mesa stone frame). Set = {back, mid, near}, 1 art px = 8 px layar, frame 0..135 × 0..240, subjek di atas art row 160 (caption band 161–192). Props kit: nightWindow, shelf, books, desk, monitor, deskLamp, mug, pothos, keyboard, floor, rug.
- `Film.tsx`: tiap adegan = `<CinematicCamera cam>` + `<Layer z>` + `<AlbedoView albedo lights opts>` + `Glow`, sprite via `Lit`/`SpriteView`; kamera `camAt(t, keys, seed)`; `Film` memilih adegan via `sceneAt(t)`, lalu Grade/Vignette/Grain/Exposure flash, HUD, Disclaimer, Wipe, Captions.
- `hud.tsx`: Pop, Chip, NameCard, Stamp, Wipe (pakai WIPES), Captions karaoke (bottom 400), Disclaimer — bisa dipakai apa adanya.
- `timing.ts`: `W(id,i,expect)`; ganti blok T/CUT/sceneAt/WIPES untuk EP22. `warehouse()` dan `office()` di sets.ts EP06 bisa dipakai ulang (E2, F); sprite `teenBack()` untuk murid kelas.

## Indeks kata VO (indeks:kata@detik) — untuk T di timing.ts
- hook: 6:jutaan@2.02 8:menangis@2.546 16:piksel.@4.868 17:Ini@5.425
- konteks: 0:Dua@6.998 10:Bandai@9.506 12:Tamagotchi,@10.203 13:telur@11.255 16:gantungan@12.416 18:Penciptanya@13.624 19:Aki@14.227 22:Akihiro@14.94 24:Namanya@16.317 26:tamago,@16.952 29:watch,@18.159 30:jam@18.779
- pengembangan: 0:Telurnya@20.351 1:menetas@20.723 5:Dengan@22.36 6:tiga@22.669 10:memberinya@23.923 11:makan,@24.31 12:membersihkan@25.038 15:mengobatinya@26.864 18:Telantarkan@28.594 19:kurang@29.105 25:mati.@30.823 26:Versi@31.81 29:hantu@32.832 31:batu@33.219 33:Versi@34.36 37:malaikat.@35.769
- penjelasan: 0:Lalu@37.187 3:meledak.@37.945 4:Sekitar@38.901 5:empat@39.288 13:Anak-anak@42.071 16:kelas,@43.898 17:bunyi@44.377 18:bipnya@44.703 22:banyak@46.622 25:melarang.@47.768 26:Ada@48.758 29:menguburkan@49.408 32:pemakaman@50.585 34:Bandai@52.114 37:tombol@52.981 38:jeda,@53.244 39:lalu@53.755 41:penitip.@54.421
- payoff: 0:Tahun@55.839 7:penciptanya@58.266 9:Ig@59.087 11:Ekonomi,@59.443 12:karena@60.584 14:jutaan@61.451 21:Setahun@63.866 25:dan@65.94 27:rugi@66.668 28:enam@66.993 31:Tapi@68.491 35:efek@69.869 36:Tamagotchi.@70.225 37:Bukti@71.429 43:mesin.@72.992 44:Kini,@73.948 46:hampir@75.155 47:seratus@75.357
- outro: 0:Kamu@77.254 4:Ceritakan@78.86 7:Ikuti@80.176 8:Audira@80.532

## Rencana adegan (9 adegan, potongan di kata VO)
| Scene | Waktu | Set (BG/MG/FG) | HUD |
|---|---|---|---|
| A Hook | 0–6,998 | kamar malam: jendela bulan / meja samping ranjang + lampu + telur digital tergeletak, LCD hantu+nisan, tetes air mata / tepi bantal | judul cover "MATI KARENA DITELANTARKAN" → chip "30 TAHUN LALU · 23 NOV 1996", "JUTAAN ANAK MENANGIS"; push-in ke LCD di "piksel"; plakat AUDIRA di meja (Ini Audira) |
| B Konteks | 6,998–20,351 | toko mainan Jepang 1996: pegboard telur berantai / etalase + kasir, label toko "AUDIRA TOYS" / kotak antre | chip "23 NOV 1996 · JEPANG", "BANDAI" 9,5, "SEUKURAN GANTUNGAN KUNCI" 12,4, NameCard AKI MAITA (BANDAI) 14,2 & AKIHIRO YOKOI (WIZ) 14,9, "TAMAGO + WATCH" 16,9 → "TELUR + JAM TANGAN" 18,8 |
| C Pengembangan | 20,351–37,187 | DI DALAM LAYAR LCD (HTML/SVG dot-matrix palet #9BBC0F/#8BAC0F/#306230/#0F380F, bezel cangkang di tepi): telur menetas 20,7 → makhluk; 3 tombol 22,7; ikon makan 24,3, kotoran+sapu 25,0, obat 26,9 | chip "3 TOMBOL", timer "< 12 JAM" 29,1 berdetak, makhluk mati 30,8 (flash), "VERSI JEPANG: HANTU + NISAN" 31,8, "VERSI INGGRIS: MALAIKAT" 34,4 |
| D Penjelasan | 37,187–48,758 | kelas 90-an: papan tulis / bangku + murid tampak belakang (teenBack) + telur berbunyi / meja depan buram | counter "40 JUTA UNIT" 38,9, gelembung "BIP! BIP!" 44,4, Stamp "DILARANG" 47,77; tulisan papan kecil "AUDIRA" |
| D2 | 48,758–55,839 | pemakaman mini senja: langit dusk + bukit / nisan kecil + telur + bunga / rumput | chip "PEMAKAMAN KHUSUS" 50,6, "TOMBOL JEDA" 52,98, "FITUR PENITIP" 53,76 |
| E1 Payoff | 55,839–63,866 | panggung Ig Nobel: tirai merah / podium + piala + spotlight / kepala penonton | chip "1997", Stamp "IG NOBEL EKONOMI" 59,09, chip "JUTAAN JAM KERJA → HEWAN VIRTUAL" 60,58 |
| E2 | 63,866–68,491 | gudang stok tak laku (`warehouse()` EP06) / grafik turun | chip "1998 · DEMAM SURUT", Stamp "RUGI ¥6 MILIAR" 66,67 |
| F | 68,491–77,254 | ruang modern siang (`office()` EP06): robot/ponsel + telur di meja, hati naik | Stamp "EFEK TAMAGOTCHI" 69,87 (impact payoff, riser sebelumnya), chip "MANUSIA BISA SAYANG PADA MESIN" 71,43, counter "98 JUTA+ UNIT (2025)" 73,95 |
| OUT | 77,254–86,726 | kamar hook pagi: LCD makhluk hidup + hati | chip "KAMU DULU PUNYA?" + "CERITAKAN DI KOMENTAR", kartu IKUTI AUDIRA TECH 80,18; AudiraOutro 3,8 dtk terakhir (82,926–86,726) |

Disclaimer pojok "ILUSTRASI, BUKAN CUPLIKAN ASLI". Tanpa logo Bandai / karakter resmi; telur digital generik + makhluk piksel orisinal.

## Sisa langkah
1. Tulis `docs/SCRIPT.md`, `docs/STORYBOARD.md` (tabel di atas + kolom Audio), `docs/SHOTLIST.md` (format EP06 `../EP06_EASTER_EGG_PERTAMA_GAME/docs/SHOTLIST.md`, Offset: 0, ≥ 15 baris), `docs/ASSET_MANIFEST.md`; `python F:/AUDIRA-2D-SKILL-MOTION/tools/storyboard_lint.py docs/STORYBOARD.md`.
2. Tulis ulang ep22/ (sets, sprites, timing, Film, Cover, index) + Root.tsx; `npx tsc --noEmit`; uji crash renderFrames penuh (imageFormat none).
3. `style/cover-topic.png` (still 1080×1920 adegan hook + judul).
4. SFX: `npm run sfx -- --shotlist=../docs/SHOTLIST.md --out=public/audio/ep22/sfx.wav` (lihat opsi timing VO di `../EP06_EASTER_EGG_PERTAMA_GAME/docs/HANDOFF.md`), salin ke `audio/sfx/`.
5. Draf: contact sheet 6–8 frame 540×960 (`draft/contact-sheet.jpg`), `npm run audit:visual` (look.json), klip 15–20 dtk + `audit:camera`, `draft/THEME_CHECK.md`, juri self + juri buta (subagent, qa/jury.md) LOLOS ≥ 3,8 → record_score draft (episode `short-baru-2026-EP22`).
6. Final: cek GPU_LOCK di side-session-notes; `npm run render:final -- --comp=Ep22Final --out=out/ep22/FINAL_EP22.mp4 --vo=public/audio/ep22/vo.wav --sfx=public/audio/ep22/sfx.wav --jobs=4 --concurrency=2 --gl=vulkan --encoder=nvenc --log=error --title="Demam Tamagotchi 1996" --slug=demam-tamagotchi-1996 --ep=EP22`; QA −14 LUFS / TP < −1 (loudnorm TP −1,5 bila perlu), qa_video, metadata ffmpeg (CLAUDE.md poin 2.4), sign-video manual (bug await, rename EPERM → copy+unlink), `FINAL_VIDEO.mp4`, record_score final.
7. SOCIAL_CAPTIONS.md 6 platform + Jadwal Upload (WIB) + Label Konten AI (contoh `../EP04_PULAU_SENTINEL_UTARA/SOCIAL_CAPTIONS.md`), validator, NOTES.md, append_lesson, caption tampil di chat, 3 scheduled task review (`review-demam-tamagotchi-1996-24h/-72h/-7d`).

## UPDATE sesi 3 (2026-11-23) — baca template, belum ada perubahan kode
- Skill audira-2d-motion dimuat; kode EP06 (sets/timing/sprites/Film/hud/Cover/Root) sudah dipelajari. hud.tsx dipakai apa adanya.
- PERINGATAN memori PIXELSTORY: EP06 GAGAL 3 putaran juri (3.33/3.00/3.33) lalu restyle ARCADECRT; EP05 gagal 2.67/3.0. Rata final style 3.92 (gold fakta-olahraga EP01 = 4.0). Penyebab utama yang WAJIB dihindari di EP22:
  1. 35–40% bawah frame gelap kosong di bawah caption → isi art row 192–240 dengan FG terang/bertekstur (selimut, meja, rumput, kepala penonton) dan turunkan kamera.
  2. Interior datar → tiap set ≥3 lapisan + rim light semua sprite + pool cahaya tegas; dither hanya untuk gradasi langit/cahaya.
  3. Nama orang pakai FONT.display (bukan Silkscreen; B/D tertukar). Chip ≤ 2 baris, maksimal judul + 1 chip per frame.
  4. Hook & outro beda framing; hook menampilkan aksi utama VO (anak menangis + LCD nisan, bukan objek kecil). Subjek mikro (LCD) = push-in besar.
  5. Frame contact sheet ≥ 0,3 dtk dari cut; tag AUDIRA tidak ganda; label tidak diulang.
- Gold referensi: `F:/AUDIRA-EPISODES/AUDIRA_FAKTA_OLAHRAGA_2026/studio/src/scenes/ep01/` (juri 4.0).
- Berikutnya: langkah "Sisa langkah" 1 (docs) dst.
- Sesi 3 (lanjutan): docs/SCRIPT.md, STORYBOARD.md (9 adegan + kolom Audio), SHOTLIST.md (18 baris, Offset 0), ASSET_MANIFEST.md DITULIS. storyboard_lint: PASS (jalankan dengan `PYTHONIOENCODING=utf-8`; parser membaca 0 shot dari format tabel ini, sama seperti EP06).
- Pindah sesi (context guard ±191k) SEBELUM menulis kode. Berikutnya: langkah 2 "Sisa langkah" (tulis ulang ep22/ sets, sprites, timing, Film, Cover, index + Root.tsx) dengan aturan "UPDATE sesi 3".

## UPDATE sesi 4 (2026-11-23) — sprites.ts DITULIS, rancangan kode dikunci
- Sidebar rapi, sesi s3 diarsipkan. Context guard ±192k saat baru mulai menulis kode → pindah sesi.
- DITULIS: `project/src/scenes/ep22/sprites.ts` (EP22): kidSide()+KID_SIDE_ANCHOR+KID_HANDS, kidBack()+KID_BACK_ANCHOR, headBack()+HEAD_ANCHOR, person()+PERSON_ANCHOR+PERSON_HAND, SPEC, KID_PAL, PUPIL_PALS[3], CROWD_PALS[5], SUIT_PAL, OFFICE_PAL. Tidak ada sprite telur lagi.
- BELUM: sets.ts, timing.ts, Film.tsx, Cover.tsx, index.ts (index tidak perlu diubah), Root.tsx (masih EP06). File EP06 lama di ep22/ masih berisi kode EP06 → tulis ulang penuh dengan Write tool.
- API kit (sudah dicek): painter put/rect/hline/vline/disc/ring/line/poly/shade dengan opts {val,emit,nx,ny,jitter,seed}; RAMPS: wood woodDark plaster paper metal book1(merah) book2(emas) book3(hijau gelap) leaf sky amberLamp ivoryLit teal screen dusk mesa stone frame. props: nightWindow(p,x,y,w,h,seed) (bulan sabit+atap), shelf, books, desk(p,x,y,w,floorY), monitor, deskLamp(p,baseX,baseY)→{bulb}, mug, pothos, keyboard, floor(p,x,y,w,h,seed), rug(p,cx,cy,rx,ry), hangingLeaves. Light = {kind:"point",x,y,r,i,color} | {kind:"cone",...,angle,spread}. SpriteView: left = x*PX - anchor.x*scale (scale≠PX). finish(s,SPEC) menambah pad 1 px. Layer z: 1000 = bidang subjek; camera z mendekat (scale = z/(z-cam.z)).
- Clip id timeline: hook, konteks, pengembangan, penjelasan, payoff, outro (indeks kata di bagian atas file ini; payoff 9 = "Ig", 27 = "rugi", 35 = "efek", 44 = "Kini,"; outro 7 = "Ikuti").
- RANCANGAN KODE (ikuti, jangan desain ulang):
  * Perangkat telur digital = komponen HTML `EggDev` di Film.tsx (koordinat art px dalam Layer, ikut kamera): cangkang oval warna (pink/teal/kuning/ungu), LCD persegi #9BBC0F dengan piksel #0F380F (SVG rect dari bitmap string), 3 tombol bulat di bawah, ring gantungan di atas, rim light box-shadow keras kelipatan PX. Prop `lcd` = nama bitmap: egg, blob, blobEat, poop, sick, ghostGrave, angel, pause, sitter, heart. Komponen `Lcd` dipakai juga layar penuh di adegan C.
  * A (0–6,998) kamar malam `bedroom()`: back = dinding plaster + nightWindow + poster; mid = kasur (selimut ivoryLit/paper motif kotak) + meja samping + deskLamp; near (row 192–240) = tepi selimut/bantal terang bertekstur. Anak `kidSide` duduk di tepi kasur memegang EggDev (LCD ghostGrave), tetes air mata HTML. Label "AUDIRA" stiker di laci meja menyala pada "Ini" 5,425. Push-in ke tangan; di "piksel" 4,868 insert LCD besar layar-penuh (crossfade). Cover text 0–1,45: "AUDIRA TECH #22" + "MATI KARENA / DITELANTARKAN"; chip "30 TAHUN LALU · 23 NOV 1996" 1,5–2,0; "JUTAAN ANAK MENANGIS" 2,02–4,85.
  * B toko mainan `toyShop()`: back = dinding + pegboard deretan EggDev dicat di albedo (oval kecil warna book1/teal/book2/ivoryLit) + papan nama HTML "AUDIRA TOYS"; mid = etalase kaca + kasir; near = antrean kepala anak `headBack` CROWD_PALS (terang). Kamera pan pegboard → push-in EggDev pahlawan berayun di ring pada "gantungan" 12,416. HUD per urutan HANDOFF (NameCard berurutan, bukan bersamaan; FONT.display).
  * C layar LCD penuh (HTML): cangkang di tepi, LCD ~900×700 di y≈300–1000, 3 tombol y≈1160, tekstur cangkang di bawah caption. Urutan: menetas 20,72, tombol menyala 22,67, makan 24,31, kotoran+sapu 25,04, obat 26,86, jam "< 12 JAM" 29,1, mati 30,82 (flash), hantu+nisan 31,81, malaikat 34,36. Zoom CSS lambat + makhluk memantul (motion).
  * D kelas `classroom()`: papan tulis (teks kapur HTML, "AUDIRA" kecil di pojok) + jendela siang; mid = bangku + 3 kidBack PUPIL_PALS + EggDev di meja; near = meja depan buram + buku. Counter 40 JUTA 38,9; gelembung "BIP! BIP!" 44,38; Stamp DILARANG 47,77.
  * D2 makam senja `petCemetery()`: langit dusk dither + bukit mesa; nisan kecil + bunga; near = rumput leaf terang. EggDev besar di depan nisan: LCD ghostGrave → pause 52,98 → sitter 53,76.
  * E1 panggung `stage()`: tirai book1, podium + piala telur, spotlight cone; `person` SUIT_PAL di podium; near = kepala penonton CROWD_PALS. Chip "1997", Stamp "IG NOBEL EKONOMI" 59,09, chip "JUTAAN JAM KERJA → HEWAN VIRTUAL" 60,58.
  * E2 gudang: salin fungsi warehouse() EP06 (dari file sets.ts lama, sebelum ditimpa) — box label HTML "TELUR DIGITAL"; chip "1998 · DEMAM SURUT", Stamp "RUGI ¥6 MILIAR" 66,67 (warna merah).
  * F kantor: salin office() EP06; `person` OFFICE_PAL memegang EggDev (LCD heart), hati naik; papan tulis gambar hati+telur. Stamp "EFEK TAMAGOTCHI" 69,87 (impact, riser sebelum), chip "MANUSIA BISA SAYANG PADA MESIN" 71,43, counter "98 JUTA+ UNIT" 73,95.
  * OUT kamar pagi (bedroom set sama, lampu siang): close-up EggDev di meja (LCD blob+heart), framing beda dari hook. Chip "KAMU DULU PUNYA?" sub "CERITAKAN DI KOMENTAR" 77,25+; kartu IKUTI AUDIRA TECH 80,18–OUTRO_AT.
  * WIPES: B right, C down, D right, D2 up, E1 right, E2 left, F right, OUT down. Flash: 30,82 (mati), 59,09, 69,87.
  * Root.tsx: SLUG {Ep22: "demam-tamagotchi-1996"}, komposisi Ep22Cover/Ep22Preview/Ep22Final, import ./scenes/ep22/index.ts. Cover.tsx = BedroomShot malam + CoverText.

## UPDATE sesi 6 (2026-11-23) — sets.ts + timing.ts DITULIS (EP22)
- Backup kode EP06 lama (sets/Film/timing/Cover) di `_tools/ep06_backup/` — Film.tsx lama = referensi pola (Lit, camAt, shake, along, RoomShot, Hud per adegan, Film root). hud.tsx tetap.
- `sets.ts` EP22 DITULIS (belum di-tsc): `bedroom()` → {back,mid,near,lamp} + BED {FLOOR 152, BED_TOP 134, WIN, POSTER, STAND{x100,y120,w32}, DRAWER{x104,y129,w24,h8} (stiker AUDIRA HTML), KID{x84,y152}}; `toyShop()` + SHOP {FLOOR 160, COUNTER 124, PEG, SIGN{x16,y2,w104,h14} (HTML "AUDIRA TOYS"), HERO{x68,y66} (EggDev HTML berayun)}; `classroom()` + CLASS {FLOOR 150, DESK 146, BOARD{x4,y16,w92,h50}, WIN, PUPILS [22,66,110] (kidBack anchor y≈150, gambar SEBELUM layer mid agar meja menutup), EGG{x80,y141}}; `petCemetery()` + CEM {HORIZON 112, GRAVE{x56,y100,w26,h40}, EGG{x69,y134}, SUN{x104,y70}}; `stage()` → {back,mid,podium,near} + STG {FLOOR 150, PODIUM, SPEAKER{x100,y150} (person SUIT_PAL, gambar sebelum layer podium), TROPHY{x34,y112} (piala HTML)}; `warehouse()`/WH dan `office()`/OFF disalin persis dari EP06.
- Skala sprite yang direncanakan: kidSide PX*1.6 di BED.KID (tangan ≈ (98,126) art px → EggDev w≈10; wajah ≈ (87,106) untuk tetes air mata); kidBack PX*1.8; person PX*2 (STG) / PX*1.6 (OFF.STAND); headBack PX*2.6 di layer near (y≈215–240).
- `timing.ts` EP22 DITULIS: T (semua beat, indeks sudah diverifikasi ke timeline.json), CUT (B dua, C telurnya, D lalu, D2 ada, E1 tahun, E2 setahun, F tapi, OUT kamu), sceneAt, WIPES (8), FLASHES [mati, ig, efek]. Catatan: `T.fitur` = kata "lalu" (53,76), `T.meraih` = "penciptanya".
- BERIKUTNYA: tulis `Film.tsx` (EggDev + Lcd bitmap 32×24 + 9 adegan + HUD per RANCANGAN KODE sesi 4; chip HUD top 268, maks judul+1 chip), `Cover.tsx` (BedroomShot malam + CoverText "AUDIRA TECH #22" / "MATI KARENA / DITELANTARKAN"), `src/Root.tsx` (Ep22), lalu `npx tsc --noEmit` dan langkah "Sisa langkah" 3–7.

## UPDATE sesi 7 (2026-11-23) - Film.tsx EP22 DITULIS (belum tsc)
- `project/src/scenes/ep22/Film.tsx` EP22 lengkap: GL glyph + Lcd (SVG 32x24) + lcdFor(mode) + lcdC (timeline adegan C) + EggDev (HTML, art px) + DeviceFull (layar penuh, C dan insert hook) + BedShot(t,cam,day,kid,tears,sticker,egg) + CoverText + 9 adegan & HUD + Film. Ekspor untuk Cover: BedShot, CoverText, REST, lcdFor.
- BELUM: Cover.tsx (masih EP06: tulis ulang pakai BedShot t=1.0 cam z~60 + CoverText, pola Cover EP06), Root.tsx (masih EP06: ganti ke EP22 index, SLUG Ep22 demam-tamagotchi-1996, Ep22Cover/Ep22Preview/Ep22Final), lalu `npx tsc --noEmit` (perbaiki error tipe Film.tsx; mis. set.lamp.bulb/angle, set.podium), uji still tiap adegan.
- Konteks sesi 7 habis (±215k) tepat setelah menulis Film.tsx.

## UPDATE sesi 8 (2026-11-23) - draf LOLOS juri 4.0, render final berjalan
- Cover.tsx (BedShot t=1, cam z 60 + CoverText) + Root.tsx (Ep22Cover/Preview/Final, SLUG demam-tamagotchi-1996) DITULIS; tsc bersih.
- Film.tsx: `NearLayer` (FG dikunci ke y layar 1530, di bawah caption band) + `nearFill` (lampu pantul bawah); sets.ts: selimut lebih lebar, peti gudang & lantai kantor lebih terang.
- `style/cover-topic.png`, `public/audio/ep22/vo.words.json` (dari timeline.json), `sfx.wav` (−20 LUFS, 53 suara, timing VO; salinan `audio/sfx/sfx.wav`).
- Draf: `draft/contact-sheet.jpg` (8 frame), look.json (tanpa cap), audit:camera 5/5 (`draft/camera.json`), `draft/THEME_CHECK.md` semua ya. Skor self 4.17, juri buta 4.0 LOLOS (composition 3: F4 kelas kepala terpotong, F2 telur kecil, F6 piala kecil).
- `SOCIAL_CAPTIONS.md` DITULIS (belum divalidasi). Jadwal Senin 23 Nov 2026 21.00–22.40 WIB.
- Final: render:final perlu `--skip-channel="batch short tanpa SERIES.json; ..."` (gerbang channel). Log `F:/temp/ep22_final.log`, keluaran `project/out/ep22/FINAL_EP22.mp4`.
- SISA: QA −14 LUFS/TP<−1, metadata ffmpeg → FINAL_VIDEO.mp4, audira_verify_signature, audira_qa_video, record_score final, validator caption, NOTES.md, append_lesson (failed: composition kelas/telur kecil; fix: NearLayer FG), 3 scheduled task review-demam-tamagotchi-1996-24h/-72h/-7d (fireAt mulai upload 23 Nov 21.00 WIB), caption tampil di chat.
