# Style Decision — EP06 Jam Gajah Al-Jazari

- Seri: AUDIRA_SEJARAH_ISLAM_2026 · Channel: AUDIRA QISSAH (@AUDIRAQISSAH)
- Tanggal: 2026-11-12
- Style terpilih: **INNERWORKS** (engine Remotion + React Three Fiber)

## Kenapa INNERWORKS
Cerita jam gajah adalah cerita "cara kerja": perut gajah dibelah, lalu penonton melihat bak air, mangkuk kuningan yang tenggelam dalam setengah jam, tali ke kastil, bola yang jatuh dari paruh elang ke mulut ular, simbal, dan peluit. INNERWORKS memang dibuat untuk cutaway 3D seperti itu: cangkang dibuka di potongan yang jelas, mekanisme bergerak dari satu penggerak (kedalaman mangkuk), dan label pendek menempel ke titik 3D.

## Alternatif yang ditampilkan (`_review/STYLE_OPTIONS_B2.jpg`)
1. **INNERWORKS** (utama) — dipilih.
2. **VINTAGEFORGE** (manuskrip, tembaga dan patina emas) — tidak dipilih: cocok untuk suasana manuskrip, tetapi cutaway mekanisme di dalam perut gajah lebih jelas di INNERWORKS. Nuansa manuskrip bisa dipakai sebagai aksen (halaman buku di Context dan Payoff).
3. **DRAFTFORGE** (cetak biru CAD) — tidak dipilih: garis blueprint terasa terlalu modern untuk karya tahun 1206 dan kurang menampilkan bahan kuningan, tembaga, dan air.

Pengguna memilih opsi utama untuk semua episode batch 2 pada 2026-11-11/12 ("Ya, semua utama").

## Status
- style approved: **yes** (pilihan pengguna)
- cover topik approved: **yes** — cover approved by user 2026-11-12 ("Ya, buat suara"), bersama naskah
- Stage B: lapisan belakang ditambah untuk kedalaman (dinding basal berkabut + manuskrip di lectern); frame 0–1,5 dtk tetap framing cover, dengan dinding/tepi buku tampak samar di latar

## File
- `cover-reference.jpg` — quality bar INNERWORKS (`F:\AUDIRA-SKILL-MOTION\references\quality-bar\innerworks.jpg`)
- `cover-topic.png` — frame 0,3 dtk dari komposisi `JazariCover` (`project/src/scenes/jazari/`), juga frame pembuka film
- `cover.json` — framing kamera cover (`COVER` di `project/src/scenes/jazari/layout.ts`)

## Parameter look (dari motion memory INNERWORKS)
`<Finish>` profil CINEMA_TEAL_ORANGE (vignette 0,12), exposure 1, envIntensity 0,55, `hdri="studio"`, AO aktif. Material Polish (toyPlastic, fabric, stone), `RoundedBoxGeo` untuk dais/atap/kastil, `useSurfaceGrain` di cangkang tembaga.
