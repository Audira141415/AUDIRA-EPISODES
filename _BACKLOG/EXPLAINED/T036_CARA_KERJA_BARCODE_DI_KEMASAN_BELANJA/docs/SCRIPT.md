# Naskah — Cara Kerja Barcode di Kemasan Belanja

> DRAF pra-produksi (backlog, 2026-11-26). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

Catatan: hook dikoreksi dari TOPIC.md: barcode dibaca laser ATAU kamera (GS1 #2, #3), dan isinya nomor produk, bukan harga (#8, #17). Lihat RESEARCH_REPORT.md.

## c00_hook — Hook

- Kata: **20** · estimasi **8 dtk**
- Visual: Close-up kemasan polos tanpa merek bergerak ke arah kamera; barcode fiktif membesar memenuhi layar, garis-garisnya terurai jadi 13 angka melayang. Label harga dicoret silang. HUD chip: "13 digit · bukan harga" (#13, #8).

> Garis hitam putih di kemasan belanjamu cuma menyimpan deretan angka. Bukan harga, bukan nama barang. Ini Audira, ayo kita bongkar.

## c01_intro — Intro

- Kata: **23** · estimasi **10 dtk**
- Visual: Lembar paten bergaya cetak biru (gambar garis dan lingkaran bull's-eye, digambar ulang, tanpa wajah penemu); titik-garis kode Morse memanjang jadi batang tipis-tebal. HUD callout: "Paten AS 1952" (#1) lalu "Kasir pertama: 1974" (#15).

> Idenya dipatenkan tahun 1952 oleh Norman Woodland dan Bernard Silver, terinspirasi kode Morse. Tahun 1974, barcode pertama kali dipindai di kasir supermarket Amerika.

## c02 — Angka di balik garis

- Kata: **23** · estimasi **10 dtk**
- Visual: 13 digit fiktif tersusun di atas barcode, lalu terbelah tiga blok berwarna: prefiks, kode perusahaan + produk, digit cek. Ikon bola dunia kecil untuk GS1 (tanpa logo GS1). HUD: "EAN-13 = 13 digit", "GTIN" (#13, #8, #9).

> Barcode paling umum di kemasan namanya EAN-13, isinya tiga belas digit. Deretan itu disebut GTIN, nomor identitas produk yang dikelola lembaga global GS1.

## c03 — Prefiks 899

- Kata: **29** · estimasi **12 dtk**
- Visual: Tiga digit awal "899" menyala; peta dunia generik dengan pabrik-pabrik siluet di beberapa benua, semuanya mengirim kotak polos berlabel "899". Callout tanda seru: "Prefiks ≠ negara asal" (#5, #11).

> Banyak produk di sini berawalan 899. Itu nomor yang diterbitkan GS1 Indonesia. Tapi GS1 menegaskan, prefiks bukan penanda negara asal. Barang berawalan 899 bisa saja dibuat di luar negeri.

## c04 — Dari angka jadi garis, dibaca cahaya

- Kata: **32** · estimasi **13 dtk**
- Visual: Satu digit diperbesar jadi 7 kotak modul: dua batang hitam, dua celah putih berbeda tebal. Lalu potongan (cutaway) dua jenis pemindai: berkas laser merah menyapu garis, dan sensor kamera memotret seluruh barcode. Grafik pantulan naik-turun di bawahnya. HUD: "7 modul per digit", "laser atau kamera" (#14, #2, #3).

> Tiap digit diubah jadi dua batang hitam dan dua celah putih dengan tebal berbeda. Pemindai, laser atau kamera, menyinari garis itu. Hitam menyerap cahaya, putih memantulkannya. Pola pantulan itu diterjemahkan jadi angka.

## c05 — Harga ada di komputer toko

- Kata: **24** · estimasi **10 dtk**
- Visual: Angka hasil pindai melesat lewat kabel ke komputer kasir; tabel database generik terbuka, satu baris menyala berisi "nama barang · harga". Petugas memperbarui harga di tabel, kemasan tetap sama. HUD: "GTIN → database toko" (#17, #8).

> Setelah angkanya terbaca, komputer kasir mencarinya di database toko. Di situlah nama dan harga barang disimpan. Makanya toko bisa mengganti harga tanpa mengganti kemasan.

## c06 — Digit cek

- Kata: **35** · estimasi **14 dtk**
- Visual: Papan hitung bergaya kalkulator dengan label besar "CONTOH FIKTIF": 12 digit (2 0 0 1 2 3 4 5 6 7 8 9) dikali 1-3-1-3 bergantian, jumlah 97, lalu "100 − 97 = 3". Digit 3 terkunci di ujung barcode dengan bunyi klik. Lalu satu digit sengaja salah, hasil hitung tidak cocok, lampu merah. HUD: "digit cek" (#6, #7, #19).

> Digit terakhir disebut digit cek. Dua belas digit sebelumnya dikali satu dan tiga bergantian, lalu dijumlah. Selisih ke kelipatan sepuluh berikutnya jadi digit cek. Kalau tidak cocok, sistem tahu ada salah baca, kasir memindai ulang.

## c07_payoff — Payoff + outro

- Kata: **22** · estimasi **9 dtk**
- Visual: Kamera mundur dari barcode ke meja kasir generik: satu kemasan lewat, bunyi bip, layar menampilkan centang hijau; semua tahap (angka, garis, cahaya, database, digit cek) muncul sebagai ikon berurutan. Outro card AUDIRA.

> Jadi setiap bunyi bip di kasir adalah tiga belas angka yang lolos ujian hitung kecil. Ikuti Audira untuk membongkar benda sehari-hari lainnya.

## Opsi hook lain

1. Angka 899 di bungkus belanjamu tidak menjamin barangnya buatan Indonesia. Lalu apa artinya?
2. Barcode tidak tahu harga barangmu. Yang tahu justru komputer kasir.

## Total

- **208 kata** ≈ **86 dtk** (@145 WPM; 83–92 dtk di 135–150 WPM)
