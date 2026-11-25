# HANDOFF — EP19 Flappy Bird Dihapus Pembuatnya (AUDIRA TECH, @AudiraTECH)

Diperbarui 2026-11-23 oleh sesi kedua (context guard ±191k). Baca file ini dulu, lalu `audira_episode_status get` (episodeDir folder ini).

## Tugas
Short 2D 9:16, 1080×1920@60, channel AUDIRA TECH. Pipeline 11 tahap global (`C:\Users\ASUS\.claude\CLAUDE.md`). Engine Remotion 2D, kit PIXELSTORY (tanpa R3F). Hanya ubah folder ini (EP saudara dikerjakan sesi lain).
Ilustrasi buatan sendiri: tanpa sprite/logo/pipa hijau/tangkapan layar asli. Burung = desain pixel AUDIRA (bulat oranye-merah, sayap besar, bukan Faby). Rintangan = menara bata / tiang neon (bukan pipa hijau). Dong Nguyen = siluet + name card. Chip pojok "ILUSTRASI, BUKAN CUPLIKAN ASLI".

## Sudah selesai
- Tahap 0–3: preflight, riset `research/SOURCE_REGISTER.md` F1–F14, style PIXELSTORY approved. `style/cover-reference.jpg` sudah disalin.
- **Naskah final**: `docs/script-lines.json` (195 kata tampil / 215 diucapkan, markup `{display|spoken}`). Teks VO memakai "Audira".
- **VO TERKUNCI** (jangan generate ulang): `audio/vo.wav` (loudnorm −16, +3 s pad), `audio/timeline.json`, mentah `audio/work/vo-raw.wav` + `vo-raw-words.json`. Speech 85,47 s, film total **89,47 s**, 137 WPM. Tidak ada MISMATCH.
- `project/src/scenes/ep19/timeline.json` (format ep01: clips[id,section,words{w,s,e}], voEnd, total) + `project/public/audio/ep19/vo.wav` sudah dibuat oleh `_tools/make_timeline_ep19.py` (jalankan dari folder episode). `_tools/vo_tighten.py .` = langkah tighten.
- Seksi VO (detik): hook 0.1–6.27 · konteks 7.27–24.55 · pengembangan 25.55–41.63 · penjelasan 42.63–57.74 · payoff 58.74–77.99 · outro 78.99–85.32. Kata kunci (indeks untuk `W(id,i,expect)`):
  - hook: 3 US$50.000@1.28, 5 Lalu@3.19, 9 menghapusnya@4.32, 10 Ini@5.40
  - konteks: 1 Flappy@7.63, 4 Dong@9.54, 8 Hanoi@11.20, 13 .Gears@14.68, 14 Ia@15.85, 18 beberapa@17.95, 20 Game@19.16, 26 24@21.08, 29 lalu@23.07, 30 sepi@23.45
  - pengembangan: 0 Januari@25.55, 3 meledak@27.64, 9 nomor@30.31, 12 Amerika@30.96, 13 Tiongkok@31.34, 15 Inggris@32.26, 16 Aturannya@33.10, 18 Ketuk@34.60, 20 burung@35.47, 22 Lewati@36.34, 25 dapat@37.39, 28 Sepuluh@38.58, 30 medali@39.60, 32 Empat@40.90, 34 platinum@41.25
  - penjelasan: 0 Kepada@42.63, 1 The@42.92, 11 US$50.000@45.66, 14 Tapi@47.42, 18 8@49.31, 23 Twitter@50.78, 24 22@51.67, 32 Aku@54.77, 36 Katanya@55.97, 38 bukan@56.99
  - payoff: 0 Keesokan@58.74, 5 hilang@61.01, 7 App@61.49, 12 Kepada@63.02, 13 Forbes@63.36, 30 adiktif@69.26, 34 masalah@70.43, 35 Sementara@71.24, 37 HP@72.40, 43 eBay@74.03, 46 ditawar@74.77, 49 US$90.000@75.56, 50 sampai@76.49, 52 menurunkan@77.12
  - outro: 0 Lima@78.99, 10 Kalau@82.09, 12 berani@82.64, 13 hapus@82.95, 18 ikuti@84.58, 19 Audira@84.84

