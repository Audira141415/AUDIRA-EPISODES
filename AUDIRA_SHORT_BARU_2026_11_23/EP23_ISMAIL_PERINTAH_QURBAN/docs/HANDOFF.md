# HANDOFF — EP23 Ibrahim, Ismail, dan Perintah dalam Mimpi (AUDIRA QISSAH, @AUDIRAQISSAH)

Ditulis 2026-11-23 oleh sesi pertama (context guard). Lanjutkan dari sini; jangan ulang langkah selesai.

## Update sesi kedua (2026-11-23, berhenti karena context guard)
- SELESAI: `style/STYLE_DECISION.md`, `docs/ART_DIRECTION.md`, `docs/SCRIPT.md`, `docs/STORYBOARD.md` (12 baris adegan: S1, S2, S3, S4a 27.3–35.6, S4b Ibnu Katsir 35.6–41.6, S5, S6a berserah 50.7–56.5, S6b panggilan 56.5–63.7, S7a kibas 63.7–66.8, S7b Idul Adha 66.8–71.0, S8 takwa/besek+cahaya hati, S9), `docs/ASSET_MANIFEST.md`, `SHOTLIST.md` di root episode (lint OK 0 red). `npm run sfx` SELESAI → `project/public/audio/sfx.wav` (86 dtk, 38 bunyi).
- BELUM: kode. Pola kode terbaik = `F:/AUDIRA-EPISODES/AUDIRA_SHORT_BARU_2026_11_23/EP08_NABI_ILYAS_BERHALA_BAAL/project/src/episode/Ilyas.tsx` (771 baris, 2D SVG, lulus draft ceilings 5 + camera 5/5): salin strukturnya (helper ease/lin/pop/mulberry/ridge, Cam + L() parallax, Card/Kicker/Big/Body/Arab, Lantern, Stars, Captions karaoke dari vo-words.json, director SCENES + crossfade XF 0.35 + dolly kontinu per adegan, Grain, chip "SOSOK NABI TIDAK DIGAMBARKAN", AudiraOutro + AudiraSignature). JANGAN salin palet kertasnya; pakai palet ISLAMICDOCUMENTARY + girih emas gradien logam + grain perkamen. PENTING: vo-words.json = detik VO, jadi caption pakai `t - 0.3`. Ilyas tidak pakai <Voiceover> (render:final memasukkan VO lewat --vo); ikuti itu.
- Memori ISLAMICDOCUMENTARY: EP07 gagal juri 3.33 karena vektor datar tanpa tekstur + motif berulang + beat abstrak. Wajib tekstur dan objek konkret per frasa (tenda, jejak, kitab tafsir di rehal, kibas, masjid, besek daging, matahari). Readability = ceiling terlemah → teks besar kontras.
- Perintah draf: `cd project && npm run draft -- IsmailPreview` (menulis ke `../draft/`: DRAFT_SHEET.jpg, DRAFT_REPORT.json, jury_input.json). Juri buta: subagent dengan `qa/jury.md` (di F:/AUDIRA-SKILL-MOTION) + jury_input.json → `record_score` judge jury.

## Sudah selesai
- Tahap 1 konteks: CLAUDE.md, `F:/AUDIRA-EPISODES/QISSAH/AUDIRA_KISAH_ISLAM_2026/_tools/BRIEF_COMMON.md` (adab visual), HANDOFF EP08 (pola sama: Remotion 2D SVG), memori GLOBAL/channel/ISLAMICDOCUMENTARY.
- Tahap 2 riset: `research/SOURCE_REGISTER.md` (20 klaim A/B/C), `research/quran_verses.txt` (Uthmani + Kemenag 37:99–113, 22:37, 22:34, 108:2), `research/tafsir_ibnkathir_37_99-113.txt`.
- Tahap 3 gerbang style: **pengguna memilih ISLAMICDOCUMENTARY** (approved di STATUS.json). `style/cover-reference.png`, `style/style-options.jpg`, cover opsi. **BELUM**: `style/STYLE_DECISION.md` (tulis: style, alasan, alternatif ditolak STORYBOOK/PAPERWORLD, tanggal 2026-11-23, approved: yes, baris `Style: ISLAMICDOCUMENTARY`) dan `style/cover-topic.png` (render dari frame film, tampilkan ke pengguna, lanjut tanpa acc).
- Naskah VO: `docs/vo-script.txt` (187 kata). **VO terkunci**: `project/public/audio/vo.wav` 82,38 dtk, `vo-words.json` (187 kata), `vo.timing.json`. Voice default Galang 04b567df.
- Proyek: `project/` = salinan `F:/AUDIRA-SKILL-MOTION/starter` (tanpa out/models/hdri), `project/node_modules` = junction ke `F:/AUDIRA-SKILL-MOTION/node_modules` (remotion ok). `SERIES.json` + `src/brand/channel.json` sudah diset QISSAH/@AUDIRAQISSAH. Font Arab: `project/public/fonts/Amiri-Regular.ttf`, `Amiri-Bold.ttf` (OFL, dari google/fonts) — load via FontFace seperti `src/core/type/fonts.ts`.

