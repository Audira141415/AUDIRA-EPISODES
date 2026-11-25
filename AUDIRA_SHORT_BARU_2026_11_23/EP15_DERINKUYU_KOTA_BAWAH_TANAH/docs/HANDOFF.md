# HANDOFF — EP15 Derinkuyu, Kota Bawah Tanah (2026-11-23)

Channel: AUDIRA Fakta Dunia (@AudiraFaktaDunia). Hanya ubah folder episode ini (sesi lain jalan di folder EP saudara).
Episode memory label: `short-baru-11-23-EP15`. Style: **INNERWORKS** (acc pengguna tercatat di STATUS.json). Engine: Remotion **2D murni** (SVG/DOM, tanpa R3F). Skill wajib: `audira-2d-motion` (`F:\AUDIRA-2D-SKILL-MOTION\SKILL.md`: motion vocabulary, easing, storyboard lint `python tools/storyboard_lint.py`).

## Selesai
- STATUS.json init; tahap context + research done; style approved (cover-topic belum).
- Riset: `research/SOURCE_REGISTER.md` (25 fakta, 12 sumber + "Rekomendasi angka"). Hindari "18 tingkat", "9 km Kaymaklı", suhu °C, kisah ayam.
- `style/cover-reference.jpg` (cover INNERWORKS). **`style/STYLE_DECISION.md` BELUM ditulis** (isi: style INNERWORKS, alasan potongan melintang bumi, alternatif ditolak PAPERWORLD & HISTORYMAP, tanggal 2026-11-23, approved: yes (jawaban "INNERWORKS (Recommended)"), baris `engine: remotion 2D`).
- `docs/SCRIPT.md` (8 baris s1–s8, 219 kata ucapan). Teks VO persis: lihat SCRIPT.md (+ kalimat "Padahal, di seluruh Kapadokia masih ada ratusan kota bawah tanah lainnya." sebelum CTA).
- **VO TERKUNCI**: `project/public/audio/vo.wav` (84.75 dtk, Cartesia voice default, speed 0.94) + `vo-words.json` (219 kata, {id,text,start,end}); salinan di `audio/`. Belum `npm run vo`.
- `project/` = salinan `F:\AUDIRA-SKILL-MOTION\starter` (tanpa models/hdri), `node_modules` junction ke starter. `SERIES.json` + `src/brand/channel.json` sudah FAKTADUNIA.

## Waktu kalimat (detik VO, dari vo-words.json)
s1 0.22–7.9 · s2 ≈8.4–18.5 · s3 ≈19.0–28.2 · s4 ≈28.7–37.7 · s5 ≈38.2–46.4 · s6 ≈46.9–57.1 · s7 ≈57.7–69.7 (pertanyaan "bernapas?" selesai 59.95) · s8 ≈70.2–75.6 · "Padahal…Kapadokia" ≈76.1–80.2 · CTA ≈80.8–84.3. Film = 84.75 + outro card 3 dtk ≈ 88.0 dtk (outro mulai ±85.0). Ambil detik pasti dari vo-words.json (cari kata).

