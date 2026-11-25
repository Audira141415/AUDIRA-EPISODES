# UPDATE 3 2026-11-23 (sesi kedua, guard 215k)

- **Film.tsx v1 sudah ditulis**: `project/src/ep24/Film.tsx` (11 adegan S1..S9 sesuai detik UPDATE 2, Hall/Throne/Staff/Jinn/Tower/Termite, bayangan jatuh panjang 30/38 px + rim, captions karaoke, chip adab, AudiraOutro + AudiraSignature seed ep24-sulaiman-tongkat). Terdaftar di `project/src/Root.tsx`: `SulaimanPreview` + `SulaimanFinal` (83.5 dtk). `tsc` bersih untuk ep24.
- Still pertama: `node scripts/stills.mjs ../draft/_s1 3s,12s,22s,27s,33s,43s,50s,56s,61s,67s,76s,79s SulaimanPreview` → `draft/_s1/_sheet.jpg`, `look.json`: **PERLU POLES composition & readability (capped ≤ 3)**. BELUM dilihat. Langkah pertama sesi baru: buka `draft/_s1/_sheet.jpg` + `draft/_s1/look.json` + `_layout.json` (alasan cap), perbaiki (kemungkinan teks di luar x 60–1020, overlap kartu/caption, kontras), render ulang still sampai audit lolos.
- Lalu: `SHOTLIST.md` (format EP08) + `npm run sfx`; cover `style/cover-topic.png` (still 1080×1920 SulaimanFinal ±3s), tampilkan; tahap 8 draft juri; 9 final; 10 delivery (lihat UPDATE di bawah).

---

# UPDATE 2 2026-11-23 (sesi kedua, akhir)

- Preflight: No blockers. check-env: Ready (@AUDIRAQISSAH).
- **VO selesai & terkunci**: `project/public/audio/vo.wav` (80.11 dtk, Cartesia voice default, 191 kata), `vo-words.json`, `vo.timing.json` (`npm run vo` sudah jalan). Catatan: `audira_generate_voiceover` dengan scriptPath .txt gagal (butuh baris bertimestamp) → dipakai parameter `text`.
- **Waktu adegan dari VO (detik)** — pakai di Film.tsx `T`:
  - S1 Hook 0–7.6 (kata "Hanya seekor rayap" 6.13)
  - S2a Kerajaan 7.6–18.8 ("Nabi Sulaiman" 7.77, "Angin" 13.39, "Sebagian jin" 15.28)
  - S2b Karya jin 18.8–30.0 ("Mereka membangun" 18.90; ikon gedung/patung/piring/periuk ±19.5–24.5; "Allah berfirman: bekerjalah" 25.56)
  - S3 Wafat 30.0–36.3 ("Lalu Allah menetapkan" 30.02, "Para mufassir" 32.40)
  - S4 Waktu berlalu 36.3–45.6 ("Para jin tidak menyadari" 36.44, "Siang berganti" 39.44, "Menurut para mufassir … sekitar setahun" 42.03)
  - S5 Rayap 45.6–53.3 ("Surah Saba ayat empat belas" 45.77, "Sedikit demi sedikit" 51.28)
  - S6 Tersungkur 53.3–57.8 ("Sampai akhirnya" 53.42, "patah" 55.57, "tersungkur" 56.94 = impact)
  - S7a Ayat jin tak tahu gaib 57.8–63.9 ("Saat itulah" 57.93)
  - S7b Israiliyat 63.9–70.2 ("Ada pula" 64.04, "Itu riwayat israiliyat" 66.84 = stempel)
  - S8 Payoff 70.2–77.8 ("Kerajaan sebesar itu" 70.33, "Jin tidak mengetahui" 74.26, "Hanya Allah" 76.18)
  - S9 Penutup 77.8–80.5 ("Kisah dalam Al-Qur'an, bersama Audira" 77.94)
  - Outro AudiraOutro 80.5–83.5 → durasi film 83.5 dtk.
- Sisa: tahap 7 (Film.tsx + Root + SHOTLIST.md + sfx + cover), 8, 9, 10 seperti UPDATE di bawah.

---

# UPDATE 2026-11-23 (sesi kedua, context guard ±191k)

Selesai di sesi kedua:
- Tahap 4: `docs/vo-script.txt` (191 kata, final), `docs/ART_DIRECTION.md`, `docs/SCRIPT.md`, `docs/STORYBOARD.md` (tabel scene + shot list 19 baris, lint PASS), `docs/ASSET_MANIFEST.md`.
- Tahap 5 (sebagian): `project/` disalin dari `F:/AUDIRA-SKILL-MOTION/starter` (robocopy tanpa node_modules/out/models/hdri), junction `project/node_modules` -> `F:/AUDIRA-SKILL-MOTION/node_modules`, `project/SERIES.json` (@AUDIRAQISSAH) ditulis.

