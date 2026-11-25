# EP08 build plan (handover s2 → s3, 2026-11-24)

## Selesai di s2
- VO terkunci: `audio/vo.wav` (vo_tighten), `audio/timeline.json`; studio `studio/src/scenes/ep08/timeline.json` + `studio/public/audio/ep08/vo.wav` (make-timeline). Speech 77,6 dtk, film 81,6 dtk, 163 WPM.
- `studio/src/scenes/ep08/` = salinan ep01. Sudah diadaptasi:
  - `timing.ts`: beats `T.*` EP08 (indeks kata sudah dicek), `MATCH_POINT = T.duaSatu + 0.1`, `SMASH`, `CUT {B,C,C2,D,E1,E2,OUT}`, `SceneId` + `sceneAt`, `WIPES`.
  - `sets.ts`: `jakarta(monas = true)`; `jakarta(false)` = halaman upacara pagi (tiang bendera di `JKT.MONAS_X`, tanpa Monas).
  - Header komentar hud/sprites/arena diganti EP08.
- BELUM: `Film.tsx` (masih EP01, pakai T.* lama → typecheck gagal), `ArenaShot.tsx` CoverText, `sprites.ts` heroSmash (rok → perlu celana pendek untuk Owi), `Root.tsx` (belum didaftarkan), cover, docs rule 12, sfx, draf, juri.

## Rencana scene (pakai T.* di timing.ts)
| Scene | Waktu | Set | Isi | HUD callout |
|---|---|---|---|---|
| A hook | 0–11,04 | ArenaShot (cover) | Owi (heroSmash, dari belakang, **celana pendek**: tambah param `skirt=false` di heroSmash) smash; Butet di net (tambah prop `under` di ArenaShot untuk sprite sebelum hero, `side("ready","bun")` kecil di x≈96 y≈160); lawan jauh 2 (RIVAL + satu lagi x≈92). Smash di `SMASH`. | Jam digital `23:57 WIB` (T.pukul), chip `17 AGUSTUS 2016`, `3 MENIT SEBELUM 18 AGUSTUS` (T.tigaMenit), `EMAS OLIMPIADE` gold (T.emas) |
| B konteks | 11,04–23,51 | room() malam | sitter (Butet, kepala tertunduk) + Owi `side("stand","short")`; jam meja tampil `2012` | TimelinePanel 1992·1996·2000·2004·2008 kotak emas, 2012 kosong berkedip (T.sejak→T.tradisi); chip `LONDON 2012 · TANPA EMAS` (T.london); NameCard `OWI & BUTET` role `GANDA CAMPURAN` (T.owi); chip `SEMIFINAL KALAH · PERUNGGU KALAH` (T.gagal) |
| C pengembangan | 23,51–33,69 | sideCourt() | 2v2: kiri Owi (short) x≈22 + Butet (bun) x≈50, kanan 2 China RIVAL_KIT merah x≈84/112 | `RIO 2016 · 0 GIM HILANG` (T.takGim), NameCard `ZHANG NAN / ZHAO YUNLEI` role `CHINA · UNGGULAN 1 · JUARA BERTAHAN` (T.unggulan), `SEMIFINAL 2–0` (T.disingkirkan) |
| C2 | 33,69–37,73 | jakarta(false) pagi | bendera Merah Putih naik di tiang (HTML, pola PodiumScene), kerumunan | `PAGI 17 AGUSTUS 2016`, `UPACARA KEMENPORA · DOA UNTUK OWI/BUTET` (T.upacara) |
| D penjelasan | 37,73–50,86 | netClose() | 2v2 di net: dekat Butet di net + Owi belakang, jauh 2 Malaysia (MAS_KIT biru tua/kuning) | NameCard `CHAN PENG SOON / GOH LIU YING` `MALAYSIA` (T.chan), `H2H: 7–1 UNTUK INDONESIA` (T.sekali), `BUTET · DEPAN NET` (T.butet), `OWI · SERANG BELAKANG` (T.owiBelakang), LevelBanner gim 1 live 7–2 (T.tujuhDua), 11–4 (T.sebelasEmpat), 21–14 (T.empatBelas); gim 2 `12–10` Malaysia mengejar (T.sepuluh) |
| E1 payoff | 50,86–58,05 | ArenaShot kamera lain | smash match point di MATCH_POINT, flash + shake | Scoreboard `21–12` (MATCH_POINT), timer `45:00` (T.menit), Stamp `45 = 1945` (T.empatLima) |
| E2 | 58,05–66,98 | podium() | 2 standBack di podium atas (POD.X±7), bendera naik, flash fotografer | Stamp `EMAS GANDA CAMPURAN PERTAMA` (T.emasGanda), `SATU-SATUNYA EMAS INDONESIA DI RIO` (T.satuSatunya), 7 ikon medali `EMAS OLIMPIADE KE-7 · SEMUA BULU TANGKIS` (T.ketujuh), kutipan `"HADIAH HARI KEMERDEKAAN"` (T.kata) |
| OUT | 66,98–81,6 | jakarta(true) malam HUT RI, exposure rendah, glow kembang api | | dua plakat emas `1992 SUSY SUSANTI` · `2016 LILIYANA NATSIR` (T.perempuan), teaser `BERIKUTNYA · EP09 JAMAIKA BOBSLED · CALGARY 1988` (T.berikutnya) |