## Update sesi ketiga (2026-11-23, context guard ±196k)
- SELESAI: `style/STYLE_DECISION.md` (sudah ada, lengkap); docs rule 12: `docs/ART_DIRECTION.md`, `docs/SCRIPT.md`, `docs/STORYBOARD.md` (9 baris), `docs/SHOTLIST.md` (format parser `npm run sfx`: kolom # | Waktu | Objek | Aksi | Kamera | Teks layar | Beat, Offset 0), `docs/ASSET_MANIFEST.md`. STATUS script done, data.wordCount 195.
- SELESAI: `project/src/scenes/ep19/hud.tsx` = salinan ep01/hud.tsx (impor `./timing.ts`: CLIPS, OUTRO_AT, TOTAL, WIPES, clamp, pop, seg, Word). Belum ada timing.ts/sets/sprites/Film/Cover/index di ep19.
- Catatan API kit (sudah diperiksa): camera x/y = px layar di bidang subjek, z dolly (layer z−cam.z ≥ 24); `sprite(rows)` ASCII dari `pixel/sprite.ts` ('.' transparan) + `SpriteView{sprite,pal,anchor,x,y,scale,lights,gain}` (x,y art px; scale≠PX → posisi bebas); `Glow{x,y,r,color,intensity,squash}`; `LightShaft{x,y,angle,length,spread,color,intensity,id}`; Light `{kind:"point",x,y,r,i}` / `{kind:"cone",...,angle,spread}` + color; ramp material: wood woodDark plaster paper metal book1 book2 book3 leaf sky amberLamp ivoryLit teal screen dusk mesa stone frame; props: desk(p,x,y,w,floorY) monitor(p,x,y,w,h,standBase) deskLamp(p,baseX,baseY)→{bulb,angle} mug(p,x,y) nightWindow(p,x,y,w,h,seed) shelf books floor(p,x,y,w,h,seed) keyboard(p,x,y,w).
- Rencana kode (belum ditulis): timing.ts = salin ep01/timing.ts, ganti T (indeks kata di atas) dan CUT {B:konteks0 "Namanya", C1:peng0, C2:peng16 "Aturannya", D1:penj0, D2:penj18 "8", E1:payoff0, E2:payoff35 "Sementara", OUT:outro0}; sceneAt A,B,C1,C2,D1,D2,E1,E2,OUT. Layar game = komponen `game.tsx` GameView(w,h,cell,t): langit teal, awan pixel, menara bata (CSS repeating-linear-gradient #B4552E/#6E2A18, lampu neon di bibir celah), burung di 30% lebar mengikuti pusat celah + lonjakan ketuk; skor dioverride per adegan. Burung ASCII 16×12 (k outline #3A0A10, o #F27A2E, r #D02A30, y #FFD23F, w putih, b pupil, sayap c #FFE9C4 overlay 6×4 naik-turun). Set: deskSet (A, D1 sudut lain, OUT) HP besar x38–98 y40–152 di stand, meja y160; hanoiRoom (B, D2) coder siluet backlit jendela, laptop dari belakang berstiker AUDIRA; citySet (C1) billboard x10–125 y40–120 berlabel AUDIRA; storeSet (E1) rak aplikasi; auctionSet (E2) etalase + bantal beludru.
- Root.tsx belum ditulis ulang (masih rusak, impor ep02–05).

## Belum
1. `style/STYLE_DECISION.md` (baris `Style: PIXELSTORY`, alasan: game pixel = dunia aslinya; alternatif ditolak ARCADECRT = lebih gelap & skor juri tak stabil 3.5; PANELVERSE = komik kurang terasa game mobile; `approved: yes`, tanggal 2026-11-23) + `style/cover-topic.png` (still komposisi Ep19Cover 1080×1920).
2. Docs rule 12: `docs/ART_DIRECTION.md` → `docs/SCRIPT.md` (teks display dari script-lines.json per tahap) + `docs/STORYBOARD.md` (≥6 baris `Scene | Waktu | BG/MG/FG/HUD | Kamera | Audio`) → `docs/ASSET_MANIFEST.md`. Semua dengan baris `Style: PIXELSTORY`. STATUS: update script/voice done (data.wordCount 195).
3. Kode scene `project/src/scenes/ep19/` (salin pola ep01: timing.ts W/T/CUT/sceneAt/WIPES; hud.tsx Pop/Chip/NameCard/Stamp/Wipe/Captions bisa disalin hampir utuh; sets via `createAlbedo/painter` dari `kits/pixelstory/environment/albedo.ts`, props `desk/monitor/deskLamp/mug/nightWindow/floor/shelf/books` dari `environment/props.ts`; AlbedoView/SpriteView/PX=8 dari `pixel/views.tsx`; `finish(sprite,SPEC)`; Glow/LightShaft/Grade/Vignette/Grain/Exposure dari `lighting/overlays.tsx`; CinematicCamera/Layer z (1500 back, 1000 mid, 620 near); cameraAt/drift dari `camera/path.ts`; ease dari `core/motion.ts`; FONT.display/pixel/sans). Semua ramp kit hangat (tak ada biru): **konsep** = dunia nyata lampu hangat; layar game di dalam HP = palet teal/cyan sendiri, digambar sebagai div pixel (bukan albedo).
   Rencana set (tiap beat beda set/sudut, cut di kata VO):
   - A HOOK 0–7.27: meja malam close-up, HP pixel besar; layar: burung AUDIRA terbang di antara menara bata; counter "US$50.000 / HARI" @1.28; jari tekan tombol "HAPUS" @4.32, layar hitam; "INI AUDIRA" @5.40. Cover = frame pembuka ini.
   - B KONTEKS 7.27–25.55: kamar kecil Hanoi malam (jendela atap & kabel), siluet programmer di laptop; judul FLAPPY BIRD @7.63; NameCard DONG NGUYEN · PROGRAMMER, HANOI @9.54; chip ".GEARS · STUDIO KECIL" @14.68; kalender "BEBERAPA HARI" @17.95; chip "RILIS 24 MEI 2013 · iOS" @21.08; grafik datar "SEPI" @23.45.
   - C1 PENGEMBANGAN 25.55–33.10: billboard/papan tangga lagu raksasa di kota: "JANUARI 2014" + grafik meledak @27.64, kartu "#1 APP GRATIS" @30.31 + label AS / TIONGKOK / INGGRIS bergiliran di kata masing-masing.
   - C2 33.10–42.63: dunia game layar penuh (palet teal): ketuk → naik @34.60, celah +1 @37.39, medali 10 perunggu @38.58 … 40 platinum @40.90 (counter selesai di kata angka).
   - D1 PENJELASAN 42.63–49.31: hujan koin ke toples di meja: "±US$50.000/HARI" @45.66 + sub "PENGAKUANNYA KE THE VERGE"; @47.42 notifikasi menumpuk.
   - D2 49.31–58.74: laptop close-up: kartu tweet buatan sendiri (bukan UI Twitter asli) "8 FEB 2014" + kutipan "22 jam lagi…" @51.67, countdown 22:00:00 berjalan; chip "BUKAN SOAL HUKUM" @56.99.
   - E1 PAYOFF 58.74–71.24: rak toko aplikasi kosong / HP "TIDAK DITEMUKAN" @61.01; kartu kutipan FORBES @63.36, "PRODUK YANG ADIKTIF" @69.26, "SUDAH JADI MASALAH" @70.43.
   - E2 71.24–78.99: etalase lelang HP; bid counter naik ke ">US$90.000" @75.56 (tawaran, bukan terjual); stamp "IKLAN DITURUNKAN" @77.12.
   - OUT 78.99–89.47: kembali ke meja, HP gelap, burung tidur; "KAMU BERANI HAPUS?" @82.95, "IKUTI AUDIRA TECH" @84.58; AudiraOutro 3,8 s terakhir (Root).
   Brand di adegan: tulisan AUDIRA di stiker laptop / billboard.
4. `project/src/Root.tsx`: tulis ulang hanya Ep19 (Cover 30f@30, Preview, Final) dengan `signed()` dan SLUG `{Ep19: "flappy-bird-EP19"}`; hapus impor ep01–05 (folder ep02–05 tidak ada → Root saat ini rusak). `ep19/index.ts` seperti ep01/index.ts.
5. SFX: `npm run sfx` (baca scripts/sfx.mjs untuk format input SHOTLIST) → `public/audio/ep19/sfx.wav`.
6. Draft: contact sheet 6–8 frame (≥0,3 s dari cut) → `draft/contact-sheet.jpg`, `npm run audit:visual`, `draft/THEME_CHECK.md`, juri buta subagent → `record_score` (judge jury, stage draft, episode `short-baru-11-23-EP19`, style PIXELSTORY). ≥3.8, tidak ada aspek <3, maks 2 putaran.
7. Final: `npm run render:final -- --comp=Ep19Final --out=out/ep19/FINAL_EP19.mp4 --vo=public/audio/ep19/vo.wav --sfx=public/audio/ep19/sfx.wav --jobs=6 --concurrency=2 --gl=vulkan --encoder=nvenc --log=error --title="Flappy Bird Dihapus Pembuatnya" --slug=flappy-bird-dihapus --ep=EP19` (pakai --jobs=4 bila sesi lain render; cek GPU_LOCK.md di side-session-notes). True peak ≤ −1,5 dBTP. Metadata ffmpeg (CLAUDE.md §2.4), signature dengan skrip yang await, `audira_qa_video` hardOnly, salin ke `FINAL_VIDEO.mp4`, record_score final.
8. `SUBTITLES.srt` dari audio/timeline.json; `SOCIAL_CAPTIONS.md` 6 platform + `## Jadwal Upload (WIB)` + `## Label Konten AI`; validator expectedKeywords ["Flappy Bird","Dong Nguyen"]. NOTES.md, append_lesson, 3 scheduled task review (+24h/+72h/+7d, taskId review-flappy-bird-dihapus-24h/-72h/-7d). Caption tampil di chat.

## Pelajaran wajib
- PIXELSTORY: beda set/sudut kamera tiap beat; lantai bertekstur + dither; maks judul + 1 chip per frame; Stamp ≤ 860 px tanpa rotasi; chip seri ≥ 250 px dari atas; frame contact sheet ≥ 0,3 s dari cut; isi bawah set close-up; chip panjang pakai `sub` 2 baris; counter selesai di kata angka VO; subjek di atas baris art 160 (caption band 1290–1540).
- GLOBAL: true peak final ≤ −1,5 dBTP; sign-video tidak await → tanda tangani dengan skrip yang await; rename EPERM → mv di bash; qa_video --hardOnly dengan --allow untuk flash sengaja; SUBTITLES.srt dari timeline.json.
- `audira_generate_voiceover` dengan scriptPath .txt gagal ("no timed lines") → pakai param `text`.
- Heredoc panjang lewat Bash gagal (wrapper rtk) → tulis file dengan Write.

## Update sesi kelima (2026-11-23, s5, context guard ±244k)
- SELESAI DITULIS (belum di-tsc, belum dirender): `project/src/scenes/ep19/` timing.ts (T/CUT/sceneAt/WIPES dari timeline.json), game.tsx (Pix SVG, Bird orisinal oranye-merah + sayap krem, GameView menara bata + bibir neon, langit teal), sets.ts (deskSet A/D1/OUT, roomSet B/D2, citySet C1, storeSet E1, auctionSet E2), sprites.ts (coderBack siluet dari belakang), Film.tsx (9 adegan + HUD per adegan + CoverText + CoverFrame), Cover.tsx (CoverFrame t=0.5), index.ts. `project/src/Root.tsx` ditulis ulang: hanya Ep19Cover/Ep19Preview/Ep19Final (Root lama di `_tools/Root.tsx.bak-olahraga`).
- `public/audio/ep19/` masih KOSONG: salin `audio/vo.wav` ke `project/public/audio/ep19/vo.wav` sebelum sfx/render.
- Sesi lama `local_c54366cd-…` belum terarsip (auto mode menolak archive_session) — pengguna arsipkan manual.
- BERIKUTNYA: `npx tsc --noEmit` di project → perbaiki error → `npm run cover` / still Ep19Cover → `style/cover-topic.png` → SHOTLIST cek + `npm run sfx` → contact sheet (frame ≥0,3 s dari cut: mis. 0.5, 12, 29, 38, 45, 53, 66, 76, 84 s) + `npm run audit:visual` + `draft/THEME_CHECK.md` → juri → final → delivery (langkah 5–8 bagian "Belum" di atas).
