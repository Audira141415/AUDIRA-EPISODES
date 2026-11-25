# SOURCE_REGISTER — EP02 Cara Kerja Kartu e-Toll / Tap NFC

Diakses 2026-11-23. Hanya fakta yang terverifikasi di sumber dipakai di naskah.

| # | Fakta | Sumber | Catatan |
|---|-------|--------|---------|
| S1 | NFC bekerja di 13,56 MHz (pita ISM), jarak kerja ±4 cm, praktis tidak lebih dari 10 cm | https://en.wikipedia.org/wiki/Near-field_communication | Lead + bagian Design |
| S2 | NFC berbasis kopling induktif dua kumparan (seperti trafo inti udara); medan magnet bolak-balik adalah penghubung utama, hampir tidak ada daya yang dipancarkan | https://en.wikipedia.org/wiki/Near-field_communication | |
| S3 | Pembaca (initiator) membangkitkan medan RF yang memberi daya target pasif, sehingga kartu/stiker tidak butuh baterai | https://en.wikipedia.org/wiki/Near-field_communication | |
| S4 | ISO/IEC 14443 = standar kartu nirsentuh "proximity card", Tipe A & B di 13,56 MHz; pembaca = PCD, kartu = PICC | https://en.wikipedia.org/wiki/ISO/IEC_14443 | |
| S5 | Kartu membalas dengan *load modulation* pada subcarrier 847,5 kHz (1/16 dari 13,56 MHz); 106 kbit/s | https://en.wikipedia.org/wiki/ISO/IEC_14443 | |
| S6 | MIFARE Classic 1K: memori 1.024 byte, 16 sektor, tiap sektor 2 kunci (A, B), mendukung *value block* untuk dompet elektronik | https://en.wikipedia.org/wiki/MIFARE | Contoh chip kartu bersaldo; tidak diklaim sebagai chip spesifik e-Toll |
| S7 | Induksi elektromagnetik ditemukan Michael Faraday, demonstrasi pertama 29 Agustus 1831; GGL = −N·dΦ/dt | https://en.wikipedia.org/wiki/Electromagnetic_induction | |
| S8 | Uang elektronik berbasis chip bersifat prabayar, nilai tersimpan (*stored value*), bisa dibayar offline di terminal | https://id.wikipedia.org/wiki/Uang_elektronik | Dasar klaim "saldo tersimpan di chip kartu" |
| S9 | Tap e-Toll ±4 detik vs tunai ±7 detik; e-Toll mulai dipakai Januari 2009 | https://id.wikipedia.org/wiki/E-Toll | |
| S10 | Mulai Selasa 31 Oktober 2017 seluruh ruas tol Jasa Marga melayani transaksi 100% non-tunai | https://properti.kompas.com/read/2017/10/31/123100421/resmi-hari-ini-seluruh-ruas-tol-jasa-marga-layani-transaksi-non-tunai (judul + tanggal di hasil Bing); Bareksa 11 Sep 2017 "Mulai 31 Oktober 2017 pembayaran di jalan tol ... sepenuhnya non tunai"; dasar hukum Permen PUPR 16/PRT/M/2017 (peraturan.bpk.go.id) | |
| S11 | MLFF (Multi Lane Free Flow) berbasis GNSS oleh PT Roatex Indonesia Toll System; investasi disebut hingga Rp4 triliun; uji coba tahap kedua di Tol Bali Mandara, skema setengah komersial; Menteri PU Dody Hanggodo: pemerintah tidak terburu-buru (28/9/2026) | https://nasional.kontan.co.id/news/uji-coba-mlff-gagal-konklusif-pemerintah-siapkan-pengujian-tahap-kedua | Status terbaru: masih uji coba, belum implementasi penuh |
| S12 | MLFF sebelumnya dijanjikan mulai 2025 (molor berkali-kali) | https://ekonomi.bisnis.com (judul "Molor Lagi, Sistem Bayar Tol Tanpa Henti MLFF Diterapkan 2025", 6 Nov 2024); Kompas.id 8 Nov 2024 "Sistem MLFF Akan Diterapkan di Gerbang Tol Mulai 2025" | Dari judul + cuplikan hasil Bing |

## Tidak dipakai (belum terverifikasi)
- Batas saldo uang elektronik unregistered Rp2 juta (PBI 20/6/PBI/2018): halaman BI 404, cuplikan tidak menyebut angka → tidak masuk naskah.
- Klaim chip spesifik tiap bank (Mandiri e-money, Flazz, Brizzi, TapCash): tidak disebut merek di naskah.

## Lisensi musik/SFX
- Tanpa musik berlisensi. SFX prosedural dari `npm run sfx` (buatan sendiri).