Fakta wajib: tidak sebut 17 kok, tidak sebut jam lokal Rio, skor 21-14 21-12. Brand AUDIRA di papan iklan (sudah ada di sets/ArenaShot).

## Root.tsx (file bersama, edit kecil)
`import * as EP08 from "./scenes/ep08/index.ts";`, `Ep08: "olahraga-EP08"` di SLUG, komposisi `Ep08Cover`, `Ep08Preview`, `Ep08Final` (pola Ep01).

## Setelah kode
`npx tsc --noEmit` → cover `style/cover-topic.png` → docs rule 12 → `npm run sfx` → contact sheet + `npm run audit:visual` → juri buta `record_score` → `draft/THEME_CHECK.md` → gerbang acc render final (lihat EP01 NOTES.md untuk command render:final + graph G18).

## Selesai di s3 (2026-11-24)
- `Film.tsx` EP08 ditulis (8 adegan A,B,C,C2,D,E1,E2,OUT sesuai tabel), `ArenaShot.tsx` (Owi celana pendek via `heroSmash(false)`, Butet di net `PARTNER`, 2 lawan Malaysia `MAS_FAR`, `MAS_KIT` diekspor, CoverText "KADO EMAS / 17 AGUSTUS"), `sprites.ts` (`heroSmash(skirt)`, `standBack(skirt)`), `Cover.tsx` header, `Root.tsx` (Ep08Cover/Ep08Preview/Ep08Final). `npx tsc --noEmit` bersih untuk ep08.
- Still per adegan dicek (`work/stills*/_sheet.jpg`); perbaikan sudah diterapkan: name card, bendera C2 terlihat naik, medal row, podium, OUT malam + kembang api.
- `style/cover-topic.png` dirender dari Ep08Cover (belum dicek visual; lihat frame 0.2s di `work/stills/_sheet.jpg` = sama).
- Catatan kecil yang bisa dipoles: B (kamar) zoom akhir terlalu dekat (Owi berdiri + Butet duduk tertutup sebagian); OUT kembang api kecil.

## Sisa untuk s4
docs rule 12 (STORYBOARD, ART_DIRECTION, ASSET_MANIFEST masih template; pakai tabel adegan di atas) → `npm run sfx` → contact sheet draf 540×960 + `npm run audit:visual` → `draft/THEME_CHECK.md` (G22) → juri buta `record_score` stage draft (maks 2 putaran) → gerbang acc render final (contact sheet, skor, durasi 81,6 dtk, cek audio G18c). Jangan render final tanpa acc.

## Selesai di s4 (2026-11-24)
- Docs rule 12 terisi (baris `Style: PIXELSTORY`): `docs/SCRIPT.md`, `docs/STORYBOARD.md` (8 baris, waktu dari CUT/T), `docs/ART_DIRECTION.md`, `docs/ASSET_MANIFEST.md`, `docs/SHOTLIST.md` (21 shot, untuk sfx).
- `studio/public/audio/ep08/vo.timing.json` (kata dari timeline.json) + `npm run sfx -- --shotlist=../EP08_OWI_BUTET_EMAS_17_AGUSTUS_2016/docs/SHOTLIST.md --timing=public/audio/ep08/vo.timing.json --out=public/audio/ep08/sfx.wav --duration=81.596` → `studio/public/audio/ep08/sfx.wav` (62 bunyi, −20 LUFS stem; render-final memakai `volume=-10dB`).
- G18c dicek dengan graph render-final: VO −16,6 LUFS vs SFX ter-duck −35,9 LUFS = 19,3 LU (lolos ≥ 12).
- Poles Film.tsx: kamar B (Owi berdiri x=82 flip scale 1,7 menghadap Butet; kamera T.owi x −8 z 70, CUT.C x −4 z 120), E2 MedalRow top 430 (tidak menutupi kepala), OUT kembang api 18 burst di sekitar Monas, lebih besar, exposure 0,85.
- Contact sheet draf: `draft/contact-sheet.jpg` (Ep08Preview 0.5, frame 9.75s,19s,28.5s,36.4s,45.6s,53.4s,62.5s,70.8s; stills di `draft/stills/`), `draft/compare.jpg`, audit:visual semua ceiling 5 (motion/readability by eye).
- `draft/THEME_CHECK.md` 8 baris, semua `ya`.
- Juri buta putaran 1: 3.5/3.5/3.5/3.5/3/3.5 = 3,42 PERLU POLES (record_score dibulatkan ke bawah ke 3 semua karena tool hanya integer).

