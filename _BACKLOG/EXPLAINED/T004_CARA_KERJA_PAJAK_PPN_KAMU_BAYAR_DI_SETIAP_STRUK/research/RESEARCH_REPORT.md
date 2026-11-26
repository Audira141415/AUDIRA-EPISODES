# Research Report — Cara Kerja Pajak PPN: Kamu Bayar di Setiap Struk Belanja

> Riset backlog 2026-11-26. Nomor `#` merujuk `research/SOURCE_REGISTER.md`.

## Sumber utama

- **Regulasi primer (HIGH):** UU 8/1983 (#1), UU 7/2021 HPP (#2), PMK 131/2024 (#3), dibaca langsung di JDIH BPK (teks PDF UU HPP dan PMK 131 dibaca per pasal).
- **Sejarah global (HIGH):** ICAEW Insights 2024 (#4).
- **Konteks dan mekanisme (MEDIUM):** Kontan (#5), Wikipedia id/en (#6, #7, #8).
- Catatan: pencarian web otomatis gagal di sesi ini dan halaman PPN di pajak.go.id tidak ditemukan (404), jadi angka realisasi penerimaan PPN tahunan **belum** diverifikasi dan tidak dipakai di naskah. Bila ingin angka penerimaan di HUD, ambil dari APBN KiTa / LKPP Kemenkeu di tahap 2.

## Fakta terverifikasi

1. Dasar hukum PPN Indonesia adalah UU No. 8 Tahun 1983, ditetapkan 31 Desember 1983 (#1, #6).
2. PPN dipungut oleh Pengusaha Kena Pajak (PKP) di setiap tahap penjualan. Yang disetor = pajak keluaran − pajak masukan, sehingga yang dipajaki hanya nilai tambah tiap tahap, dan bebannya berakhir di konsumen akhir (#6; pengkreditan pajak masukan juga di #3 Pasal 2 ayat 4 dan Pasal 3 ayat 4).
3. UU HPP menetapkan tarif 11% mulai 1 April 2022 dan 12% paling lambat 1 Januari 2025 (#2).
4. Per 1 Januari 2025 (PMK 131/2024, status "Berlaku" per 26 November 2026): barang mewah yang kena PPnBM dikenai 12% × harga jual; barang dan jasa lain 12% × nilai lain sebesar 11/12 harga jual, sehingga beban efektifnya 11% (#3, #5).
5. Contoh hitung (turunan rumus #3): harga jual Rp100.000 → DPP 11/12 × 100.000 = Rp91.667 → PPN 12% = Rp11.000.
6. Ekspor barang kena pajak berwujud dikenai tarif 0%, dan pajak masukannya tetap bisa dikreditkan (#2). VAT umumnya berbasis tujuan konsumsi (#7).
7. UU HPP membuka fasilitas PPN dibebaskan/tidak dipungut, antara lain untuk barang kebutuhan pokok yang sangat dibutuhkan rakyat banyak, jasa kesehatan medis tertentu, pendidikan, dan angkutan umum (#2).
8. Tarif PPN dapat diubah dalam rentang 5%–15% (#2).
9. VAT pertama kali diterapkan di Prancis tahun 1954 (Maurice Lauré); kini 175 negara memakai suatu bentuk VAT (#4).

## Perselisihan / Kontroversi

- **Tanggal berlaku UU 8/1983 berbeda antar sumber:** JDIH BPK mencatat "Tanggal Berlaku 01 Juli 1984" (#1), Wikipedia id menyebut berlaku 1 April 1985 (#6, pelaksanaan diundur). Naskah hanya menyebut "lahir tahun 1983" (tahun penetapan) agar aman.
- **12% vs 11%:** tarif di undang-undang 12%, tetapi untuk barang non-mewah beban efektif tetap 11% lewat DPP 11/12 (#3). Banyak orang mengira semua barang naik ke 12%. Naskah membedakan keduanya dan HUD wajib mencantumkan "per 26 Nov 2026", karena tarif bisa diubah lagi (rentang 5%–15%, #2).
- **Koreksi hook TOPIC.md:** "ikut membiayai jalan di depan rumahmu" terlalu harfiah. PPN adalah pajak pusat yang masuk APBN; jalan di depan rumah umumnya jalan desa/kabupaten yang dibiayai APBD (sebagian dananya transfer dari APBN). Naskah memakai versi aman: PPN masuk kas negara dan "ikut membiayai jalan, sekolah, dan layanan publik", tanpa klaim jalan tertentu. Hook diganti fokus ke baris "PPN" di struk.
- **Struk restoran bukan PPN:** makanan/minuman di restoran adalah objek pajak daerah, bukan PPN (#2). Visual wajib struk minimarket/toko ritel, bukan struk restoran.
- **"Kebutuhan pokok bebas PPN":** dasar hukumnya fasilitas di UU HPP (#2); daftar barang rinci diatur di peraturan turunan yang belum dibaca. Naskah memakai frasa "sebagian kebutuhan pokok" tanpa daftar.
- **Isu politik:** rencana kenaikan ke 12% sempat memicu penolakan publik (#8). Channel EXPLAINED wajib netral: naskah tidak menyebut tokoh atau partai dan tidak menilai kebijakan.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 1983 | UU No. 8/1983, dasar hukum PPN | #1 |
| 12% | Tarif PPN di UU HPP (per 26 Nov 2026) | #2, #3 |
| 11/12 | DPP nilai lain untuk barang/jasa non-mewah | #3 |
| 11% | Beban efektif barang biasa (per 26 Nov 2026) | #3, #5 |
| 2025 | PMK 131/2024 berlaku 1 Januari 2025 | #3 |
| 0% | Tarif PPN ekspor | #2 |
| Rp100.000 → Rp11.000 | Contoh hitung di struk (turunan rumus PMK 131) | #3 |
| Prancis 1954 | Awal VAT modern | #4 |
| ±175 negara | Negara pemakai VAT | #4 |

## Poin kunci

- PPN dibayar konsumen akhir tapi dipungut bertahap oleh setiap penjual dalam rantai pasok.
- Yang disetor tiap penjual hanya selisih pajak keluaran dan pajak masukan, yaitu pajak atas nilai yang ia tambahkan.
- Tarif tertulis 12%, beban efektif barang biasa 11% (per 26 Nov 2026); 12% penuh hanya untuk barang mewah.
- Ekspor 0%, sebagian kebutuhan pokok dibebaskan.
- Struk minimarket adalah pintu masuk visual yang kuat; hindari struk restoran (pajak daerah).
