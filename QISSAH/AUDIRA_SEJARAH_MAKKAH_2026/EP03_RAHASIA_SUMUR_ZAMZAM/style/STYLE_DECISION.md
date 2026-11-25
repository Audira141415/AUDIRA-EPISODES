# Style Decision — EP03 RAHASIA SUMUR ZAMZAM

- Seri: SEJARAH MAKKAH · EP03 · slug `zamzam`
- Tanggal: 2026-11-10
- Style terpilih: **INNERWORKS** (cutaway 3D / mekanisme terbelah, studio HDRI)
- approved: yes (style, dipilih pengguna lewat gerbang style `_review/STYLE_OPTIONS.jpg`, opsi 1 utama)
- Cover topik: **approved: yes** (cover approved by user 2026-11-10, kedua format)

## Kenapa INNERWORKS cocok

Inti episode ini adalah sesuatu yang tidak terlihat: sumur sekitar 30 meter yang kini tertutup di bawah lantai tawaf. INNERWORKS membelah tanah di bawah mataf sehingga penonton melihat lapisan demi lapisan (marmer, ruang bawah tanah lama, pasir aluvium, batuan lapuk setengah meter tempat air masuk, diorit), lalu pompa dan pipa yang membawa air ke pemurnian di Kudai. Gaya cutaway terang dengan label teknis cocok untuk bab anatomi sumur, pemantauan, dan perjalanan setetes air, sambil tetap tenang dan hormat untuk bab sejarah (tanpa sosok nabi atau malaikat; hanya tempat, benda, air, dan cahaya).

## Alternatif yang ditampilkan

1. **DRAFTFORGE** (cetak biru CAD teknis): kuat untuk ukuran dan dimensi, tetapi dingin dan datar untuk bab sejarah (lembah, penggalian ulang, era timba); kurang terasa kedalaman fisik lapisan tanah.
2. **TERRARIUM** (ekosistem dalam toples kaca): menarik untuk air tanah dan hujan, tetapi bernuansa alam hidup/organik yang menjauh dari konteks Masjidil Haram, pompa, pipa, dan pabrik.

Pengguna memilih opsi utama (INNERWORKS).

## File

- `cover-reference.jpg`: quality bar INNERWORKS (`F:\AUDIRA-SKILL-MOTION\references\quality-bar\innerworks.jpg`)
- `cover-topic-16x9.png`: 1920x1080, komposisi `ZamzamCoverWide` (juga basis thumbnail YouTube 1280x720)
- `cover-topic-9x16.png`: 1080x1920, komposisi `ZamzamCover`
- Sumber adegan: `project/src/scenes/zamzam/` (`layout.ts`, `World.tsx`, `ZamzamCover.tsx`)

## Parameter look (dari motion memory INNERWORKS)

`<Finish hdri="studio" profile=CINEMA_TEAL_ORANGE exposure=1 envIntensity=0.55 ao>`, latar studio #efe9df, palet: pasir #d9b98a, batuan lapuk #f2a93b (aksen jalan masuk air), diorit #626d69, air #3fb2d9, aksen koral #ef7a43.

Skor cover (record_score, stage cover, `sejarah-makkah-EP03`): lighting 4, material 4, depth 4, composition 4, motion 3 (still, tidak dinilai), readability 4; rata-rata 3,83, verdict "PERLU POLES" karena aspek motion tidak bisa dinilai dari still.
