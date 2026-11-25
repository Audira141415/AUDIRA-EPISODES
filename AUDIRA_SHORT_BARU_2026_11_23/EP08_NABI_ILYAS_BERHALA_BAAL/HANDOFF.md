# UPDATE 2026-11-23 (sesi ke-6, MANUSCRIPT) — BACA INI DULU

**SESI KE-6 AKHIR: draft putaran 2 selesai, juri 3.17 (terbaik 3.33). Sisa no.1–2 SELESAI. JANGAN poles lagi, JANGAN ganti style. Opsional cepat sebelum final (bukan poles juri, perbaikan QA): chip "SOSOK NABI TIDAK DIGAMBARKAN" top 176→196 (safe top 180) dan kartu "Allah yang MENCIPTA" S5c tidak terpotong kanan (left 580 w460 → pastikan di dalam 1080, kecilkan Big 68→60). Lalu langsung no.3 final + no.4 delivery.**

## Selesai di sesi ke-6
- Restyle MANUSCRIPT lengkap; tsc bersih. `npm run sfx` ulang. `style/cover-topic.png` dirender ulang (IlyasFinal frame 600, MANUSCRIPT; lama di `style/cover-topic.paperworld2.png`).
- Draft MANUSCRIPT putaran 1: `npm run draft -- IlyasPreview` → ceilings semua 5, camera 5. `draft/THEME_CHECK.md` diperbarui ke MANUSCRIPT (8× ya).
- Skor: self 4.17; **juri buta putaran 1 = 3.33** (lighting/material/depth/composition/readability 3, motion 5) — tercatat di memori. Kelemahan: miniatur datar tanpa falloff lilin, tanpa tekstur/emas, patung Ba'l terbaca balok, S2 bawah kosong, S8 penuh, label ikon S4 kecil.
- Poles putaran 2 SUDAH diterapkan di Ilyas.tsx (backup sebelum poles: `project/out/Ilyas.ms-r1.bak.tsx`): komponen `MiniLight` (hotspot lilin + kolam bayangan + tekstur cat + tepi daun emas di jendela miniatur), defs `dof`/`haze`/`hazeN`/`bronzeHi`, Idol baru (patung berdiri bertanduk + gada, wajah polos), S4 ulang tata letak (Idol y1430 s0.86, langit goldLeaf, ikon label 56px), S5c Idol y1420 s0.68, S2 lemari walnut berpanel daun emas (konten geser +250), DOF+haze di S3/S5/S6/S8, S7 subline 54px, S8 lampu minyak di batu + matahari lebih rendah + kamera k2 dikurangi. Still uji: `project/out/r2/sheet.jpg` (S2 13.1s, S8 65.6s?, S8 77s).

## Sisa (urut)
1. Lihat `project/out/r2/sheet.jpg` cepat; bila S8 OK → `npm run draft -- IlyasPreview` (background), lalu juri buta putaran 2 (subagent, qa/jury.md, cover `F:/AUDIRA-SKILL-MOTION/references/quality-bar/manuscript.png`, `draft/jury_input.json`), record_score jury (style MANUSCRIPT, episode `short-baru-11-23-EP08`).
2. Keputusan pengguna: JANGAN ganti style. Putaran 2 juri <3.8 → catat skor di NOTES.md + append_lesson failed, langsung final.
3. Final: `npm run render:final -- --comp=IlyasFinal --out=../FINAL_VIDEO.mp4 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=4 --concurrency=2 --encoder=nvenc --title="Nabi Ilyas dan Berhala Ba'l" --slug=ep08-nabi-ilyas --ep=EP08` (background; `--skip-channel` bila SERIES gagal). G18 graph di render-final.mjs sudah benar (stem −26 → −4dB, ratio 8). Ukur −14 LUFS, TP < −1. Metadata ffprobe. record_score final.
4. Delivery: SOCIAL_CAPTIONS.md ganti "Style: PAPERWORLD" → MANUSCRIPT, validator, NOTES.md, lesson, 3 scheduled task review (+24h/+72h/+7d dari slot pertama Jadwal Upload), status review.

---

# UPDATE 2026-11-23 (sesi ke-5, MANUSCRIPT) — BACA INI DULU

