# Naskah — Ke Mana Perginya Uang Saat Kamu Bayar Pakai QR

> DRAF pra-produksi (backlog, 2026-11-26). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **25** · estimasi **10 dtk**
- Visual: close-up HP memindai stiker QR generik di gerobak warung; angka saldo turun; dari HP memancar garis cahaya yang bercabang ke 5 node berlabel "?" (HUD chip "5 PIHAK").

> Kamu scan satu kode di warung, saldo langsung berkurang. Kelihatannya cuma kamu dan penjual. Padahal ada lima pihak yang ikut memproses uangmu. Audira bongkar jalurnya.

## c01_intro — Intro

- Kata: **27** · estimasi **11 dtk**
- Visual: etalase warung penuh tumpukan stiker QR warna-warni tanpa merek; stiker rontok dan menyatu jadi satu kode; HUD callout "17 AGUSTUS 2019 · BI + ASPI".

> Dulu, tiap aplikasi punya kode sendiri. Pedagang harus memajang banyak stiker. Lalu tanggal 17 Agustus 2019, Bank Indonesia dan ASPI meluncurkan QRIS: satu kode untuk semua aplikasi.

## c02 — Penerbit (issuer)

- Kata: **21** · estimasi **9 dtk**
- Visual: masuk ke dalam HP; layar PIN generik; brankas digital berlabel "PENERBIT · aplikasi dompet digital / bank" memeriksa saldo, koin keluar dari brankas (HUD node 1/5).

> Pihak pertama adalah penerbit, yaitu bank atau dompet digital di HP kamu. Begitu kamu masukkan PIN, penerbit memeriksa saldo lalu memotongnya.

## c03 — Lembaga switching

- Kata: **21** · estimasi **9 dtk**
- Visual: persimpangan jalan data dengan rak server; paket pesan transaksi berbelok dari jalur "aplikasimu" ke jalur "penyedia pedagang" (HUD node 2/5 "SWITCHING").

> Pihak kedua, lembaga switching. Tugasnya mirip operator persimpangan: meneruskan pesan transaksi dari aplikasimu ke penyedia milik pedagang, walaupun keduanya beda perusahaan.

## c04 — Acquirer

- Kata: **19** · estimasi **8 dtk**
- Visual: gedung "bank pedagang" generik menerima paket, cap centang hijau; kamera ikut sinyal kembali ke HP penjual di warung, notifikasi berbunyi (HUD node 3/5 "ACQUIRER").

> Pihak ketiga, acquirer. Inilah bank atau penyedia yang mendaftarkan pedagang. Ia mengonfirmasi pembayaran, lalu notifikasi muncul di HP penjual.

## c05 — Di balik layar (standar + penyelesaian)

- Kata: **19** · estimasi **8 dtk**
- Visual: tarik mundur ke peta jaringan; node 4 "LEMBAGA STANDAR (ASPI)" berupa blueprint kode QR; node 5 "LEMBAGA PENYELESAIAN" berupa neraca yang menyeimbangkan tumpukan koin antarpenyedia.

> Dua pihak lagi bekerja di belakang layar. ASPI menjaga standar kodenya. Lalu ada lembaga penyelesaian yang membereskan hitungan antarpenyedia.

## c06 — Penjelasan: siapa yang bayar

- Kata: **33** · estimasi **14 dtk**
- Visual: struk belanja raksasa; baris "biaya konsumen: Rp0"; potongan kecil dari sisi pedagang dibagi ke 5 node; HUD tabel MDR "per 1 Okt 2026 · usaha mikro: 0% s.d. Rp500 ribu · 0,3% di atasnya".

> Siapa yang membayar mereka? Bukan kamu. Pedagang menanggung biaya bernama MDR, dan konsumen tidak boleh dibebani. Per 1 Oktober 2026, transaksi sampai Rp500 ribu di usaha mikro bebas biaya. Di atasnya, 0,3 persen.

## c07_payoff — Payoff + outro

- Kata: **34** · estimasi **14 dtk**
- Visual: kamera naik dari satu warung ke peta Indonesia yang berkelip titik-titik QR; HUD counter "65,77 JUTA PENGGUNA · 44,86 JUTA PEDAGANG (per Juni 2026)"; kembali ke scan pertama, kelima node menyala bersamaan; outro card AUDIRA.

> Per Juni 2026, jaringan ini dipakai 65,77 juta pengguna dan 44,86 juta pedagang. Jadi lain kali kamu scan, ingat: ada lima pihak yang bekerja hanya dalam hitungan detik. Ikuti Audira untuk bongkar sistem lainnya.

## Opsi hook lain

1. Bayar seribu rupiah pakai QR, dan lima lembaga langsung sibuk. Kamu cuma lihat satu notifikasi.
2. Uangmu tidak lompat langsung ke penjual. Ia mampir dulu ke beberapa tempat.

## Total

- **199 kata** ≈ **82 dtk**
