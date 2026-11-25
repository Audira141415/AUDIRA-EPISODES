# HANDOFF — EP11 Cara Mesin ATM & Setor Tunai Mendeteksi Uang Palsu (2026-11-23)

Channel: AUDIRA Explained (@AudiraExplained). Folder episode: `F:\AUDIRA-EPISODES\AUDIRA_SHORT_BARU_2026_11_23\EP11_ATM_DETEKSI_UANG_PALSU\` (hanya ubah folder ini; sesi lain jalan di EP saudara).

## Selesai
- Tahap 1 konteks: memori GLOBAL + channel dibaca (STATUS context done).
- Tahap 2 riset: `research/SOURCE_REGISTER.md` 34 fakta + `## Catatan` (JANGAN pakai: kecepatan mesin, "belasan sensor", mesin menahan uang otomatis, warna OVMI).
- Tahap 3 gerbang style: pengguna memilih **INNERWORKS** (acc tercatat STATUS, approved true). `style/STYLE_DECISION.md`, `style/cover-reference.jpg`, `style/style-options.jpg` ada. **`style/cover-topic.png` BELUM dirender** (ambil dari frame hook film setelah kode jadi, tampilkan ke pengguna, lalu STATUS style done — tanpa acc kedua).
- Tahap 4 docs: `docs/ART_DIRECTION.md`, `docs/SCRIPT.md` (206 kata, 8 baris s1–s8), `docs/STORYBOARD.md` (8 adegan), `docs/ASSET_MANIFEST.md`. Teks ucapan VO: `audio/vo.txt` ("Audira" huruf kecil, angka ditulis kata). STATUS stage script belum di-update (tandai done).
- Tahap 5 scaffold: `project/` = salinan `F:\AUDIRA-SKILL-MOTION\starter` (tanpa public/audio,hdri,models). `project/node_modules` = junction ke `F:\AUDIRA-SKILL-MOTION\node_modules` (starter/node_modules tidak lengkap!). `SERIES.json` + `src/brand/channel.json` = EXPLAINED / @AudiraExplained. `src/Root.tsx` masih Root bawaan starter: ganti dengan Root minimal (hanya komposisi EP11) supaya bundle ringan.

## Keputusan desain (wajib)
- Engine: Remotion **2D murni** (SVG/DOM, tanpa R3F), pakai skill `audira-2d-motion` (motion vocabulary `F:/AUDIRA-2D-SKILL-MOTION/library/motion-vocabulary/`, easing expo, storyboard lint `python tools/storyboard_lint.py`). Pola kode mengikuti sesi saudara EP04 (`../EP04_PULAU_SENTINEL_UTARA/project/src/ep04/`: Film.tsx, pieces.tsx, scenes.tsx, timing.ts; desain di koordinat 1080×1920 dengan wrapper `transform: scale(width/1080)`; komposisi `Ep11Preview` 540×960@30, `Ep11Final` 1080×1920@60, `Ep11Cover` still).
- Look INNERWORKS 2D: studio krem #e8eeeb, mesin setor tunai mint #79dcb4 di plinth putih bertulisan "AUDIRA EXPLAINED" + bar oranye, casing dibelah dengan garis potong cyan #00b8d4 + ghost outline, rol kuningan #d4a537 / baja #a7b3c2 dengan gradien logam + goresan, chip callout rgba(244,247,246,0.93), judul hook plat gelap #1d2b33. Uang digambar generik (tanpa potret/replika BI). Tanpa Math.random (hash seeded).
- 8 adegan (lihat STORYBOARD): Hook mesin+2 lembar → cutaway 5 stasiun → UV (HVS menyala vs kapas kusam, peta Indonesia di Rp100.000) → magnet+IR → ketebalan (selotip) + kamera pindai → vonis DITOLAK + Bank→BI + kartu Mesuji 26 lembar Rp1,3 M → cek 3D + 10 THN Rp10 M → outro hero "4 per sejuta" + AudiraOutro 3 dtk + AudiraSignature seed "atm-uang-palsu-ep11" terakhir.
- Callout kinetik di tiap angka/fakta (HUKUM 4). Karaoke lokal lebar penuh, gap 0.4em, kata mendatang opacity 1, bounce ≤1.04, plate di atas zona 380 px bawah.