## Sisa untuk s5 — juri putaran 2 (terakhir)
Poles saran juri (Film.tsx ep08):
1. Readability f7: deret medali 7 ikon terbaca penuh (stagger `T.ketujuh + i*0.18` → 0.1; tahun fontSize 28 → ≥ 36; pastikan lebar ≤ 1000 px), ambil frame contact sheet saat 7 sudah menyala (±63,2 s).
2. OUT chip `PEREMPUAN INDONESIA KE-2 PERAIH EMAS OLIMPIADE` patah "KE- / 2": pakai `text="PEREMPUAN KE-2"` + `sub="PERAIH EMAS OLIMPIADE INDONESIA"` atau ukuran lebih kecil.
3. Lighting E1 (match point) dan D: kolam spot keras di pemain, tribun lebih gelap (ambient turun / cone light), lampu meja B falloff hangat.
4. Depth: lapisan kabut kedua di skyline C2 dan OUT; FG blur (net/raket) di E1.
5. Composition: E1 reframe beda dari hook (mis. lebih rendah/dekat pada kok/raket dengan push-in), OUT lebih tinggi/lebar dengan kembang api di sepertiga atas.
Lalu render ulang contact sheet (8 frame), audit:visual, THEME_CHECK ulang, juri buta putaran 2 (subagent, qa/jury.md). Skor terbaik ≥ 3,5 setelah 2 putaran → langsung ke gerbang (catat "diterima <skor> setelah 2 putaran" di NOTES.md + append_lesson failed). < 3,5 → ganti style (G21).
Gerbang tahap 9: tampilkan contact sheet, skor juri, durasi 81,6 dtk, G18c 19,3 LU; tunggu acc. Command final mengikuti EP01 NOTES.md: `npm run render:final -- --comp=Ep08Final --out=out/ep08/FINAL_EP08.mp4 --vo=public/audio/ep08/vo.wav --sfx=public/audio/ep08/sfx.wav --jobs=6 --concurrency=2 --gl=vulkan --encoder=nvenc --log=error --title=… --slug=owi-butet-emas-17-agustus-2016 --ep=EP08`.
Catatan: plakat OUT "SUSY SUSANTI" (ikut VO) sedangkan EP01 memakai "Susi Susanti"; konsistensi seri perlu diputuskan.

## Hasil s5 (2026-11-24) — G21
- 5 poles juri diterapkan (medali stagger 0,1 + tahun 36 px, chip OUT dipecah, lighting B/D/E1 lebih keras, kabut C2/OUT, E1 sudut rendah + raket/net FG blur, OUT kamera lebih tinggi + kembang api besar). Contact sheet `draft/contact-sheet.jpg` (stills `draft/stills_r2`).
- Juri buta putaran 2 = 3,42 lagi (readability 2 via G22: F4 upacara tanpa orang, F8 warisan tanpa tokoh). Terbaik 3,42 < 3,5 → G21: style baru **HD2D** (`style/STYLE_DECISION.md`).

## Sisa untuk s6 — ulang tahap 4 untuk HD2D (G21), VO tetap
1. Baca `F:/AUDIRA-SKILL-MOTION/kits/hd2d/KIT.md` + `studio/src/kits/hd2d/example/Hd2dExample.tsx` (FilmScene, rig, slab sprite).
2. Ulang docs rule 12 dengan baris `Style: HD2D`: ART_DIRECTION, STORYBOARD (8 adegan, waktu tetap dari `studio/src/scenes/ep08/timing.ts` CUT/T), ASSET_MANIFEST, SHOTLIST, SCRIPT (teks sama), THEME_CHECK. Terapkan perbaikan G22 di STYLE_DECISION (upacara berorang, dua juara di OUT, E1 beda sudut, teks ≥ 40 px).
3. Bangun `studio/src/scenes/ep08hd/` (diorama R3F per adegan: arena Rio, kamar atlet, lapangan vs China, halaman upacara Kemenpora, net vs Malaysia, match point, podium, Jakarta malam HUT RI) — pakai ulang timing.ts, Captions/HUD (perbesar ≥ 40 px), sprite EP08 sebagai slab. Daftarkan Ep08HdCover/Preview/Final di Root.tsx.
4. Cover topik `style/cover-topic.png`, contact sheet 8 frame, audit:visual, THEME_CHECK, juri buta (maks 2 putaran untuk HD2D), lalu gerbang tahap 9.
- SFX `studio/public/audio/ep08/sfx.wav` + G18c 19,3 LU tetap berlaku bila timing cut tidak berubah.
- Keputusan terbuka untuk pengguna di gerbang: plakat "SUSY SUSANTI" (ikut VO) vs EP01 "Susi Susanti".
