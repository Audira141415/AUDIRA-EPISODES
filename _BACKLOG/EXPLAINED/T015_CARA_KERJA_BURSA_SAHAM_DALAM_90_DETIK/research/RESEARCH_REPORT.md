# Research Report — Cara Kerja Bursa Saham dalam 90 Detik

> Riset backlog 2026-11-26. Channel @AudiraExplained (rule 15). Bukan nasihat investasi; tidak menyebut saham, emiten, atau sekuritas tertentu.

## Sumber utama

- **KSEI, Statistik Pasar Modal Indonesia Oktober 2026** (#1): angka investor resmi terbaru, dibuka langsung (PDF).
- **KSEI, halaman Tentang KSEI** (#2): peran LPP, scripless trading sejak 2000, C-BEST.
- **OJK, kanal Pasar Modal** (#3, #4, #5): definisi perusahaan efek (PPE = pialang), emiten, lembaga penunjang.
- **ANTARA** (#6, #7, #8): jumlah perusahaan tercatat per 13 Nov 2026, SID per 26 Okt 2026, transisi T+2 tahun 2018.
- **Wikipedia id** (#9–#14): definisi saham, lot, KPEI, dividen, IPO, sejarah BEI (konteks saja).
- Catatan akses: situs idx.co.id menolak akses otomatis (HTTP 403) dan kpei.co.id tidak bisa di-resolve dari jaringan riset, jadi angka BEI diambil lewat ANTARA (MEDIUM) dan peran KPEI lewat Wikipedia (MEDIUM).

## Fakta terverifikasi

1. Saham adalah bukti kepemilikan atau penyertaan modal di sebuah perusahaan (#9).
2. Emiten adalah pihak yang menawarkan efek (termasuk saham) kepada masyarakat lewat Penawaran Umum; IPO = penjualan saham pertama ke publik, setelah itu saham diperdagangkan di bursa (#4, #14).
3. Per 13 November 2026 ada 963 perusahaan tercatat di pasar modal Indonesia; 7 IPO sepanjang 2026 (#6).
4. Investor tidak bertransaksi langsung di bursa; transaksi dilakukan anggota bursa/pialang, yaitu perusahaan efek berizin OJK sebagai Perantara Pedagang Efek (#3, #12).
5. Di BEI pembelian minimal 1 lot = 100 lembar (#9).
6. Harga terbentuk dari penawaran dan permintaan; harga bisa naik atau turun (#9, #12).
7. Setelah transaksi, lembaga kliring (KPEI) menentukan hak dan kewajiban (efek dan uang) dan menjamin penyelesaian sebagai central counterparty (#10).
8. KSEI sebagai LPP menyimpan efek dan menyelesaikan transaksi secara pemindahbukuan elektronik (C-BEST); perdagangan tanpa warkat sejak 2000 (#2, #1).
9. Siklus penyelesaian dipercepat dari T+3 ke T+2 pada akhir November 2018 (#8, #11).
10. Per akhir Oktober 2026: 10.373.240 investor saham dan surat berharga lainnya (C-BEST); total SID pasar modal 33.549.175 (#1). OJK menyebut 33,36 juta SID per 26 Okt 2026 (#7), konsisten.
11. Dividen adalah pembagian laba ke pemegang saham sesuai jumlah saham yang dimiliki (#13).

## Perselisihan / Kontroversi

- **Hook TOPIC.md akurat**: "Membeli saham artinya kamu ikut memiliki sepotong kecil sebuah perusahaan" sesuai definisi saham (#9). Tidak perlu koreksi. Catatan nuansa: kepemilikan berlaku untuk saham biasa; hak suara dan dividen tergantung jenis saham dan keputusan perusahaan, jadi naskah tidak menjanjikan dividen ("bisa dapat").
- **Label "investor saham"**: angka KSEI 10,37 juta adalah investor "saham dan surat berharga lainnya" di C-BEST, bukan murni saham. HUD wajib memakai label lengkap; VO memakai "punya rekening di sistem saham", bukan "membeli saham".
- **963 perusahaan vs 1.005 efek equity**: ANTARA (data BEI) menyebut 963 perusahaan tercatat; statistik KSEI mencatat 1.005 efek tipe equity di C-BEST (bisa termasuk efek non-bursa/kelas saham berbeda). Pakai 963 dengan label "per 13 Nov 2026" dan cek ulang di idx.co.id sebelum produksi.
- **T+2 masih berlaku?** Sumber T+2 dari 2018. Belum ditemukan sumber resmi yang dibuka langsung bahwa siklus masih T+2 per November 2026 (situs BEI/KPEI tidak dapat diakses). Wajib cek ulang; jika sudah berubah (misalnya T+1), ganti VO c04.
- **Kondisi pasar 2026**: OJK mencatat IHSG terkoreksi tajam pada Oktober 2026 (#7). Topik ini tidak membahas pergerakan indeks; jangan menampilkan level IHSG agar netral dan tidak terbaca sebagai sinyal pasar.
- **Rule 15**: tanpa logo BEI/KSEI/KPEI/OJK/sekuritas/emiten; tanpa wajah orang nyata; kode saham dan angka harga di order book harus fiktif dan diberi label ilustrasi.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 963 perusahaan | Perusahaan tercatat, per 13 Nov 2026 | #6 |
| 1 lot = 100 lembar | Satuan beli minimal di BEI | #9 |
| Izin OJK | Perusahaan efek/pialang (PPE) | #3 |
| 2000 | Perdagangan tanpa warkat (scripless) | #2 |
| T+2 | Penyelesaian dua hari bursa (sejak Nov 2018, cek ulang) | #8, #11 |
| 10,37 juta | Investor saham & surat berharga lainnya, per akhir Okt 2026 | #1 |
| 33,5 juta | Total SID pasar modal, per akhir Okt 2026 | #1 |

## Poin kunci

- Alur 5 langkah jelas untuk visual: perusahaan butuh modal → pialang → pencocokan harga di bursa → kliring & penjaminan → kustodian sentral, selesai T+2.
- Angka hidup (investor, emiten) wajib bertanda "per <tanggal>" dan dicek ulang saat produksi.
- Tutup dengan risiko (harga bisa turun) dan disclaimer bukan ajakan beli, menjaga netralitas EXPLAINED.
