# SOURCE_REGISTER — Cara Kerja QRIS (EP01)

Tanggal baca semua sumber: 2026-11-23. Dibaca lewat browser (WebSearch tidak tersedia di sesi ini).

Singkatan sumber:
- **KOMPAS** = "Transaksi QRIS Melonjak 70,95 Persen, Pengguna Capai 71,91 Juta", Kompas.com, 18 Nov 2026 — https://money.kompas.com/read/2026/11/18/184000126/transaksi-qris-melonjak-70-95-persen-pengguna-capai-71-91-juta
- **CNBC** = "BI: Transaksi QRIS Melonjak 70%, Pengguna Tembus 71,9 Juta", CNBC Indonesia, 18 Nov 2026 — https://www.cnbcindonesia.com/market/20261118145328-17-786336/bi-transaksi-qris-melonjak-70-pengguna-tembus-719-juta
- **WIKI** = "QRIS", Wikipedia bahasa Indonesia (mengutip PADG 21/18/PADG/2019, siaran pers BI) — https://id.wikipedia.org/wiki/QRIS
- **BI-INFRA** = "Infrastructure", Bank Indonesia — https://www.bi.go.id/en/fungsi-utama/sistem-pembayaran/ritel/infrastruktur/default.aspx
- **JALIN** = "Kenali Jalin Lebih Dekat", PT Jalin Pembayaran Nusantara — https://www.jalin.co.id/id-id/berita/produk-layanan/kenali-jalin-lebih-dekat-menjalin-sistem-pembayaran-untuk-indonesia
- **BI-MDR** = Siaran pers BI "Kartu Kredit Indonesia dan Kebijakan MDR 0%" — https://www.bi.go.id/id/publikasi/ruang-media/news-release/Pages/sp_2815926.aspx ; ANTARA https://www.antaranews.com/berita/5697901/bi-perluas-kebijakan-mdr-qris-0-persen-untuk-pelaku-umkm
- **KATADATA** = "BI: Transaksi QRIS Tembus 15 Miliar hingga Juli 2026" — https://katadata.co.id/finansial/keuangan/6a9e3b775a371/bi-transaksi-qris-tembus-15-miliar-hingga-juli-2026

| # | Fakta (angka/tanggal/nama/klaim) | Sumber | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | Hingga Oktober 2026 pengguna QRIS 71,91 juta, merchant 51,31 juta (RDG BI 18 Nov 2026) | KOMPAS, CNBC (data resmi BI) | lihat atas | 2026-11-23 | HIGH |
| 2 | Transaksi QRIS tumbuh 70,95% yoy pada Oktober 2026 | KOMPAS, CNBC | lihat atas | 2026-11-23 | HIGH |
| 3 | QRIS diluncurkan BI + ASPI 17 Agustus 2019 (HUT RI ke-74); dasar PADG No. 21/18/PADG/2019 tanggal 16 Agustus 2019 | WIKI | lihat atas | 2026-11-23 | MED |
| 4 | QRIS wajib berlaku nasional mulai 1 Januari 2020; QR lama tidak berlaku | WIKI | lihat atas | 2026-11-23 | MED |
| 5 | Sebelum QRIS, tiap penyelenggara punya QR sendiri (pembeli harus punya GoPay bila merchant hanya punya QR GoPay) | WIKI | lihat atas | 2026-11-23 | MED |
| 6 | QRIS memakai format QR pembayaran EMVCo; tiap merchant punya NMID (National Merchant ID) yang sama di semua penyelenggara | WIKI | lihat atas | 2026-11-23 | MED |
| 7 | Transaksi QRIS diproses domestik lewat GPN; 4 lembaga switching: Artajasa, Rintis, Alto, Jalin | BI-INFRA | lihat atas | 2026-11-23 | HIGH |
| 8 | Alur domestik: pengguna scan dengan aplikasi → bank penerbit (issuer) membaca nama & nomor merchant → diteruskan lewat switching → acquirer memberi respons berhasil (Response Code 00) → issuer → notifikasi ke merchant | JALIN | lihat atas | 2026-11-23 | HIGH |
| 9 | QRIS Tap (NFC) diluncurkan Maret 2025; QRIS berbasis QR ±5 detik, QRIS Tap ±0,3 detik | WIKI | lihat atas | 2026-11-23 | MED |
| 10 | MDR 0% untuk usaha mikro transaksi s.d. Rp500.000, berlaku 1 Oktober 2026; MDR ditanggung merchant, tidak boleh dibebankan ke konsumen | BI-MDR | lihat atas | 2026-11-23 | HIGH |
| 11 | Transaksi QRIS tembus 15 miliar (kumulatif) hingga Juli 2026 | KATADATA | lihat atas | 2026-11-23 | MED |

## Level
- **HIGH**: data resmi BI / lembaga switching. **MED**: ensiklopedia/media besar.

## Perselisihan / Kontroversi
| Klaim | Posisi A | Posisi B | Sikap naskah |
|---|---|---|---|
| "Saldo pindah dalam 2 detik" | Wikipedia: QRIS QR ±5 dtk (termasuk buka aplikasi & scan) | Proses jaringan issuer→switching→acquirer berlangsung dalam hitungan detik | Naskah memakai "hitungan detik"; angka 2 detik tidak disebut sebagai fakta resmi. |

## Musik/SFX (sumber + lisensi)
| Aset | Sumber | Lisensi/atribusi |
|---|---|---|
| SFX | Prosedural (`npm run sfx`, starter AUDIRA) | Milik AUDIRA |
