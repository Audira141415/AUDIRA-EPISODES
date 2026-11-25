# UPDATE Sesi 2b (2026-11-23) — draf putaran 1 juri GAGAL, poles putaran 2 SUDAH DIKODE (belum dirender)

- Draf r1: self 4.17, juri buta 3.67 PERLU POLES (material 3, composition 3, readability 3) — tercatat di memory. Depth ceiling dinaikkan ke 5 dengan `Halo` (backlight) di adegan 2,3,5,7,10.
- Poles r2 sudah di `project/src/Film.tsx`: nametag MARK JOHNSON out 40.5 + "2–2" top 610 (tidak tabrak boards); adegan 9 stat bar top 200/380, Counter tunggal "JIM CRAIG · 36 PENYELAMATAN" top 570 (NameTag dihapus); karaoke top 1470; ArenaWorld + light pools di es, mist, goresan es, Fog di atas boards.
- `draft/THEME_CHECK.md` sudah (semua ya). Klip kamera `project/out/draft/clip.mp4` → motion 5/5. `SOCIAL_CAPTIONS.md` sudah ditulis (jadwal Rabu 2 Des 2026 19.00) — BELUM divalidasi.
- NEXT: `npx tsc --noEmit -p .` → render ulang sheet (`node scripts/stills.mjs out/draft "5s,12s,20.8s,31.7s,40.8s,53.4s,59.2s,64.5s" Ep30Preview 0.5`), salin ke `draft/contact-sheet.jpg`, cek look.json ceilings, skor self + juri buta putaran 2 (TERAKHIR; bila <3.8 kembali ke gerbang style per G16/G21). Lalu langkah 6 final + 7 delivery di bawah.

# UPDATE Sesi 2 (2026-11-23) — langkah 1–4 SELESAI

- Langkah 1: `project/src/lib/fig.tsx` + pose `skate`/`shoot`/`goalie` + prop `stick`; `project/src/lib/rink.tsx` (Arena, Rink, Boards brand AUDIRA, Bulbs/Scoreboard 5x7, Goal, Puck, Paper, Spray).
- Langkah 2: `project/src/Film.tsx` 12 adegan (potongan sesuai STORYBOARD), Karaoke dari `src/timeline.json`, AudiraOutro + AudiraSignature (outroSeconds 4.4). `Root.tsx`: `Ep30Cover`, `Ep30Preview` (1080×1920@30, render still pakai scale 0.5, withAudio), `Ep30Final` (1080×1920@60). FILM_SEC 82. `npx tsc --noEmit` bersih.
- Langkah 3: `style/cover-topic.png` dirender, `style/STYLE_DECISION.md` + `style/cover-reference.jpg` ditulis. STATUS tahap style belum di-update ke done → lakukan `update stage style done`.
- Langkah 4: `project/public/audio/sfx.wav` (−20 LUFS, 30 sounds). Payoff impact digeser ke 53.3 (gol 4–3) dengan mengedit `out/sfx-timeline.json` beats.payoff lalu `python -m sfx sfx/cues/auto.py --timeline out/sfx-timeline.json --out public/audio/sfx.wav`. JANGAN jalankan `node scripts/sfx.mjs` lagi tanpa mengulang edit itu.
- Cek still (sheet uji `project/out/t1/_sheet.jpg`, `out/t2/_sheet.jpg`): 12 adegan terbaca, audit look "no aspect capped below 4". Perbaikan sudah dilakukan: faceoff dipisah, latar gelap di kutipan, kiper adegan 7, medali.

## Lanjut dari langkah 5 (draf juri) — lihat "Sisa langkah" 5–7 di bawah.
Frame contact sheet yang disarankan: 5s, 12s, 20.8s, 31.7s, 40.8s, 53.4s, 59.2s, 64.5s (`node scripts/stills.mjs out/draft "<list>" Ep30Preview 0.5` → `out/draft/_sheet.jpg`; salin ke `draft/contact-sheet.jpg`).

# HANDOFF — EP30 Miracle on Ice 1980 (2026-11-23)

Sesi 1 pindah karena context guard (±191k). Lanjutkan dari sini; jangan ulang tahap selesai.

## Sudah selesai
- Tahap 1 konteks; tahap 2 riset `research/SOURCE_REGISTER.md` (baca "Mitos / hal yang dihindari": AS–Soviet BUKAN final; tanpa logo Olimpiade/NHL, tanpa palu-arit, tanpa wajah asli).
- Tahap 3: pengguna memilih **CHRONICLE** (acc tercatat di STATUS). `style/style-options.jpg` + kandidat ada. **BELUM**: `style/cover-topic.png` dan `style/STYLE_DECISION.md` (style CHRONICLE, alasan: siluet dokumenter terbukti di Sport Facts EP05/EP10; ditolak PANELVERSE (terlalu kartun untuk kisah sejarah), FILM16 (warna pudar kurang menghentak); tanggal 2026-11-23; `approved: yes`; baris `Style: CHRONICLE`).
- Tahap 4 docs: `docs/ART_DIRECTION.md`, `SCRIPT.md`, `STORYBOARD.md` (12 adegan), `SHOTLIST.md` (13 shot, waktu final dari VO), `ASSET_MANIFEST.md`, `script-lines.json`.
- Tahap 5 scaffold: `project/` disalin dari EP10 Jesse Owens (tanpa node_modules; modul diresolve dari `F:/AUDIRA-EPISODES/node_modules`). Lib 2D: `src/lib/fig.tsx` (siluet berpose run/walk/stand/jump/crouch/set/armsUp/wave, props contour/glow/facing/badge), `src/lib/set.tsx` (Sky, Fog, Stadium kerumunan+flash, Track, Skyline, Finish grain/vignette, MOODS, rng), `src/lib/hud.tsx` (useFonts WAJIB di root, C palet, useIn/useOut/usePop, DateStamp, Counter, Card, NameTag, Quote, Citation, Medal, BrandPlate). `src/Cover.tsx` + `src/Root.tsx` masih versi EP10 (komposisi `Ep10Cover`) → ganti.
- Tahap 6 VO: `audio/vo.wav` (dirapatkan, loudnorm −16, +3 dtk pad) = `project/public/audio/vo.wav`; `audio/timeline.json` = `project/src/timeline.json` (words[{text,start,end,scene}], scenes). Speech 77,3 dtk → film total ±82 dtk (outro card 77,6–82). Raw take `audio/work/`.