## Sisa langkah
1. STATUS: script done, setup done. Root.tsx minimal.
2. VO: `audira_generate_voiceover` scriptPath `audio/vo.txt`, lang id, output `project/public/audio/vo.wav` + `vo-words.json`; jika jeda panjang pakai tighten-pauses (maks 0,45 dtk). `npm run vo -- public/audio/vo.wav`. Salin ke `audio/`. Kunci potongan adegan ke detik kata.
3. Kode `project/src/ep11/`, typecheck, cover-topic.png (frame hook 1080×1920) → tampilkan ke pengguna.
4. `docs/SHOTLIST.md` (format EP04, `Offset: 0`, `## Audio cues`), `npm run sfx`.
5. Contact sheet 8 frame 540×960 (`node scripts/stills.mjs out/ep11-stills <detik...> Ep11Preview`) → `draft/contact-sheet.jpg`, `npm run audit:visual`, `draft/THEME_CHECK.md`, record_score self lalu juri buta (qa/jury.md) style INNERWORKS episode `short-baru-11-23-EP11`. Maks 2 putaran, lolos ≥3.8 tanpa aspek <3.
6. Final: `npm run render:final -- ... --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=4 --concurrency=2`; loudnorm −14 LUFS TP < −1; metadata ffmpeg (artist "AUDIRA (Agus Dwi R.)", comment "AUDIRA-atm-uang-palsu-EP11 | audira.my.id"); signature via skrip yang await; `audira_qa_video hardOnly`; `FINAL_VIDEO.mp4` di folder episode; record_score final.
7. Delivery: SOCIAL_CAPTIONS.md 6 platform + Jadwal Upload (WIB) + Label Konten AI → validator; SUBTITLES.srt; NOTES.md; lessons; 3 scheduled review task; caption tampil di chat.

## Catatan kecil
- File kosong `F:\x` (0 B) tak sengaja dibuat oleh perintah shell; penghapusan diblokir safety check — minta pengguna hapus manual.

## Update sesi 2 (2026-11-23) — VO + kode selesai
- VO Cartesia selesai: `project/public/audio/vo.wav` 78,76 dtk, 206 kata, `vo-words.json`, `vo.timing.json` (salinan di `audio/`). Catatan: `audira_generate_voiceover` dengan `scriptPath` vo.txt gagal ("no timed lines"); dipanggil dengan `text` (isi vo.txt digabung satu baris). Jeda maks 1,02 dtk, tidak dirapatkan.
- STATUS: script, setup, voice = done.
- Kode 2D selesai & `npx tsc --noEmit` bersih: `project/src/ep11/` (timing.ts, pieces.tsx, scenes.tsx, Film.tsx). `src/Root.tsx` = Root minimal (Ep11Preview 540×960@30, Ep11Final 1080×1920@60, Still Ep11Cover). Root starter lama disimpan di `draft/Root.starter.tsx.bak`.
- Timing adegan (detik VO): S1 0–7.8 hook · S2 7.8–14.5 cutaway+validator 5 stasiun · S3 14.5–29.9 UV (HVS menyala, kapas kusam, peta Rp100rb) · S4 29.9–39.9 magnet+IR split · S5 39.9–50.0 ketebalan (selotip) + kamera garis · S6 50.0–61.1 DITOLAK → Bank → BI → Mesuji 26 lembar Rp1,3 M · S7 61.1–72.2 dilihat/diraba/diterawang + 10 thn · S8 72.2–81.8 hero 4/1.000.000, outro 78.8–81.8. FILM_SECONDS 81.8. Callout di `timing.ts` CALLOUTS.
- Belum dirender sama sekali (belum ada still). Kode belum dicek visual: periksa contact sheet dulu, perbaiki tata letak yang tabrakan.

## Sisa langkah (mulai dari sini)
1. Render still cek cepat: `cd project && node scripts/stills.mjs out/ep11-stills 3,10,19,24,28,33,38,43,48,52,55,59,64,71,75 Ep11Preview` → gabung jadi satu sheet kecil (±1200 px) dan periksa; perbaiki kode.
2. `style/cover-topic.png`: `npx remotion still src/index.ts Ep11Cover ../style/cover-topic.png` → tampilkan ke pengguna (tanpa acc) → STATUS style note.
3. `docs/SHOTLIST.md` (format `../EP04_PULAU_SENTINEL_UTARA/docs/SHOTLIST.md`, `Offset: 0`, `## Audio cues` pakai detik timing di atas) → `npm run sfx`.
4. Draf juri, final, delivery: lihat "Sisa langkah" 5–7 di atas (tetap berlaku).

