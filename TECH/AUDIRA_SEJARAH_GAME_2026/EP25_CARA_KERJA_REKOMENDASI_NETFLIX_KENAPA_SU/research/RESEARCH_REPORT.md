# Research Report — Cara Kerja Rekomendasi Netflix: Kenapa Susah Berhenti Nonton

## Sumber utama

- Netflix Help Center: cara kerja rekomendasi (#1), autoplay episode (#7), autoplay preview (#8). Sumber resmi, menjelaskan sinyal yang dipakai.
- Netflix Tech Blog 2012, Amatriain & Basilico (#3): angka 75% dan nasib algoritma pemenang Netflix Prize.
- Netflix TechBlog 2017, artwork personalization (#4): sampul berbeda per orang.
- Gomez-Uribe & Hunt, ACM TMIS 2015 (#5): makalah resmi tim Netflix, fokus A/B test pada retensi.
- WIRED 2017 (#6): angka lebih dari 80% dan "taste communities". Netflix Prize via Wikipedia (#2).

## Fakta terverifikasi

1. Rekomendasi adalah tebakan peluang suka, dari riwayat tonton, rating, selera anggota mirip, info judul, jam, bahasa, perangkat, dan durasi tonton (#1).
2. Umur dan jenis kelamin tidak dipakai dalam keputusan rekomendasi (#1).
3. Netflix Prize: mulai 2006, hadiah US$1 juta, dimenangkan BellKor's Pragmatic Chaos pada 21 September 2009 dengan peningkatan 10,06% (#2).
4. Algoritma pemenang tidak dipasang utuh karena tambahan akurasinya tidak sebanding dengan upaya rekayasa (#3).
5. Per 2012, 75% tontonan berasal dari rekomendasi (#3); per 2017, lebih dari 80% acara TV yang ditonton ditemukan lewat rekomendasi (#6).
6. Penonton masuk ke sekitar dua ribu "komunitas selera", bisa lebih dari satu (#6).
7. Sampul judul dipersonalisasi; contoh Good Will Hunting versi romantis vs versi komedi (#4).
8. Sistem dioptimalkan lewat A/B test untuk retensi dan engagement (#5).
9. Autoplay episode berikutnya dan autoplay preview adalah setelan profil yang bisa dimatikan (#7, #8).

## Perselisihan / Kontroversi

- **Hook TOPIC.md kurang akurat.** "Algoritma yang sudah tahu tontonan berikutnya sebelum kamu memilih" berlebihan. Netflix sendiri menyebut sistemnya *memperkirakan peluang* kamu menikmati sebuah judul (#1), bukan tahu pasti. Naskah memakai framing "menebak" dan angka 8 dari 10 (#6).
- **75% vs 80%.** Angka 75% dari blog Netflix 2012 (#3); "lebih dari 80%" dari WIRED 2017 (#6), bukan rilis resmi Netflix. Angka "80% jam streaming" yang sering dikutip dari makalah Gomez-Uribe & Hunt 2015 tidak bisa diverifikasi (isi penuh berbayar, abstrak tidak memuatnya), jadi tidak dipakai. Naskah menyebut "delapan dari sepuluh" dengan atribusi per 2017.
- **Angka populer yang tidak dipakai:** "hemat US$1 miliar per tahun" dan "orang menyerah setelah 60–90 detik memilih" sering dikutip dari makalah 2015, tetapi tidak terverifikasi di sumber terbuka. Jangan masuk VO.
- **"Kenapa susah berhenti"**: sumber resmi tidak menyebut tujuan membuat orang ketagihan. Yang terverifikasi: sistem dioptimalkan untuk retensi (#5) dan ada autoplay (#7). Naskah tidak mengklaim niat manipulatif.
- **Contoh Good Will Hunting** adalah ilustrasi di blog Netflix ("might"), bukan bukti satu kasus nyata. Naskah memakai kata "bisa".
- **Visual:** jangan tampilkan wajah aktor nyata (Matt Damon, Robin Williams) atau logo Netflix asli; pakai poster siluet generik dan wordmark netral.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 8 dari 10 (>80%) | acara TV ditemukan lewat rekomendasi, per 2017 | 6 |
| 75% | tontonan dari rekomendasi, per 2012 | 3 |
| 2006 | Netflix Prize dimulai | 2 |
| US$1.000.000 | hadiah utama | 2 |
| 2009 | pemenang diumumkan (21 Sep) | 2 |
| BellKor's Pragmatic Chaos | tim pemenang | 2 |
| 10,06% | peningkatan akurasi vs Cinematch | 2 |
| 100 juta rating | data latih (100.480.507) | 2 |
| ±2.000 | komunitas selera | 6 |
| Good Will Hunting | contoh sampul personal | 4 |

## Poin kunci

- Rekomendasi = tebakan peluang dari jejak perilaku, bukan membaca pikiran.
- Sayembara sejuta dolar dimenangkan, tetapi rumusnya tidak dipakai utuh: twist kuat untuk babak tengah.
- Dua mesin "susah berhenti": sampul yang dipilih per orang, dan autoplay episode berikutnya.
- Penutup praktis: autoplay bisa dimatikan di setelan profil (#7, #8).
- Topik awet secara konsep; angka persentase ditulis "per 2012/2017".