## Waktu kunci VO (detik)
1980@1.3 · Soviet empat emas@9.6 · 1964@12.0 · 26 tahun@15.4 · Amerika@16.8 · termuda@17.9 · 22 tahun@19.7 · Herb Brooks@22.7 · 68 pemain@23.7 · 13 hari@26.5 · Madison Square Garden@28.9 · 10 lawan 3@31.5 · 22 Februari@32.8 · Lake Placid@34.2 · dua kali unggul@35.6 · satu detik@37.0 · Mark Johnson@39.1 · dua-dua@40.7 · mengganti kiper@42.9 · Tretiak@44.9 · babak ketiga@45.8 · tiga-tiga@48.3 · sepuluh menit@49.2 · Eruzione@51.6 · Empat-tiga!@53.3 · 39 kali@54.9 · 16@56.9 · Jim Craig@58.1 · 36@58.9 · detik terakhir@60.4 · arena meledak@61.4 · Do you believe@63.7 · Yes!@65.0 · belum final@66.0 · Finlandia@68.8 · empat-dua@70.6 · Emas@71.3 · Sports Illustrated@72.1 · abad kedua puluh@74.3 · Audira Sport Facts@75.8 · selesai@77.15.

## Sisa langkah
1. Tambah ke `fig.tsx`: pose `skate` (condong ±35°, kaki meluncur), `shoot`, `goalie` (kuda-kuda lebar) + prop `stick` (stik dari tangan depan ke es + bilah). Buat `src/lib/rink.tsx`: arena malam + kerucut lampu sorot, rink es perspektif (garis merah/biru, lingkaran faceoff), boards dengan papan iklan "AUDIRA · SPORT FACTS" (brand in-world), papan skor bohlam oranye (digit), gawang, puck + jejak cahaya, kertas/confetti seeded, bar statistik.
2. `src/Film.tsx` multi-scene 12 adegan persis `docs/STORYBOARD.md` (potongan: 8.3, 16.7, 22.2, 26.1, 32.6, 41.3, 45.6, 53.9, 60.2, 65.6, 72.0, 77.6), kamera bergerak terus (transform), HUD callout tiap angka, Karaoke lokal dari timeline.json (lebar penuh, gap ≥0,4em, opacity kata ≥0.7, y≈1300–1500, tidak masuk 380 px bawah), `<AudiraSignature seed="miracle-on-ice-1980" handle="@AudiraSportFacts" />` lapisan terakhir, `<AudiraOutro code="SPORTFACTS" />` 77,6–82, `<Audio src={staticFile("audio/vo.wav")}/>` untuk preview. Root: `Ep30Cover`, `Ep30Preview` (540×960@30), `Ep30Final` (1080×1920@60), durasi 82 dtk.
3. Cover topik: `node ../../../node_modules/@remotion/cli/remotion-cli.js still src/index.ts Ep30Cover ../style/cover-topic.png --frame=60 --log=error` (dari `project/`), tulis STYLE_DECISION.md, update STATUS style done.
4. `node scripts/sfx.mjs` (baca `../docs/SHOTLIST.md`, `--duration=82`) → `public/audio/sfx.wav`.
5. Tahap 8: contact sheet 8 frame 540×960 (`node scripts/stills.mjs out/draft <t1,t2…> Ep30Preview` lalu montage → `draft/contact-sheet.jpg`), `node scripts/visual-audit.mjs`, `draft/THEME_CHECK.md` (G22), skor self + juri subagen buta (`audira_style_memory record_score stage draft`, style CHRONICLE, episode `short-baru-11-23-EP30`). Lolos ≥3.8 tanpa aspek <3, maks 2 putaran.
6. Tahap 9: `node scripts/render-final.mjs --comp=Ep30Final --out=../FINAL_VIDEO.mp4 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=3 --concurrency=2 --encoder=nvenc --title="Miracle on Ice 1980" --slug=miracle-on-ice-1980 --ep=EP30` (jobs 3: banyak sesi render paralel). Cek −14 LUFS & TP < −1 (loudnorm 2-pass TP −1.5 bila perlu), metadata ffmpeg (CLAUDE.md §2 poin 4), sign dengan skrip yang await signFile (bug sign-video.mjs), rename EPERM → `mv` bash, `audira_qa_video hardOnly` + cuts, record_score final.
7. Tahap 10: `SOCIAL_CAPTIONS.md` 6 platform + `## Jadwal Upload (WIB)` + `## Label Konten AI`, validator, `NOTES.md`, lesson ke memory, 3 scheduled task review (`review-miracle-on-ice-24h/-72h/-7d`), caption tampil di chat.
