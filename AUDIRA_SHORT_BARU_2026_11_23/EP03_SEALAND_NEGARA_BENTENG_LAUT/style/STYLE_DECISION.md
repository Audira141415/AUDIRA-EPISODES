# STYLE_DECISION — EP03 Sealand

Style: VISUALINVESTIGATION
Engine: Remotion 2D (React + SVG, tanpa R3F) — skill `audira-2d-motion`, tooling starter AUDIRA-SKILL-MOTION
Tanggal: 2026-11-23
approved: yes (jawaban pengguna: "VISUALINVESTIGATION (Recommended)")

## Alasan
Inti cerita Sealand adalah "berkas kasus": benteng PD II, proklamasi 1967, putusan pengadilan 1968, kudeta 1978, perluasan batas laut 1987. Bahasa visual investigasi (meja kerja, map berkas, stabilo, cap merah, peta batas 3 → 12 mil, benang merah) membuat tiap babak terbaca sebagai bukti, dan twist status hukum jadi payoff yang kuat.

## Arahan look (2D)
- Meja kerja kayu hangat + kolam cahaya lampu meja (bukan dark desk: memori mencatat dark desk = lighting ceiling 2).
- Kertas krem #f5efe6, tinta #292524, stabilo #eab308, cap merah #dc2626, laut #2b5d7a.
- Ilustrasi vektor konkret per babak: benteng Maunsell, kapal tunda + ponton tenggelam, siluet tiang radio, dokumen pengadilan, helikopter + panah serangan, peta batas laut, sertifikat gelar.
- Brand di dalam adegan: tab map berkas "AUDIRA // BERKAS SEALAND".

## Alternatif ditolak
- HISTORYMAP — kuat untuk geografi, tapi cerita ini lebih banyak drama dokumen daripada peta; peta cukup jadi satu babak.
- COMICFORGE — cocok untuk kudeta 1978, tapi skor juri historis 3.3 (depth/material) dan nada komik kurang pas untuk twist hukum.

## 2026-11-23 — VISUALINVESTIGATION gagal juri 2 putaran (G16)
- Juri buta r1 3.83 (PERLU POLES: composition 3, readability 3), r2 3.67 (lighting 3, composition 3, readability 3).
- Wajib ganti style (G16/G21). Kandidat ditawarkan ke pengguna (cover di `style/fallback/`):
  1. CHRONICLE (utama, unggulan): dokumenter sejarah sinematik, adegan per babak 1943→1967→1978→1987.
  2. HISTORYMAP: peta bergerak, pas untuk batas laut 3 mil → 12 mil.
  3. FILM16: arsip film 16 mm, nuansa kilas balik radio bajak laut 1967.
- approved: menunggu pilihan pengguna. Setelah dipilih: cover topik baru, ulang tahap 4 (docs baris `Style: <ID>`), VO dipakai ulang.

## 2026-11-23 — KEPUTUSAN BARU: CHRONICLE (approved: yes)
Style: CHRONICLE
- Dipilih pengguna lewat dialog sesi induk: "CHRONICLE (Recommended)". approved: yes.
- Alasan: dokumenter sejarah sinematik, satu adegan per babak (1943 benteng, 1967 Roy Bates, 1968 pengadilan, 1978 kudeta, 1987 batas laut 12 mil).
- Ditolak: VISUALINVESTIGATION (juri buta 3,83 / 3,67, G16); HISTORYMAP dan FILM16 (alternatif tidak dipilih).
- Cover referensi: `F:/AUDIRA-SKILL-MOTION/references/quality-bar/chronicle.jpg`. Cover topik baru: `style/cover-topic.png` (perlu dirender ulang dalam CHRONICLE).

## 2026-11-23 — CHRONICLE gagal juri 2 putaran (3,33 / 3,33, G16) → KEPUTUSAN BARU: HISTORYMAP (approved: yes)
Style: HISTORYMAP
- Dipilih pengguna lewat dialog sesi induk: "HISTORYMAP (Recommended)". approved: yes.
- Alasan: peta sejarah bergerak menjelaskan inti cerita (7 mil laut dari pantai, batas 3 mil → 12 mil tahun 1987, rute kudeta dari Jerman/Belanda), diselingi diorama aksi per babak (benteng ditenggelamkan, Roy memanjat, tembakan peringatan, palu hakim, serbuan heli, sel).
- Ditolak: VISUALINVESTIGATION (juri 3,83 / 3,67), CHRONICLE (juri 3,33 / 3,33: figur datar, siluet benteng berulang, aksi tak tampak, teks tertutup objek). Alternatif r3 tidak dipilih: CINESTORY, FILM16.
- Cover referensi: `style/cover-reference-historymap.png` (dari `F:/AUDIRA-SKILL-MOTION/references/quality-bar/historymap.png`). Gold acuan: HISTORYMAP EP16 Tristan da Cunha.
- Cover topik: `style/cover-topic.png` (Still `SealandCover`, benteng dari udara + "400 m²" + panel "SEALAND"). Cover lama: `cover-topic-chronicle.png`, `cover-topic-visualinvestigation.png`.