## Update sesi 3 (2026-11-23) — still diperbaiki, cover, SFX
- PENTING: `stills.mjs` membaca angka tanpa sufiks sebagai NOMOR FRAME. Pakai `3s,10s,...` (dengan `s`).
- Perbaikan kode: Svg bg jadi `<rect>` (bukan CSS background), pola grid `#ep11grid` + panel/lantai bertekstur (material ceiling 3→5), brand "AUDIRA EXPLAINED" pindah dari plinth ke plat gelap di casing mesin (tidak tabrakan caption), header SETOR TUNAI plat ink, Tag chip lebih tinggi/lebar, label LAMPU UV pudar saat zoom, S6 mesin turun 60 px + uang ditolak keluar ke kanan, purple UV penuh layar, label gedung BANK/BI teks ink, stage di-unmount di bawah outro card, uang (`Bill`) diberi `data-layout-ignore` (cetakan artwork).
- `project/scripts/lib/layout-probe.js` baris 91 ditambal: teks SVG dibaca dari `fill` (dulu `color` = hitam → kontras SVG salah ukur). Pelajaran untuk kit (append_lesson GLOBAL fix).
- Audit still 16 frame terakhir: ceilings lighting 5, material 5, depth 5, composition 5, readability 3 (sisa warn: MODUL VALIDATOR saat fade, @AudiraExplained 34px di outro bawaan). Diversity 76.9.
- `style/cover-topic.png` dirender (Ep11Cover), STATUS style done.
- `docs/SHOTLIST.md` ditulis; `npm run sfx -- --shotlist=../docs/SHOTLIST.md --style=INNERWORKS` → `project/public/audio/sfx.wav` (−26 LUFS stem, 20 sound, impact 51.8 DITOLAK).
- `npm run draft` GAGAL: `scripts/draft.mjs:97` `await sizeOf(...)` di fungsi non-async (SyntaxError). Jangan pakai draft.mjs; buat manual: `node scripts/stills.mjs ../draft/stills 3s,10s,24s,33s,43s,52s,64s,75s Ep11Preview` → salin `_sheet.jpg` ke `draft/contact-sheet.jpg` (+ versi 1200 px), look.json ke `draft/look.json`; klip kamera: `npx remotion render src/index.ts Ep11Preview ../draft/clip.mp4 --frames=1350-1890 --log=error` lalu `npm run audit:camera -- ../draft/clip.mp4 --json=../draft/camera.json`.

## Sisa langkah (mulai dari sini, sesi 4)
1. Contact sheet draf + klip kamera (perintah di atas). 2. `draft/THEME_CHECK.md` (G22, 8 frame, subjek = kata VO, semua `ya`). 3. record_score self lalu juri buta subagent (qa/jury.md; style INNERWORKS, episode `short-baru-11-23-EP11`, ceilings dari draft/look.json, camera dari camera.json). 4. Final: `npm run render:final -- ... --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=4 --concurrency=2` (TEMP/TMP/RENDER_TMPDIR=F:\temp\render), QA −14 LUFS TP<−1, metadata, signature, qa_video hardOnly, `FINAL_VIDEO.mp4`, record_score final. 5. Delivery tahap 10.