## Selesai di sesi ke-5
- G21 docs: `docs/ART_DIRECTION.md` (ditulis ulang untuk MANUSCRIPT: meja walnut, lilin key light, folio vellum hero, miniatur bertepi tinta, langit daun emas, perkakas meja per babak), `docs/STORYBOARD.md` (ditulis ulang), `docs/SCRIPT.md`, `docs/ASSET_MANIFEST.md`, `SHOTLIST.md` → baris `Style: MANUSCRIPT`. VO/timing T tidak berubah.
- Backup PAPERWORLD: `project/out/Ilyas.paperworld.bak.tsx`.
- `project/src/episode/Ilyas.tsx` sebagian direstyle (tsc bersih untuk Ilyas.tsx):
  - Palet `C` diganti hangat (tambahan key: goldHi, ink, rubric, oxblood, walnut, vellum, olive, neutral); semua hex ungu/biru di adegan dipetakan ke umber/amber.
  - Filter `pp`/`ppS` = outline tinta gelap + bayangan; defs `goldG` + pattern `goldLeaf` (belum dipakai).
  - Komponen baru (sumber: `project/out/ms_block.tsx`): `WIN`/`PAGE`, `DESK` per babak, `Candle`, `Books`, `Desk`, `Folio`, `FolioFrame`, `DeskFG`, `CandleKey`. KeyLight/ForeFrame lama dihapus.
  - `Svg` sekarang merender miniatur di jendela folio (x92 y238 896×1062, viewBox `0 520 1080 1272`).
  - Director: Desk → Folio → S → FolioFrame → DeskFG → CandleKey → Grain.
- BELUM dirender sama sekali setelah restyle.

## Sisa (urut)
1. Restyle lanjutan Ilyas.tsx:
   - `Card`: light = vellum `#F3E6C6` + border emas `#D9A441` + teks tinta; dark = kulit oxblood `rgba(74,26,16,0.95)` + huruf emas `C.goldHi` bertepi tinta (textShadow gelap). Ganti `c={C.cream}` pada `<Big>` kartu gelap → `c={C.goldHi}`. Plat caption: border 2px emas.
   - Hapus `Lantern` di S8 dan S9 (ganti glow `lampGlow` kecil / tanpa prop); S3 hapus cakram matahari, langit kota pakai `fill="url(#goldLeaf)"` (rect di dalam svg); S8 langit fajar pakai goldLeaf.
   - Label kecil → ≥ 40 px: S3 peta "LAUT TENGAH" (30), "U" (28); S4 label ikon doa/harapan/takut (30); S2 stempel "RASUL" (30, lebarkan kotak).
   - S4 `Idol` s 1.2 → ±1.35 (hero ≥ 50% lebar); cek tidak terpotong.
2. `npm run stills -- out/stills 2s,9s,15s,21s,25s,29s,35s,41s,45s,51s,57s,64s,70s,76s,82s,86s IlyasPreview` (dari project/), cek contact sheet kecil, poles (caption tidak menutup subjek, bawah tidak kosong, tak ada biru/ungu).
3. Cover topik baru `style/cover-topic.png` (still 1080×1920 IlyasFinal frame judul ±9 dtk), tampilkan ke pengguna. `npm run sfx` (shotlist teks berubah).
4. `npm run draft -- IlyasPreview`, perbarui `draft/THEME_CHECK.md`, record_score self lalu juri buta (style MANUSCRIPT, episode `short-baru-11-23-EP08`, cover `F:/AUDIRA-SKILL-MOTION/references/quality-bar/manuscript.png`). Maks 2 putaran.
5–6. Final + QA + delivery: lihat brief / sesi ke-4 di bawah (ganti "Style: PAPERWORLD" → MANUSCRIPT di SOCIAL_CAPTIONS.md).

---

# UPDATE 2026-11-23 (sesi ke-4) — BACA INI DULU