## Rencana visual (INNERWORKS 2D: studio terang #e8eeeb, potongan melintang tuf hangat #e9c9a0/#d9ad7c/#c48d5e berstrata, garis section cyan #00b8d4 + ghost outline cyan, aksen oranye #ff7a3d, chip rgba(244,247,246,.93) teks ink #1d2b33, leader line cyan; font Space Grotesk label, Anton angka)
Satu "dunia" potongan melintang vertikal (desain koordinat 1080×1920, kamera = translateY/scale kontinu menuruni tanah) + adegan pendukung:
- S1 Hook: rumah batu Kapadokia dipotong melintang, palu menjebol dinding basement, retak → lorong gelap turun; kamera push masuk. Callout "1963".
- S2 Konteks: peta Turki → pin Kapadokia → tarik keluar ke potongan melintang penuh, penggaris kedalaman 0→85 m, ghost gedung 28 lantai di samping. "DERINKUYU · KAPADOKIA", "±85 M", "≈ GEDUNG 28 LANTAI", "20.000 ORANG".
- S3 Tuf: gunung berapi meletus, lapisan abu menumpuk lalu memadat jadi strata tuf, pahat memahat. "ABU VULKANIK → BATU TUF".
- S4 Sejarah: pita timeline Frigia (±2.700 th lalu) → Bizantium, galian tumbuh tingkat demi tingkat. "FRIGIA · ABAD 8–7 SM", "ERA BIZANTIUM".
- S5 Isi kota: kamera turun melewati ruang: kandang kambing, dapur tandır (api), perasan anggur, gudang guci, sumur, gereja salib di dasar; label per ruang.
- S6 Pintu: close-up pintu batu bulat menggelinding menutup lorong, "±500 KG", panah "HANYA DARI DALAM", siluet membungkuk di lorong sempit.
- S7 Payoff: zoom-out penuh, poros udara + panah aliran cyan turun ke dasar, ikon orang menyala di semua tingkat, counter 20.000; sumur tak tembus permukaan + racun ditolak (X merah). ">50 LUBANG UDARA", "SUMUR 55 M". Riser → impact di "musuh".
- S8 Outro: kota permukaan senja emas, "1923", "BARU 10% DIBUKA", peta Kapadokia dengan banyak titik kota lain ("RATUSAN KOTA"), papan tuf ukir "AUDIRA · FAKTA DUNIA" di pintu masuk. Lalu `<AudiraOutro seconds={3}>` + `<AudiraSignature seed="derinkuyu-ep15">` lapisan terakhir.
Pola kode: tiru `F:\AUDIRA-EPISODES\AUDIRA_SHORT_BARU_2026_11_23\EP04_PULAU_SENTINEL_UTARA\project\src\ep04\` (timing.ts SCENES/CALLOUTS, scenes.tsx SCENE_MAP, Film.tsx dengan Karaoke lokal lebar penuh gap 0.4em opacity 1 bounce ≤1.04 di atas zona 380 px bawah, wrapper scale(width/1080), Cover still). Tulis di `project/src/ep15/`, daftarkan `Ep15Preview` (540×960@30), `Ep15Final` (1080×1920@60), `Ep15Cover` (Still) di `src/Root.tsx`. Tanpa Math.random.

## Sisa langkah
1. `style/STYLE_DECISION.md`; docs `ART_DIRECTION.md`, `STORYBOARD.md` (tabel ≥6 baris Scene|Waktu|BG/MG/FG/HUD|Kamera|Audio), `ASSET_MANIFEST.md` — semua dengan baris `Style: INNERWORKS`. STATUS script done (data wordCount 219).
2. Kode `src/ep15/`, `npm run typecheck`. Render cover `npx remotion still src/index.ts Ep15Cover ../style/cover-topic.png` → tampilkan ke pengguna, STATUS style done.
3. `npm run vo -- public/audio/vo.wav`; `docs/SHOTLIST.md` (format: `F:\AUDIRA-EPISODES\FAKTADUNIA\AUDIRA_SEJARAH_NEGARA_2026\EP68_SEJARAH_PERADABAN_MANUSIA\docs\SHOTLIST.md`) → `npm run sfx`.
4. Draf: `node scripts/stills.mjs out/ep15-stills <detik,…> Ep15Preview` → contact sheet 540×960 → `draft/contact-sheet.jpg`, `npm run audit:visual`, `draft/THEME_CHECK.md` (G22), record_score self lalu juri buta subagent (qa/jury.md), style INNERWORKS, episode `short-baru-11-23-EP15`. LOLOS ≥3.8 tanpa aspek <3, maks 2 putaran.
5. Final: `npm run render:final -- ... --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=4 --concurrency=2` (sesi lain juga render). Loudnorm −14 LUFS TP<−1, metadata ffmpeg (artist "AUDIRA (Agus Dwi R.)", comment "AUDIRA-derinkuyu-EP15 | audira.my.id"), signature via skrip yang await signFile (bug sign-video.mjs), `audira_qa_video hardOnly`, `FINAL_VIDEO.mp4` di folder episode, record_score final.
6. Delivery: `SOCIAL_CAPTIONS.md` 6 platform + `## Jadwal Upload (WIB)` + `## Label Konten AI` → `audira_validate_social_captions`, `SUBTITLES.srt`, `NOTES.md`, append_lesson INNERWORKS, 3 scheduled task review (+24j/+72j/+7h, taskId review-derinkuyu-24h/-72h/-7d), caption tampil di chat.

## UPDATE 2026-11-23 (sesi lanjutan #2, berhenti karena context guard)
Selesai di sesi ini:
- `style/STYLE_DECISION.md`, `docs/ART_DIRECTION.md`, `docs/STORYBOARD.md` (9 scene, tabel lengkap), `docs/ASSET_MANIFEST.md` — semua baris `Style: INNERWORKS`. STATUS script done (wordCount 219).
- Kode `project/src/ep15/`: `timing.ts` (9 SCENES S1–S9, film 88.0 dtk, outro 85.0, CALLOUTS), `pieces.tsx` (Slab cutaway tuf, Cavity, Lamp, Person, Goat, Chimney, Tag, Flow, StoneDoor, peta Turki), `city.tsx` (City 8 lantai 960×930 + fx people/air/airLit/well/tenPct/levels), `scenes.tsx` (S1 rumah 1963 → S9 peta 170 titik + papan "AUDIRA · FAKTA DUNIA"), `Film.tsx` (Ep15Film, Ep15Stage, Ep15Cover t=64.2, Karaoke lokal, callout INNERWORKS). Terdaftar di `src/Root.tsx`: Ep15Preview, Ep15Final, Ep15Cover. `npx tsc --noEmit` bersih untuk ep15.
- BELUM ada render apa pun dari kode ini (belum dicek visual!).

Sisa (lanjut dari sini):
1. Render cover: `cd project && npx remotion still src/index.ts Ep15Cover ../style/cover-topic.png` → cek visual, perbaiki layout bila ada yang aneh (kode belum pernah dilihat), tampilkan ke pengguna, STATUS style done.
2. Stills cepat tiap scene (Ep15Preview: 2,4,6,8,10,14,17,20,24,27,32,37,40,42,44,46,50,55,59,63,67,69.5,73,75,79,83) → contact sheet kecil, poles bug visual.
3. `npm run vo -- public/audio/vo.wav`; `docs/SHOTLIST.md` (format EP68 Sejarah Negara) dari STORYBOARD kolom Audio → `npm run sfx`.
4. Draf contact sheet + audit:visual + THEME_CHECK + juri self & buta → final (sesuai langkah 4–6 di atas).