## Detik kalimat VO (detik VO; film = VO + 0.3 offset)
```
 0.14  Seorang ayah bermimpi diperintah menyembelih anaknya sendiri.
 3.65  Dan jawaban sang anak, diabadikan Al-Qur'an sampai hari ini.
 7.17  Nabi Ibrahim lama berdoa: / 8.99 Ya Tuhanku, anugerahkan kepadaku anak yang saleh.
12.32  Allah lalu memberinya kabar gembira, seorang anak yang sangat sabar.
16.10  Dialah Ismail, anak yang lama ia nantikan.
18.87  Ketika Ismail cukup besar ... datanglah sebuah mimpi. / 24.83 Bagi para nabi, mimpi adalah wahyu.
27.71  Ibrahim tidak memaksa. / 29.34 Ia justru bertanya: / 30.80 Wahai anakku, aku bermimpi menyembelihmu. / 33.75 Bagaimana pendapatmu?
35.54  Menurut Ibnu Katsir, pertanyaan itu agar terasa lebih ringan, sekaligus menguji kesabaran sang anak.
41.58  Ismail menjawab: / 42.77 Wahai ayahku, lakukanlah apa yang diperintahkan kepadamu. / 46.58 Insya Allah ... orang yang sabar.
50.60  Keduanya berserah diri. / 52.28 Sang ayah taat ..., sang anak taat pada Allah dan ayahnya.
56.39  Lalu Allah memanggil: / 57.77 Wahai Ibrahim, engkau telah membenarkan mimpi itu. / 60.62 Sungguh, ini benar-benar ujian yang nyata.
63.41  Ismail ditebus dengan sembelihan yang besar, seekor kibas. / 66.58 Dari peristiwa inilah, setiap Idul Adha umat Islam berkurban.
70.77  Tapi ingat firman Allah dalam Surah Al-Hajj: / 73.27 daging dan darahnya tidak akan sampai kepada Allah. / 75.88 Yang sampai kepada-Nya adalah takwa kita.
78.06  Salam sejahtera bagi Ibrahim. / 80.02 Kisah dalam Al-Qur'an, bersama Audira. (VO end 82.38)
```
Film: `VO_OFFSET = 0.3`, `FILM_SECONDS = 86.0` (outro AudiraOutro 3 dtk terakhir).

## Rencana adegan (film detik = VO + 0.3) — palet ISLAMICDOCUMENTARY: biru malam #0f1e3a/#1a2f5a, emas #d4af37/#f2d27a, krem #efe4c8, hijau tua #0f4c3a
- S1 Hook 0–7.4: gurun malam, langit bintang dalam bingkai girih emas, bulan sabit; dua lentera (besar & kecil) di bukit; kinetic "SEORANG AYAH · SEBUAH MIMPI"; chip "QS As-Saffat 37:100–111".
- S2 Doa 7.4–18.6: lentera besar, cahaya doa naik ke bintang; Arab 37:100 `رَبِّ هَبْ لِى مِنَ ٱلصَّـٰلِحِينَ`; bintang meledak lembut = kabar gembira; kartu `بِغُلَـٰمٍ حَلِيمٍ` "anak yang sangat sabar · QS 37:101"; kartu nama "ISMAIL".
- S3 Tumbuh + mimpi 18.6–27.3: siang gurun, dua pasang jejak kaki (besar & kecil) berjalan berdampingan; tugu batu bertulis AUDIRA di tepi jalan (brand dalam adegan); lalu malam, bulan, kartu "Mimpi para nabi = wahyu · Ubaid bin Umair, Tafsir Ibnu Katsir".
- S4 Bertanya 27.3–41.6: dua lentera berhadapan di batu bawah bintang; kartu ucapan "Wahai anakku … Bagaimana pendapatmu? · QS 37:102"; kartu "IBNU KATSIR: lebih ringan · menguji kesabaran".
- S5 Jawaban 41.6–50.7: klimaks; Arab besar `يَـٰٓأَبَتِ ٱفْعَلْ مَا تُؤْمَرُ` + Indonesia kinetik "Lakukanlah apa yang diperintahkan"; lentera kecil makin terang; "سَتَجِدُنِىٓ إِن شَآءَ ٱللَّهُ مِنَ ٱلصَّـٰبِرِينَ".
- S6 Berserah + panggilan 50.7–63.7: fajar di bukit, dua lentera berdampingan; dua kartu "TAAT" (ayah → Allah | anak → Allah & ayah); riak cahaya di langit (bukan sosok), Arab `قَدْ صَدَّقْتَ ٱلرُّءْيَآ` QS 37:105; kartu "Ujian yang nyata · QS 37:106".
- S7 Tebusan 63.7–70.9: kibas putih bertanduk tenang di bukit, cahaya emas; Arab `وَفَدَيْنَـٰهُ بِذِبْحٍ عَظِيمٍ` QS 37:107; transisi ke "IDUL ADHA · 10 ZULHIJAH", siluet masjid + lampu.
- S8 Takwa 70.9–78.3: QS Al-Hajj 22:37; Arab `لَن يَنَالَ ٱللَّهَ لُحُومُهَا وَلَا دِمَآؤُهَا` lalu `وَلَـٰكِن يَنَالُهُ ٱلتَّقْوَىٰ مِنكُمْ`; cahaya hati naik ke bintang; tanpa visual darah/pisau.
- S9 Payoff 78.3–83: matahari terbit, Arab besar `سَلَـٰمٌ عَلَىٰٓ إِبْرَٰهِيمَ` QS 37:109; "Kisah dalam Al-Qur'an · AUDIRA".
- Outro 83–86: `<AudiraOutro seconds={3} />`.
Arab: salin PERSIS dari `research/quran_verses.txt`.

