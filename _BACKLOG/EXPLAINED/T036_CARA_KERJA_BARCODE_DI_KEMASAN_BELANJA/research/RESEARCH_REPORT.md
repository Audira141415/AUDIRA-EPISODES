# Research Report — Cara Kerja Barcode di Kemasan Belanja

> Riset backlog 2026-11-26. Channel @AudiraExplained (rule 15: tanpa wajah orang nyata, tanpa logo/merek nyata; semua barcode di layar fiktif).

## Sumber utama

- **GS1 (global office)**: halaman barcode (#2), fact sheet lingkungan pemindai (#3), position paper pemindai berbasis gambar (#4), daftar prefiks + pernyataan prefiks bukan negara asal (#5), metode digit cek (#6, #7, #19), definisi GTIN (#9).
- **GS1 US**: FAQ GTIN dan fungsi barcode (#8).
- **GS1 Indonesia**: situs resmi gs1id.org (#11). Halamannya berbasis JavaScript, yang terbaca hanya metadata beranda.
- **ISO**: ISO/IEC 15420 simbologi EAN/UPC (#10).
- **Dokumen paten** US 2,612,994 (1952), dibuka sebagai PDF (#1).
- Pendukung MEDIUM: ANTARA (#12), Wikipedia: EAN, UPC, Barcode, Barcode reader, GTIN, Norman Joseph Woodland (#13–#18).

## Fakta terverifikasi

1. Paten barcode pertama: US 2,612,994, Woodland dan Silver, diajukan 20 Okt 1949, terbit 7 Okt 1952 (#1, #18).
2. Idenya terinspirasi kode Morse yang dipanjangkan jadi garis tipis-tebal (#15, MEDIUM).
3. Pemakaian komersial pertama UPC di kasir: 26 Juni 1974, supermarket di Troy, Ohio, AS (#15, MEDIUM). Merek barang yang dipindai tidak disebut di VO (rule 15).
4. Barcode linear EAN/UPC menyandikan GTIN, nomor identitas produk (#2, #8, #9).
5. EAN-13 = 13 digit: prefiks GS1, kode perusahaan, kode produk, digit cek (#13). UPC-A = 12 digit (#14).
6. Tiap digit = 7 modul: 2 batang + 2 celah dengan lebar 1–4 modul; simbol lengkap 95 modul (#13, #14).
7. EAN/UPC dipindai dengan laser ATAU kamera; kasir butuh pemindai segala arah (#2, #3). GS1 menyarankan peritel beralih ke pemindai berbasis gambar karena barcode 2D tidak bisa dibaca laser (#4).
8. Prefiks 899 = GS1 Indonesia (#5, #11). GS1 menegaskan prefiks tidak menunjukkan negara asal produk (#5).
9. Harga tidak ada di barcode kemasan pabrik; GTIN dipakai untuk mencari data produk di database peritel (#8, #17). Pengecualian: barang timbang yang dikemas toko (prefiks sirkulasi terbatas 200–299) bisa menyandikan harga/berat (#5, #13, #14).
10. Digit terakhir = digit cek. Metode GS1: kali 1 dan 3 bergantian, jumlahkan, kurangkan dari kelipatan sepuluh berikutnya (#6, #7). Contoh GS1: jumlah 57 → digit cek 3. Contoh fiktif kita: 200123456789 → jumlah 97 → digit cek 3 (#19).
11. Spesifikasi simbol EAN/UPC distandarkan di ISO/IEC 15420 (edisi terbaru 2025), aturan isi data di GS1 General Specifications (#10).
12. Konteks lokal: Kemendag dan GS1 Indonesia memfasilitasi sertifikasi barcode UMKM agar masuk ritel modern, per Oktober 2026 (#12).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md**: "Garis hitam-putih itu menyimpan angka yang dibaca laser dalam sekejap" tidak sepenuhnya akurat. (a) GS1 menyebut EAN/UPC dibaca "laser or camera" (#2, #3), dan GS1 mendorong pemindai berbasis gambar (#4); pemindai ponsel dan banyak kasir modern memakai kamera/imager. (b) "Menyimpan angka" benar, tapi perlu ditegaskan angkanya nomor produk (GTIN), bukan harga atau nama. Hook dikoreksi menjadi: "Garis hitam putih di kemasan belanjamu cuma menyimpan deretan angka. Bukan harga, bukan nama barang." Kata "laser" dipindah ke c04 sebagai "laser atau kamera". "Dalam sekejap" dihapus karena tidak ada angka kecepatan bersumber.
- **Mitos 899 = buatan Indonesia**: salah kaprah populer. GS1 menyatakan prefiks tidak menunjukkan negara asal (#5). VO menyebut 899 sebagai nomor terbitan GS1 Indonesia, bukan jaminan buatan Indonesia.
- **Harga di barcode**: untuk produk kemasan pabrik (GTIN), harga ada di sistem toko. Pengecualian barang timbang di toko (#13, #14) tidak dibahas di VO agar tidak membingungkan; jangan menulis "barcode tidak pernah memuat harga" di caption.
- **Kode Morse dan 1974** hanya bersumber Wikipedia (MEDIUM). Paten 1952 HIGH (dokumen paten asli). Bila ingin tahun 1974 berstatus HIGH, cari sumber GS1 (halaman sejarah GS1 404 saat dicek) atau museum.
- **"Digit cek ditolak"**: sumber GS1 hanya menyebut digit cek menjaga integritas nomor (#7). VO memakai "sistem tahu ada salah baca", bukan klaim teknis perilaku pemindai tertentu.
- **ISO/IEC 15420:2009** sudah ditarik dan diganti edisi 2025 (#10); tidak disebut di VO.
- **Merek nyata**: contoh barcode dan kemasan wajib fiktif. Contoh hitungan memakai nomor berawalan 200 (sirkulasi terbatas, bukan produk global) dan diberi label "CONTOH FIKTIF". Jangan pakai nomor berawalan 899 yang lengkap 13 digit di layar karena bisa kebetulan milik produk nyata; tampilkan "899" + digit disamarkan.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 1952 | Paten barcode Woodland & Silver (US 2,612,994) | 1, 18 |
| 1974 | Pemindaian UPC pertama di kasir (Troy, Ohio) | 15 |
| 13 digit | EAN-13 | 13 |
| GTIN | Nomor identitas produk di barcode | 8, 9 |
| GS1 | Lembaga global pengelola sistem nomor (tanpa logo) | 2, 11 |
| 899 | Prefiks GS1 Indonesia, bukan negara asal | 5, 11 |
| 7 modul / 2 batang + 2 celah | Pola satu digit | 13, 14 |
| laser atau kamera | Jenis pemindai EAN/UPC | 2, 3, 4 |
| ×1 ×3 bergantian | Bobot digit cek | 6 |
| 97 → 100 − 97 = 3 | Contoh hitungan FIKTIF (2001234567893) | 19 |

## Poin kunci

- Struktur bongkar: garis → angka → arti angka (GTIN, prefiks) → cara dibaca (cahaya) → harga di database → digit cek → bip.
- Payoff: tiap bip = 13 angka lolos ujian hitung kecil (digit cek).
- Dua mitos dikoreksi di layar: "899 = buatan Indonesia" dan "harga ada di barcode". Ini nilai jual utama video.
- Topik awet; satu-satunya bagian yang bisa berubah adalah tren pemindai (laser ke kamera, 1D ke 2D).
- Rule 15: kemasan polos, barcode fiktif, tanpa logo GS1/peritel, tanpa wajah penemu (gambar paten digambar ulang saja).