## Status: PAPERWORLD GAGAL 2 putaran juri → PENGGUNA MEMILIH **MANUSCRIPT** (2026-11-23, "1 MANUSCRIPT"). STYLE_DECISION.md + STATUS sudah diperbarui (approved). Lanjut dari "Sisa" no.2.
- Juri buta draf: putaran 1 = 3.17, putaran 2 = 3.67 (lemah lighting/depth/composition = 3). Tercatat di memori + lesson failed.
- Poles putaran 2 (masih di Ilyas.tsx; backup sebelum poles `project/out/Ilyas.v2.bak.tsx`, outro `project/out/AudiraOutro.bak.tsx`): KeyLight overlay, filter pp 2 lapis, ForeFrame FG blur, mushaf Al-An'am S2, lentera S8 y=1120, "?" #8A3A1C, handle outro 36px.
- Sudah jadi & tetap dipakai: `SOCIAL_CAPTIONS.md` (validator OK; GANTI baris "Style: PAPERWORLD" → MANUSCRIPT), `SUBTITLES.srt`, `draft/THEME_CHECK.md`, VO terkunci.
- Opsi style baru ditawarkan ke pengguna: `style/style-options-r2.jpg` → 1 MANUSCRIPT (utama; gold juri final 4.67 sejarah-islam-EP02, mushaf/lilin/tinta emas cocok kisah Qur'ani), 2 STORYBOOK (unggulan, ilustrasi buku cerita), 3 CHRONICLE (unggulan, dokumenter sejarah). ISLAMICDOCUMENTARY dihindari (gagal 3.33 di EP07 kisah nabi 2D). Fallback tool menyarankan SULAM/BATIK/UKIRFORGE (kurang cocok).

## Sisa (setelah pengguna memilih)
1. Update `style/STYLE_DECISION.md` (PAPERWORLD ditolak juri, style baru approved), `audira_episode_status` update style approved (hanya dari jawaban pengguna).
2. G21: ulang tahap 4 untuk style baru: docs (ART_DIRECTION, SCRIPT, STORYBOARD, ASSET_MANIFEST) wajib baris `Style: <ID>`; VO TETAP (jangan generate ulang), timing T sama.
3. Restyle `project/src/episode/Ilyas.tsx` (adegan konkret per frasa VO, 4+ plane, cahaya per objek, hindari bawah frame kosong & prop berulang), cover topik baru, draft + juri (maks 2 putaran), lalu final/QA/delivery (lihat sisa no.5–6 di bawah).

---

# UPDATE 2026-11-23 (sesi ke-3) — BACA INI DULU

## Selesai di sesi ke-3
- `npx tsc --noEmit`: Ilyas.tsx bersih (error lain hanya di starter core/qa & scenes/news, abaikan).
- Ilyas.tsx dipoles (backup v1: `project/out/Ilyas.v1.bak.tsx`): kicker 36px warna #8A3A1C, Body min 36, chip "SOSOK NABI TIDAK DIGAMBARKAN" 36px, tekstur kertas (mottle/fiber/pulp + layer screen untuk malam) dipindah ke DALAM wrapper adegan, dolly kontinu per adegan di director (`dz = 1 + 0.013*lt`, drift x 26px, transformOrigin 540px 260px), S2 kamera + rak plakat dinaikkan + plakat bayangan putus-putus, S3/S4 folk/tugu naik di atas caption, S5c label di pelat kertas, S7 stempel rotate -4, S8 ayat 37:130 di pelat krem, hook kartu "? SURAH" -> "2 SURAH" muncul 0.25 dtk.
- `project/scripts/draft.mjs` (salinan lokal) diperbaiki: `hfStills` jadi async (bug await di starter; starter bersama TIDAK disentuh).
- Stills `project/out/stills` audit: semua ceiling ≥4. Cover topik `style/cover-topic.png` (frame 640 IlyasFinal, judul) sudah dirender & ditampilkan ke pengguna.
- `npm run sfx` selesai → `project/public/audio/sfx.wav` (34 suara).
- Draft `npm run draft -- IlyasPreview` → `draft/DRAFT_SHEET.jpg`, `draft/DRAFT_REPORT.json`, `draft/jury_input.json`: ceilings lighting5 material5 depth5 composition5 readability4, camera 5/5 (dengan zoom 0.013). Bila ERR_NO_BUFFER_SPACE saat render: ulangi saja.

## Sisa (urut)
1. Jalankan ulang `npm run draft -- IlyasPreview` (zoom dikembalikan ke 0.013), tulis `draft/THEME_CHECK.md` (tiap frame: subjek layar = kata VO, semua `ya`).
2. `record_score` self (stage draft, style PAPERWORLD, episode `short-baru-11-23-EP08`, ceilings+camera dari draft/DRAFT_REPORT.json), lalu juri buta subagent dengan `project/qa/jury.md` + `draft/jury_input.json` + `draft/DRAFT_SHEET.jpg` + cover `F:/AUDIRA-SKILL-MOTION/references/quality-bar/paperworld.jpg` → record_score judge jury. Lolos ≥3.8, tak ada aspek <3. Update STATUS (draft done).
3. Final + QA + delivery: lihat "Sisa langkah" no. 5–6 di bawah.

---

# UPDATE 2026-11-23 (sesi ke-2, konteks penuh) — BACA INI DULU

## Selesai di sesi ke-2
- `docs/SCRIPT.md`, `docs/STORYBOARD.md`, `docs/ASSET_MANIFEST.md`, `SHOTLIST.md` (16 shot, lint 0 red). `docs/VOICEOVER.md` = vo-script bertimestamp (format untuk tool VO).
- VO Cartesia speed 1.12 → `project/public/audio/vo.wav` (84.45 dtk) + `vo-words.json` (181 kata) + `vo.timing.json` (`npm run vo` sudah). Film = 87.5 dtk (outro 84.5–87.5). JANGAN generate VO ulang.
- `project/SERIES.json` diganti ke QISSAH (@AUDIRAQISSAH); `npm run channel` sudah → src/brand/channel.json benar.
- `project/src/episode/Ilyas.tsx` DITULIS (10 adegan S1..S9 SVG kertas, Card HUD, caption karaoke dari vo-words.json, chip adab, AudiraSignature seed ep08-nabi-ilyas, AudiraOutro). Komposisi `IlyasPreview` / `IlyasFinal` terdaftar di `project/src/Root.tsx`.
- **BELUM PERNAH DIRENDER / BELUM DITYPECHECK.** Langkah pertama: `npx tsc --noEmit` (atau render 1 still) dan perbaiki error.

## Sisa (urut)
1. Typecheck + `npm run stills -- <outdir> 2s,9s,15s,21s,25s,29s,35s,41s,45s,51s,57s,64s,70s,76s,82s,86s IlyasPreview` (outdir di F:, mis. `out/stills`), cek contact sheet, poles. Pastikan font Arab (Amiri) tersambung, kartu tidak tumpang tindih, caption terbaca.
2. Cover topik: still 1080×1920 dari IlyasFinal (frame ±69.5s payoff atau 9s judul) → `style/cover-topic.png`, tampilkan.
3. `npm run sfx` (dari project/).
4. Draft contact sheet (`npm run draft -- IlyasPreview`), `npm run audit:visual`, `draft/THEME_CHECK.md`, skor self + juri (style PAPERWORLD, episode `short-baru-11-23-EP08`), lolos ≥3.8.
5. Final, QA, delivery — lihat "Sisa langkah" no. 5–6 di bawah.

---

# HANDOFF — EP08 Nabi Ilyas AS dan Berhala Ba'l (AUDIRA QISSAH, @AUDIRAQISSAH)

Ditulis 2026-11-23 oleh sesi pertama (konteks penuh). Lanjutkan dari sini.

## Sudah selesai
- Tahap 0 pre-flight: `npm run preflight -- --episode=..` di `project/` → No blockers.
- Tahap 1 konteks: dibaca CLAUDE.md, `QISSAH/AUDIRA_KISAH_ISLAM_2026/_tools/BRIEF_COMMON.md` (adab visual), memori GLOBAL/PAPERWORLD.
- Tahap 2 riset: `research/SOURCE_REGISTER.md` (A ayat / B tafsir Ibnu Katsir / C israiliyat), `research/quran_verses.txt` (Uthmani + Kemenag untuk 37:123–132, 6:85, 38:48), tafsir + wiki mentah.
- Tahap 3 gerbang style: **pengguna memilih PAPERWORLD** (approved, tercatat di STATUS.json). `style/STYLE_DECISION.md`, `style/cover-reference.jpg`, `style/style-options.jpg`. **Cover topik (`style/cover-topic.png`) BELUM dirender** — render dari komposisi film (frame hook/payoff) lalu tampilkan ke pengguna, lanjut tanpa acc.
- Tahap 4 (sebagian): `docs/vo-script.txt` (naskah final VO, ±190 kata, "Audira" ditulis huruf kecil agar tidak dieja), `docs/ART_DIRECTION.md` (palet, adab, tipografi, safe zone).
- Tahap 5 (sebagian): `project/` = salinan `F:/AUDIRA-SKILL-MOTION/starter` (tanpa out/, public/models, public/hdri); `project/node_modules` = junction ke `F:/AUDIRA-SKILL-MOTION/node_modules` (remotion 4.0.544, React 19). Script tersedia: vo, sfx, stills, draft, audit:visual, render:final, sign, preflight.

## Sisa langkah
1. Tulis `docs/SCRIPT.md` (naskah per babak + timing estimasi) dan `docs/STORYBOARD.md` (tabel ≥ 6 baris `Scene | Waktu | BG/MG/FG/HUD | Kamera | Audio`), `docs/ASSET_MANIFEST.md`, `SHOTLIST.md` (untuk `npm run sfx`). Rencana adegan:
   - S1 Hook (0–7): malam gurun kertas, lentera kertas bercahaya di tengah; kartu "2 SURAH" (Al-An'am · Ash-Shaffat) + glow "سَلَـٰمٌ".
   - S2 Konteks (7–20): 4 plakat nama (Zakaria, Yahya, Isa, Ilyas) dari kertas, chip "QS Al-An'am 6:85 — semuanya orang saleh"; lalu kartu "QS 37:123 — termasuk para rasul".
   - S3 Kota (20–32): peta kertas → diorama kota kuno (bukan kuil Romawi), pin "Ba'labak · barat Damaskus" + label "menurut sebagian mufassir"; tugu batu bertulis AUDIRA (brand dalam adegan).
   - S4 Berhala (32–43): patung Ba'l perunggu kusam menjulang, siluet kaum kecil tanpa wajah bersujud; HUD "Ba'l = 'tuan' (Ibnu Abbas)"; ikon doa/harapan/takut melayang ke patung.
   - S5 Seruan (43–58): cahaya lentera masuk, jejak kaki di pasir ke gerbang kota; seruan kinetik per baris + Arab QS 37:125 `أَتَدْعُونَ بَعْلًا وَتَذَرُونَ أَحْسَنَ ٱلْخَـٰلِقِينَ`; kartu split "Patung itu DIBUAT / Allah yang MENCIPTA" (pahat vs langit-bintang).
   - S6 Penolakan (58–66): gerbang menutup, siluet berpaling, langit gelap ungu; chip QS 37:127–128; beberapa titik cahaya kecil tetap (hamba yang ikhlas).
   - S7 Cek riwayat (66–72): ikon kereta kosong (roda + nyala, tanpa sosok) dicap "RIWAYAT ISRAILIYAT · tidak ada dalam Al-Qur'an".
   - S8 Payoff (72–86): fajar di atas bukit kertas, lentera di batu + tongkat bersandar, Arab besar `سَلَـٰمٌ عَلَىٰٓ إِلْ يَاسِينَ` (QS 37:130), lalu 37:131–132.
   - S9 Outro (2–3 dtk akhir): outro card AUDIRA ("Created by Agus Dwi R.").
2. VO: `audira_generate_voiceover` dari `docs/vo-script.txt` → `project/public/audio/vo.wav` + `vo-words.json`; `npm run vo -- public/audio/vo.wav`. Cek ejaan "Ba'al", "Il-yaasiin", "Audira". Potong scene mengikuti detik VO. Target 80–90 dtk (bila < 80, tambah 1–2 kalimat dari SOURCE_REGISTER).
3. Kode: komposisi 2D (SVG/CSS, tanpa R3F) di `project/src/episode/Ilyas.tsx`, daftarkan `IlyasPreview` (540×960@30) + `IlyasFinal` (1080×1920@60) di `project/src/Root.tsx`. Multi-scene director by `t`, parallax BG/MG/FG, caption karaoke per kata (gap 0.4em, bounce ≤1.04, plat lebar penuh, kata mendatang opacity 1), callout HUD tiap angka/nama/ayat, chip "ILUSTRASI · TANPA MENGGAMBARKAN SOSOK NABI", `AudiraSignature seed="ep08-nabi-ilyas" handle="@AUDIRAQISSAH"` (ada di `project/src/brand/`), outro card. Font: Playfair Display, Inter, Amiri.
4. `npm run sfx`, draft contact sheet (`npm run draft -- IlyasPreview`), `draft/THEME_CHECK.md`, skor self + juri (`record_score` stage draft, style PAPERWORLD, episode `short-baru-11-23-EP08`). Lolos ≥ 3.8 & tak ada aspek < 3, maks 2 putaran.
5. Final: `npm run render:final -- --comp=IlyasFinal --out=../FINAL_VIDEO.mp4 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=4 --concurrency=2 --encoder=nvenc --title="Nabi Ilyas dan Berhala Ba'l" --slug=ep08-nabi-ilyas --ep=EP08`. Lihat fix GLOBAL memory: sign tanpa await, rename EPERM (pakai mv), true peak (loudnorm TP=-1.5). `audira_qa_video` hardOnly. Metadata ffprobe. `record_score` final.
6. Delivery: `SOCIAL_CAPTIONS.md` 6 platform + `## Jadwal Upload (WIB)` + `## Label Konten AI`, `audira_validate_social_captions`, `SUBTITLES.srt` (`audira_generate_srt`), `NOTES.md`, lesson ke memori, tampilkan caption di chat.

## Aturan keras
- Hanya ubah folder EP08 ini. Jangan sentuh folder EP lain di `AUDIRA_SHORT_BARU_2026_11_23` atau starter bersama.
- Nabi tidak digambarkan dalam bentuk apa pun (tanpa siluet/tangan/bayangan). Kaum = siluet kecil tanpa wajah.
- Output render ke F:, jangan ke C:.