Berikutnya (urut):
1. `cd project && npm run preflight -- --episode=.. && npm run check-env`.
2. Tahap 6 VO: `audira_generate_voiceover` scriptPath `docs/vo-script.txt`, outputPath `project/public/audio/vo.wav`, wordsPath `project/public/audio/vo-words.json`; lalu `npm run vo -- public/audio/vo.wav`. Kunci ulang waktu adegan ke detik VO.
3. Tahap 7: TEMPLATE KODE TERBAIK = `../EP08_NABI_ILYAS_BERHALA_BAAL/project/src/episode/Ilyas.tsx` (771 baris: helper ridge/torn/L parallax, Defs bayangan kertas, Grain, KeyLight, ForeFrame, Card/Kicker/Big/Arab HUD, Captions karaoke dari vo-words.json, director SCENES + crossfade, chip adab, AudiraOutro + AudiraSignature). Salin pola ke `project/src/ep24/Film.tsx`, ganti adegan sesuai STORYBOARD (singgasana kosong + tongkat sebagai objek pembawa, jin siluet kertas, penampang tongkat berayap, tongkat patah, stempel israiliyat, payoff). Daftarkan `SulaimanPreview` 540x960@30 + `SulaimanFinal` 1080x1920@60 di `project/src/Root.tsx` (lihat pola Root EP08 baris 11/36/37). Pelajaran juri EP08 (3.17→3.67): perkuat key light terarah dengan bayangan jatuh panjang 30-40px, rim highlight, ketebalan karton, >=4 plane, tidak ada plakat kosong saat VO menyebut subjek. Tulis `SHOTLIST.md` di root episode (format seperti EP08 SHOTLIST.md) lalu `npm run sfx`.
4. Cover topik `style/cover-topic.png` (still 1080x1920 dari SulaimanFinal frame hook), tampilkan ke pengguna, lanjut.
5. Tahap 8-10 seperti di bawah.

---

# HANDOFF — EP24 Nabi Sulaiman AS Wafat Bersandar pada Tongkat (AUDIRA QISSAH, @AUDIRAQISSAH)

Ditulis 2026-11-23 oleh sesi pertama (context guard ±190k). Lanjutkan dari sini.

## Sudah selesai
- Tahap 1 konteks: CLAUDE.md global, `F:/AUDIRA-EPISODES/QISSAH/AUDIRA_KISAH_ISLAM_2026/_tools/BRIEF_COMMON.md` (adab), HANDOFF + STYLE_DECISION EP08 Ilyas (2D PAPERWORLD, saudara batch ini), memori GLOBAL + PAPERWORLD.
- Tahap 2 riset: `research/SOURCE_REGISTER.md` (A: QS 34:12–14, 38:35–38; B: Ibnu Katsir — bersandar tongkat, rayap, "sekitar setahun"; C: israiliyat pohon kharrub dll. dipisah). Teks ayat: `research/quran_verses.txt`. Tafsir: `research/ik_34_14.txt`, `research/ik_ar_34_14.txt`.
- Tahap 3 gerbang: **pengguna memilih PAPERWORLD** (approved di STATUS.json). `style/STYLE_DECISION.md`, `style/style-options.jpg`, `style/cover-option-*.{jpg,png}`. **Cover topik `style/cover-topic.png` BELUM** — render dari frame hook/payoff film, tampilkan ke pengguna, lanjut tanpa acc.

