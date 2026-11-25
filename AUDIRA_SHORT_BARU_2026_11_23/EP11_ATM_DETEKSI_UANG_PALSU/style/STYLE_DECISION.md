# STYLE DECISION — EP11 Cara Mesin ATM & Setor Tunai Mendeteksi Uang Palsu

Style: INNERWORKS
engine: remotion (2D murni, SVG/DOM, tanpa R3F) + skill audira-2d-motion
approved: yes
Tanggal: 2026-11-23
Channel: AUDIRA Explained (@AudiraExplained)

## Pilihan pengguna
Pengguna memilih "1 INNERWORKS (Recommended)" di gerbang style (2026-11-23).

## Alasan
Topiknya "cara kerja" di dalam satu benda nyata: mesin setor tunai. Bahasa visual INNERWORKS (casing pastel dibelah, garis potong cyan, ghost outline, mekanisme kuningan/baja di studio terang) pas untuk memperlihatkan jalur uang melewati rol dan sensor satu per satu, sebab-akibat di dalam mesin. Skor juri rata-rata 4.17 (memori), dan varian 2D INNERWORKS (cutaway-cap + callout mint/orange) pernah lolos juri 4.17 dengan readability 5.

## Alternatif ditolak
- THERMALFORGE: konsep "mata mesin" spektrum UV/IR kuat, tapi kelemahan tercatat (warna panas silau, label kontras rendah) dan skor 3.46. Dipakai hanya sebagai aksen di adegan UV/IR (tampilan spektrum di dalam palet INNERWORKS).
- DRAFTFORGE: blueprint rapi, tapi lebih cocok gambar teknik statis; kurang hangat untuk kisah "uang ditolak".

## Pelajaran memori yang diterapkan
- Mekanisme terlihat dari frame 0 (casing tembus/terbelah, bukan cover pejal) — hook tidak terbuang.
- Mesin berdiri di plinth + lantai studio + backdrop, bukan melayang di void.
- Muka potongan terbaca logam (kuningan/baja dengan goresan arah + chamfer terang), bukan karton.
- Sudut/subjek berbeda tiap adegan; HUD chip di luar pita 420 px atas yang menimpa objek.
- Chip overlay rgba(244,247,246,0.93), bukan putih murni; teks ≥ 36 px; judul hook berplat gelap, 1 subjek.

## File
- cover-reference.jpg (quality-bar INNERWORKS)
- style-options.jpg (3 kandidat yang ditawarkan)
- cover-topic.png (cover topik, frame hook film)
