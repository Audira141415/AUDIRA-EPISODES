# Naskah — Frontend Performance: Metrik yang Benar-Benar Penting (LCP, INP, CLS)

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **19** · estimasi **8 dtk**
- Visual: Layar split: skor hijau 'lolos' di laptop, lalu ponsel membeku saat jari mengetuk tombol; callout "FID pensiun".

> Situsmu lolos tes Google, tapi tetap terasa lemot. Kok bisa? Karena salah satu metrik yang kamu kejar sudah pensiun.

## c01_intro — Intro

- Kata: **20** · estimasi **9 dtk**
- Visual: Tiga kartu HUD bernama LCP, INP, CLS muncul bergantian di atas siluet laptop.

> Ini AUDIRA. Google punya tiga ukuran untuk rasa nyaman membuka web. Namanya Core Web Vitals. Kita bahas satu per satu.

## c02 — LCP: kecepatan muat

- Kata: **25** · estimasi **11 dtk**
- Visual: Garis waktu halaman dengan satu gambar besar muncul; HUD '2,5 detik' dan jam digital berhenti di batas.

> Pertama, LCP. Ini waktu sampai elemen terbesar di layar selesai tampil. Batas bagusnya dua koma lima detik. Lewat dari itu, orang merasa halaman belum jadi.

## c03 — INP: respons interaksi

- Kata: **24** · estimasi **10 dtk**
- Visual: Jari mengetuk tombol, bilah respons memanjang; HUD '200 ms' hijau, '500 ms' merah.

> Kedua, INP. Ini mengukur seberapa cepat halaman bereaksi saat kamu mengetuk atau mengetik. Batas bagusnya dua ratus milidetik. Di atas lima ratus, dianggap buruk.

## c04 — FID digantikan INP

- Kata: **26** · estimasi **11 dtk**
- Visual: Kalender bergeser ke 12 Maret 2024; kartu FID dicoret, kartu INP naik menggantikan.

> Yang lama bernama FID, dan cuma mengukur interaksi pertama. Pada dua belas Maret dua ribu dua puluh empat, INP resmi menggantikannya. Dukungan FID berakhir sembilan September.

## c05 — CLS: layout melompat

- Kata: **22** · estimasi **10 dtk**
- Visual: Tombol 'Bayar' bergeser ke bawah tepat saat jari menekan, karena iklan muncul; HUD '0,1'.

> Ketiga, CLS. Ini mengukur layout yang melompat, misalnya tombol bergeser tepat saat kamu mau menekannya. Nilai bagusnya nol koma satu atau kurang.

## c06 — Cara skor dihitung

- Kata: **37** · estimasi **16 dtk**
- Visual: Sepuluh ikon pengguna, delapan menyala hijau lalu tiga perempat disorot; bar '43%' di peta ponsel.

> Skornya dari data pengguna asli, pada persentil ke tujuh puluh lima. Artinya tiga perempat kunjungan harus lolos. Google menyebut ini selaras dengan sistem peringkatnya. Tapi di data 2024, hanya empat puluh tiga persen situs seluler yang lolos.

## c07_payoff — Payoff + outro

- Kata: **22** · estimasi **10 dtk**
- Visual: Tiga kartu LCP, INP, CLS menyala hijau bersama, outro AUDIRA.

> Jadi ukur tiga hal: muat, respons, stabil. Kejar angka pengguna asli, bukan cuma skor lab. Ikuti AUDIRA untuk cara kerja web lainnya.

## Opsi hook lain

1. Tiga angka ini menentukan apakah situsmu terasa cepat atau lemot.
2. FID sudah pensiun. Kamu masih mengukurnya?

## Total

- **195 kata** ≈ **78–87 dtk**
