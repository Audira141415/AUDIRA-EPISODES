# Naskah — Kenapa Code Review Kamu Nggak Efektif (dan Cara Memperbaikinya)

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **9** · estimasi **4 dtk**
- Visual: layar diff kode, kaca pembesar menyapu baris, ikon kumbang "BUG" tertangkap lalu dicoret merah; teks kinetik "DATANYA BILANG LAIN".

> Code review kamu buat nangkep bug? Datanya bilang lain.

## c01_intro — Intro

- Kata: **23** · estimasi **10 dtk**
- Visual: tumpukan kartu komentar review dilempar ke meja riset, counter HUD "570 KOMENTAR" berputar, chip tahun "2013", name plate teks "Microsoft" (tanpa logo).

> Tahun 2013, peneliti membedah 570 komentar review dari berbagai tim di Microsoft. Mereka cuma ingin tahu satu hal: review itu sebenarnya menghasilkan apa?

## c02 — Ekspektasi vs kenyataan

- Kata: **26** · estimasi **11 dtk**
- Visual: kartu-kartu tersortir ke wadah berlabel; wadah "BUG" kecil dengan callout "14%", wadah besar "KETERBACAAN", "SOLUSI LAIN", "BERBAGI ILMU" penuh.

> Hasilnya mengejutkan. Nemu bug memang alasan nomor satu orang melakukan review. Tapi komentar soal bug cuma 14 persen. Sisanya soal keterbacaan, solusi alternatif, dan berbagi ilmu.

## c03 — Studi kedua

- Kata: **24** · estimasi **10 dtk**
- Visual: diagram donat terbelah; irisan kecil "≈15% BUG" berdenyut, setengah lingkaran "≥50% PERAWATAN KODE" menyala; chip tahun "2015".

> Studi tahun 2015 menemukan pola yang mirip. Cuma sekitar 15 persen komentar yang menunjuk kemungkinan bug. Paling sedikit separuhnya membahas perawatan kode jangka panjang.

## c04 — Penyebab 1: ukuran

- Kata: **36** · estimasi **15 dtk**
- Visual: tumpukan file diff meninggi; meter "komentar berguna" turun saat file bertambah; penggaris baris menandai zona hijau "200–400 BARIS", jam pasir "60 MENIT".

> Lalu kenapa review sering terasa sia-sia? Penyebab pertama: ukuran. Makin banyak file dalam satu review, makin sedikit komentar yang berguna. Studi tim Cisco menyarankan 200 sampai 400 baris sekali duduk, dan jangan lebih dari 60 menit.

## c05 — Penyebab 2: konteks

- Kata: **29** · estimasi **12 dtk**
- Visual: karakter reviewer tanpa wajah di depan peta kode berkabut; kabut menipis tiap kunjungan (1, 2, 3); bar "33%" tumbuh jadi "67%".

> Penyebab kedua: reviewer yang asing dengan kodenya. Di review pertama, cuma 33 persen komentarnya dianggap berguna. Saat meninjau bagian yang sama untuk ketiga kalinya, angkanya naik jadi 67 persen.

## c06 — Penjelasan: perubahan kecil, review cepat

- Kata: **21** · estimasi **9 dtk**
- Visual: arus perubahan kecil berbentuk balok mengalir cepat di conveyor; counter "9 JUTA", kartu "MEDIAN 24 BARIS", stopwatch "< 4 JAM"; name plate teks "Google" (tanpa logo).

> Google menunjukkan kebalikannya. Dari 9 juta perubahan, median ukurannya cuma 24 baris, dan median seluruh proses review di bawah 4 jam.

## c07_payoff — Payoff + outro

- Kata: **28** · estimasi **12 dtk**
- Visual: checklist 3 langkah tercentang satu per satu ("±100 BARIS", "REVIEWER KENAL KODE", "≤ 1 HARI KERJA"), lalu outro card AUDIRA.

> Jadi resepnya begini. Pecah perubahan jadi kecil, sekitar 100 baris. Pilih reviewer yang kenal kodenya. Balas paling lambat satu hari kerja. Ikuti AUDIRA untuk bongkar cara kerja lainnya.

## Opsi hook lain

1. Cuma 14 persen komentar code review yang ngomongin bug. Terus sisanya buat apa?
2. Pull request seribu baris itu bukan di-review. Itu di-scroll.

## Total

- **196 kata** ≈ **84 dtk**