## Sisa langkah
1. `style/STYLE_DECISION.md`; `docs/ART_DIRECTION.md`, `docs/SCRIPT.md`, `docs/STORYBOARD.md` (≥6 baris `Scene | Waktu | BG/MG/FG/HUD | Kamera | Audio`), `docs/ASSET_MANIFEST.md`, `SHOTLIST.md` (format starter, untuk `npm run sfx`; lihat `project/scripts/lib/shotlist.mjs`).
2. Kode 2D SVG/CSS (tanpa R3F) di `project/src/episodes/ismail/Film.tsx` (+ Hud.tsx, Karaoke.tsx salinan dari `F:/AUDIRA-EPISODES/AUDIRA_SAINS_ANAK_2026/EP02_PELANGI_TERBENTUK/project/src/episodes/pelangi/Karaoke.tsx`). Multi-scene director by `t`, parallax BG/MG/FG + kamera kontinu (scale/translate), callout HUD tiap ayat/nama/angka, chip "ILUSTRASI · TANPA MENGGAMBARKAN SOSOK NABI", `<Voiceover src="audio/vo.wav" offset={0.3} />`, Karaoke position≈1300 sampai t<82.9, `<AudiraOutro seconds={3} />`, `<AudiraSignature seed="ep23-ismail-qurban" handle="@AUDIRAQISSAH" />`. Daftarkan `IsmailPreview` (540×960@30), `IsmailFinal` (1080×1920@60), `IsmailCover` di `src/Root.tsx` (lihat Root EP02 pelangi).
3. Cover topik: `node scripts/stills.mjs out/cover 0 IsmailCover` → `style/cover-topic.png`, tampilkan.
4. `npm run sfx`, draft contact sheet (`npm run draft -- IsmailPreview` atau stills 8 frame), `npm run audit:visual`, `draft/THEME_CHECK.md`, skor self + juri (`record_score` stage draft, style ISLAMICDOCUMENTARY, episode `short-baru-11-23-EP23`). Lolos ≥3.8 tanpa aspek <3, maks 2 putaran.
5. Final: `npm run render:final -- --comp=IsmailFinal --out=../FINAL_VIDEO.mp4 --vo=public/audio/vo.wav --offset=0.3 --sfx=public/audio/sfx.wav --jobs=4 --concurrency=2 --encoder=nvenc --title="Ibrahim, Ismail, dan Perintah dalam Mimpi" --slug=ep23-ismail-qurban --ep=EP23`. Fix memori GLOBAL: sign tanpa await (tanda tangani via skrip yang await), rename EPERM (pakai mv), true peak (loudnorm TP=-1.5 / alimiter). `audira_qa_video` hardOnly. Cek metadata ffprobe. `record_score` final.
6. Delivery: `SOCIAL_CAPTIONS.md` 6 platform + `## Jadwal Upload (WIB)` + `## Label Konten AI`, `audira_validate_social_captions`, `SUBTITLES.srt`, `NOTES.md`, lesson ke memori, caption di chat, 3 scheduled task review.

## Aturan keras
- Hanya ubah folder EP23 ini. Banyak sesi lain jalan paralel di folder EP saudara.
- Nabi Ibrahim & Ismail TIDAK digambarkan dalam bentuk apa pun (tanpa tubuh/siluet/tangan/bayangan): pakai lentera, jejak kaki, bintang, cahaya. Tanpa pisau/darah/adegan penyembelihan. Allah/malaikat tidak digambarkan; "panggilan" = riak cahaya/teks saja.
- Output render ke F:, jangan C:.