## Sisa langkah (tanpa gerbang lagi sampai final)
1. Tahap 4 docs: `docs/ART_DIRECTION.md` → `docs/SCRIPT.md` + `docs/STORYBOARD.md` (≥ 6 baris `Scene | Waktu | BG/MG/FG/HUD | Kamera | Audio`) → `docs/ASSET_MANIFEST.md` + `docs/vo-script.txt` (±195 kata, 80–90 dtk; tulis "Audira" bukan "AUDIRA"; penutup "Kisah dalam Al-Qur'an, bersama Audira."). Lint: `python F:/AUDIRA-2D-SKILL-MOTION/tools/storyboard_lint.py docs/STORYBOARD.md`. Rencana adegan:
   - S1 Hook (0–6): tongkat kayu berdiri bersandar di depan singgasana kosong bercahaya; jin kertas sibuk di latar. Teks: "Ia sudah wafat… tapi tak satu jin pun tahu."
   - S2 Konteks (6–20): kerajaan Sulaiman — angin, jin ahli bangunan & penyelam (QS 38:36–37), jin membangun gedung tinggi, patung, piring sebesar kolam, periuk (QS 34:12–13); kartu "QS Saba 34:12–13". Brand AUDIRA di prasasti batu/papan bangunan.
   - S3 Wafat (20–34): mihrab, tongkat berdiri, cahaya meredup lembut; ayat Arab 34:14 potongan `فَلَمَّا قَضَيْنَا عَلَيْهِ ٱلْمَوْتَ`; tetap tanpa sosok.
   - S4 Jin terus bekerja (34–48): siang-malam berganti, jin kertas angkat batu; callout "± SETAHUN (menurut para mufassir)" + kalender kertas berputar.
   - S5 Rayap (48–62): close-up penampang tongkat, rayap kertas menggerogoti lorong-lorong di dalam; label "minsa'ah = tongkat", "dabbatul ardh = rayap".
   - S6 Tersungkur (62–72): tongkat retak, patah, jatuh (jangan tampilkan tubuh; jatuhnya tongkat + debu + cahaya padam). Jin terdiam, alat jatuh.
   - S7 Pelajaran (72–84): Arab `أَن لَّوْ كَانُوا۟ يَعْلَمُونَ ٱلْغَيْبَ مَا لَبِثُوا۟ فِى ٱلْعَذَابِ ٱلْمُهِينِ` + Indonesia Kemenag; kartu "Jin TIDAK tahu yang gaib · hanya Allah". Stempel "RIWAYAT ISRAILIYAT" untuk kisah pohon kharrub (sekali, singkat).
   - S8 Outro (2–3 dtk akhir): outro card AUDIRA ("Created by Agus Dwi R.").
2. Tahap 5 scaffold: salin `F:/AUDIRA-SKILL-MOTION/starter` ke `project/` (tanpa out/, public/models, public/hdri, node_modules), junction `project/node_modules` → `F:/AUDIRA-SKILL-MOTION/node_modules` (seperti EP08). Cek `project/SERIES.json` (handle @AUDIRAQISSAH). `npm run preflight -- --episode=..`, `npm run check-env`.
3. Tahap 6 VO: `audira_generate_voiceover` scriptPath `docs/vo-script.txt` → `project/public/audio/vo.wav` + `vo-words.json`; `npm run vo -- public/audio/vo.wav`. Bila jeda panjang: `scripts/tighten-pauses.py` maks 0,45 dtk.
4. Tahap 7: komposisi 2D (SVG/CSS) `project/src/ep24/Film.tsx`, daftarkan `SulaimanPreview` (540×960@30) + `SulaimanFinal` (1080×1920@60) di `project/src/Root.tsx`. Contoh 2D PAPERWORLD saudara: `../EP04_PULAU_SENTINEL_UTARA/project/src/ep04/{Film,pieces,scenes}.tsx` (juri 3.5 — perbaiki depth). Karaoke lebar penuh, gap 0.4em, kata mendatang opacity 1. Callout HUD tiap angka/ayat. `AudiraSignature seed="ep24-sulaiman-tongkat" handle="@AUDIRAQISSAH"`. Font: Playfair Display, Inter, Amiri. `npm run sfx`.
5. Tahap 8: draft contact sheet + `draft/THEME_CHECK.md` + audit:visual + audit:camera; skor self + juri (`record_score` stage draft, style PAPERWORLD, episode `short-baru-11-23-EP24`). Lolos ≥ 3.8 & tak ada aspek < 3, maks 2 putaran.
6. Tahap 9 final: `npm run render:final -- --comp=SulaimanFinal --out=../FINAL_VIDEO.mp4 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=4 --concurrency=2 --encoder=nvenc --title="Nabi Sulaiman Wafat Bersandar Tongkat" --slug=ep24-sulaiman-tongkat --ep=EP24`. Fix memori GLOBAL: sign dengan skrip yang await, rename EPERM → mv, true peak → loudnorm TP=-1.5 dua-pass. Metadata ffmpeg + ffprobe. `audira_qa_video` hardOnly. `record_score` final.
7. Tahap 10: `SOCIAL_CAPTIONS.md` 6 platform + `## Jadwal Upload (WIB)` + `## Label Konten AI`, validator, `SUBTITLES.srt`, `NOTES.md`, lesson ke memori, caption tampil di chat.

## Aturan keras
- Hanya ubah folder EP24 ini. Jangan sentuh folder EP lain atau starter bersama.
- Nabi tidak digambarkan dalam bentuk apa pun. Tidak ada malaikat maut.
- Output render ke F:, jangan ke C:.
