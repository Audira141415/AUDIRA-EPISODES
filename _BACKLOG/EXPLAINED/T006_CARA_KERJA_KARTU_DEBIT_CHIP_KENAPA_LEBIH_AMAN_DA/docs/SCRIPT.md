# Naskah — Cara Kerja Kartu Debit Chip: Kenapa Lebih Aman dari Strip Magnetik

> DRAF pra-produksi (backlog, 2026-11-26). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **19** · estimasi **8 dtk**
- Visual: Makro kepingan chip emas pada kartu polos tanpa merek; saat kata "kode baru", deretan karakter acak menyala dari chip lalu terhapus. HUD: "1 KODE / TRANSAKSI".

> Chip kecil di kartu debitmu bikin kode baru setiap kali kamu bayar. Dan kode itu cuma bisa dipakai sekali.

## c01_intro — Intro

- Kata: **22** · estimasi **9 dtk**
- Visual: Kartu berputar ke sisi belakang; pita magnetik hitam di-zoom, berisi baris data yang diam dan identik di tiap transaksi (kalender bergulir di samping, data tidak berubah).

> Sebelum ada chip, data kartu disimpan di pita magnetik di bagian belakang. Isinya tetap, sama persis dari transaksi pertama sampai yang terakhir.

## c02 — Data yang diam

- Kata: **20** · estimasi **8 dtk**
- Visual: Konsep "fotokopi": baris data pita disalin ke kartu kosong kedua (ilustrasi abstrak, tanpa alat atau cara), mesin pembaca memberi centang ke keduanya. Tidak menampilkan alat skimming atau langkah teknis.

> Masalahnya, data yang diam itu bisa disalin. Begitu tersalin, kartu tiruan terlihat sama persis dengan kartu aslinya di mata mesin.

## c03 — Isi chip

- Kata: **26** · estimasi **11 dtk**
- Visual: Kamera menembus chip (exploded view): pelat kontak, lalu inti silikon seperti kota mini. HUD: "8 TITIK KONTAK · ISO/IEC 7816"; ikon kunci terkunci di inti chip.

> Chip bekerja beda. Kepingan emas itu sebenarnya komputer mini dengan hingga delapan titik kontak, diatur standar internasional. Di dalamnya ada kunci kriptografi yang sangat sulit digandakan.

## c04 — Saat transaksi

- Kata: **25** · estimasi **10 dtk**
- Visual: Kartu masuk ke mesin pembayaran generik (tanpa logo); paket data "NOMINAL" mengalir ke chip, chip berdenyut, keluar token bercahaya berlabel "KRIPTOGRAM".

> Saat kartu masuk ke mesin, terminal mengirim data transaksi, termasuk nominalnya. Chip mengolah data itu dengan kuncinya, lalu menghasilkan kode sekali pakai yang disebut kriptogram.

## c05 — Bank memeriksa

- Kata: **28** · estimasi **12 dtk**
- Visual: Token terbang lewat jalur jaringan ke gedung bank generik; stempel "COCOK" hijau. Lalu token lama dicoba lagi dan ditolak (silang merah). HUD: "KODE LAMA = DITOLAK".

> Kode itu dikirim ke bank penerbit untuk dicek saat itu juga. Kalau cocok, kartunya asli. Kode lama yang tercuri tidak ada gunanya, karena transaksi berikutnya butuh kode baru.

## c06 — Penjelasan: Indonesia

- Kata: **36** · estimasi **15 dtk**
- Visual: Peta Indonesia; timeline kinetik: "30 DES 2015 · SE BI", "NSICCS", bar progres 30% → 50% → 80% → 100% dengan HUD "31 DES 2021 · CHIP + PIN 6 DIGIT".

> Di Indonesia, Bank Indonesia menetapkan aturannya lewat surat edaran tanggal 30 Desember 2015, dengan standar chip nasional bernama NSICCS. Targetnya, seratus persen kartu ATM dan debit memakai chip dan PIN enam digit pada 31 Desember 2021.

## c07_payoff — Payoff + outro

- Kata: **32** · estimasi **13 dtk**
- Visual: Kode di layar terus berganti sementara kartu tiruan memudar; lalu ikon belanja online dan PIN dengan tanda peringatan; outro card Audira.

> Jadi keamanannya bukan di plastiknya, tapi di kode yang selalu berubah. Tapi ingat, chip tidak menjaga belanja online atau PIN yang kamu bagikan sendiri. Ikuti Audira untuk cara kerja benda di dompetmu.

## Opsi hook lain

1. Kartu debitmu menyimpan komputer mini. Dan setiap kamu bayar, ia bikin kode rahasia yang langsung hangus.
2. Kenapa kartu ATM lama gampang ditiru, tapi kartu chip hampir mustahil? Jawabannya ada di keping emas sekecil kuku ini.

## Total

- **208 kata** ≈ **86 dtk** (@145 WPM; 83–92 dtk @150–135 WPM)
