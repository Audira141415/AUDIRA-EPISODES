# Style Decision — EP05 Kapal Lewat Daratan (1453)

- **Episode:** sejarah-islam-EP05 (`EP05_KAPAL_LEWAT_DARATAN_1453`)
- **Style terpilih:** HISTORYMAP (peta sejarah 3D di meja peta: relief, rute bercahaya, tag kertas)
- **Engine:** Remotion + React Three Fiber (starter AUDIRA-SKILL-MOTION, kit `src/kits/historymap`; scene episode di `project/src/scenes/galata`)
- **Tanggal:** 2026-11-11
- **approved:** yes (style, dipilih pengguna 2026-11-11, opsi utama)
- **cover approved:** yes (cover approved by user 2026-11-11: "Ya, buat suara")

## Alasan

Kisah ini pada dasarnya soal geografi: rantai besi menutup mulut Tanduk Emas, lalu armada memutarinya lewat bukit di belakang Galata. Peta meja 3D bisa menunjukkan ketiganya dalam satu gambar, yaitu rantai di mulut teluk, punggung bukit setinggi sekitar 60 m, dan rute darat dari Bosporus ke Tanduk Emas, sehingga lolos Mute Test. Gaya peta juga menjaga cerita penaklukan tetap netral dan tidak grafis: yang tampil adalah kapal, rantai, bukit, dan peta, bukan pertempuran. Tokoh tidak perlu ditampilkan.

## Alternatif yang ditampilkan (`_review/STYLE_OPTIONS.jpg`)

| Opsi | Style | Status | Alasan tidak dipilih |
|---|---|---|---|
| 1 | **HISTORYMAP** (utama) | Dipilih | — |
| 2 | SATELLITEBRIEFING | Ditolak | Citra satelit modern terasa anakronistis untuk 1453, dan relief bukit serta kapal di atas kereta kayu sulit terbaca dari pandangan orbit. |
| 3 | PAPERWORLD | Ditolak | Hangat dan taktil, tetapi kurang presisi geografis untuk menjelaskan rantai, teluk, dan rute darat. |

## Cover

- `cover-reference.png`: quality bar kit HISTORYMAP (`F:\AUDIRA-SKILL-MOTION\references\quality-bar\historymap.png`).
- `cover-topic.png`: frame 0,3 dtk dari komposisi `GalataCover` (= frame pembuka film). Framing di `cover.json` (sumber: `project/src/scenes/galata/framing.ts`).
  Isi: peta kertas Konstantinopel, Galata, Tanduk Emas, dan Bosporus di atas meja peta gelap. Punggung bukit Galata menonjol sebagai relief. Tujuh kapal perang ringan berlayar terkembang, dayung terangkat, berada di atas kereta kayu dan rol di jalur balok yang melintasi bukit, dengan rute bercahaya dari Bosporus turun ke Tanduk Emas. Rantai besi raksasa di atas balok kayu terbentang di mulut teluk di antara dua menara. Ada kapal pembela di dalam teluk, armada Utsmaniyah tertahan di Bosporus, Menara Galata, tembok kota, dan tag kertas "GALATA", "RANTAI BESI · MENGUNCI TELUK", "BUKIT GALATA · ± 60 M". Judulnya "KAPAL LEWAT BUKIT" dengan label "SEJARAH ISLAM · EP05" dan subjudul "Konstantinopel, 1453: rantai besi mengunci pelabuhan, jadi ±70 kapal ditarik lewat darat".
- Tanpa figur manusia, tanpa kekerasan, tanpa teks hadis.
- Garis pantai digambar tangan secara skematis dan tidak presisi survei. Ukuran rantai dan kapal sengaja dibesarkan seperti diorama.