## Update akhir sesi 3 — juri putaran 1 = 3.33 (PERLU POLES)
- Draf manual selesai: `draft/contact-sheet.jpg` + `-1200.jpg` (frame 3,10,24,33,43,52,64,75 s), `draft/look.json` (ceilings 5/5/5/5/4), `draft/clip.mp4` (45–63 s) + `draft/camera.json` (skor 4), `draft/THEME_CHECK.md` (8 ya). Skor self 4.0, juri 3.33 (lighting 3, material 4, depth 3, composition 3, motion 4, readability 3) — tercatat.
- Poles putaran 2 (maks 2 putaran; terbaik ≥3.5 → langsung final, <3.5 → kembali ke gerbang style):
  1. F8 (75 s) count-up masih "2": percepat count di S8 (`n` ramp 2.5–3.1 → 0.6–1.2) supaya di 74 s+ sudah 4; atau ambil frame 76 s.
  2. Lighting/depth: shading terarah pada mesin (gradien kiri-terang→kanan-gelap overlay, highlight tepi), cast shadow miring dari mesin/modul ke lantai/dinding, latar belakang lebih bertingkat (vignette lebih kuat, layer dinding gelap jauh + kabut terang di depan). Panel datar S2/S4/S5 diberi drop shadow + gradien.
  3. Komposisi: tarik elemen terpotong ke dalam frame — S2 uang di kedua sisi, S3 panel lampu kanan, S5 rel kiri-kanan, S6 uang ditolak kanan. S1 tag ASLI? jangan menutupi mesin.
  4. Readability: micro-label (VALIDATOR · AUDIRA, UANG ASLI · KAPAS, SINYAL TINTA, DATA BI · 2025) ≥ 36 px efektif; ambil sheet frame 10 s di luar fade (pakai 9.5 s).
- Lalu: render ulang stills sheet (perintah di atas), juri buta subagent putaran 2 (qa/jury.md), record_score jury, lanjut final + delivery.
- Lesson failed sudah perlu dicatat: "INNERWORKS 2D: tanpa shading terarah & latar datar → juri lighting/depth 3".

## Update sesi 4 (2026-11-23) — poles putaran 2 selesai, juri 3.67 DITERIMA → final
- Poles: pieces.tsx (gradien bodyShade/panelShade/wallShade/floorShade/keyShade/vignette, dinding belakang berpanel + baseboard, cast shadow mesin skewX, rim light kiri), scenes.tsx (overlay keyShade+vignette di Svg, S1 uang lebih kecil/ke luar, S2 lembar pudar di tepi + tag stasiun selang-seling + label VALIDATOR 38 px + Studio di belakang, S3 drift kamera kecil, S4/S5 drop shadow panel + clip rel, S6 uang ditolak di dalam frame, S8 hitungan 4 di 0.6–1.2 s, label mikro 34–38 px). Backup lama: F:/temp/render/scenes.r1.bak.
- Sheet: frame 3,11,24,33,43,52,64,76 s (9.5 s jatuh di transisi → KASET UANG di zona UI). look.json ceilings 5/5/5/5/5, layout 0 issue. THEME_CHECK 8 ya.
- Skor self 4.0; juri buta putaran 2 = 3.67 (L3 M4 D3 C4 Mo4 R4) → batas 2 putaran, ≥3.5 → DITERIMA, langsung final. Lesson failed INNERWORKS sudah dicatat. STATUS draft done.
- `SOCIAL_CAPTIONS.md` SUDAH ditulis (6 platform, jadwal Jumat 27 Nov 2026 19.00–20.40 WIB, label AI) — belum divalidasi.

## Sisa langkah (sesi 5)
1. Final: set TEMP/TMP/RENDER_TMPDIR=F:\temp\render, `cd project && npm run render:final -- --comp=Ep11Final --out=<episode>/FINAL_VIDEO.mp4 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=4 --concurrency=2 --gl=vulkan --encoder=nvenc --title="Cara ATM Deteksi Uang Palsu" --slug=atm-uang-palsu --ep=EP11` (background). Ukur −14 LUFS & TP < −1 dBFS, ffprobe metadata, `audira_qa_video` hardOnly, record_score final (judge self, style INNERWORKS, episode short-baru-11-23-EP11). STATUS final done.
2. Delivery: `audira_validate_social_captions` (keywords: ATM, uang palsu, UV, Mesuji), `audira_generate_srt` → SUBTITLES.srt, NOTES.md (tulis "diterima 3.67 setelah 2 putaran", juri r1 3.33 / r2 3.67, lesson), append_lesson GLOBAL fix (layout-probe baca `fill` teks SVG) + GLOBAL failed (draft.mjs:97 await di fungsi non-async), 3 scheduled task review-atm-uang-palsu-24h/-72h/-7d (upload Jumat 27 Nov 2026 19.00 WIB → +24 j 28 Nov 19.00, +72 j 30 Nov 19.00, +7 h 4 Des 19.00, +07:00), caption tampil di chat, STATUS delivery done, hapus draf perantara (draft/stills, clip.mp4).
