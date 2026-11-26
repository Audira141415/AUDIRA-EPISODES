# Research Report — Kenapa Rupiah Bisa Melemah Terhadap Dolar

> Riset pra-produksi (backlog, 2026-11-26). Nomor dalam kurung siku merujuk `# ` di `SOURCE_REGISTER.md`.

## Sumber utama

- Bank Indonesia: halaman data JISDOR [1], halaman penjelasan JISDOR [2], siaran pers RDG November 2026 [4], siaran pers NPI triwulan III 2026 [5].
- Buku Seri Kebanksentralan No. 6 "Kebijakan Moneter di Indonesia" (Warjiyo & Solikin, PPSK BI, 2003) [3] untuk mekanisme kurs mengambang dan sejarah 1997.
- Federal Reserve History [7] dan Al Jazeera [6] sebagai sumber internasional.
- Wikipedia en/id [8][9][10] hanya untuk angka sejarah pendukung (MEDIUM).

## Fakta terverifikasi

1. JISDOR 26 November 2026 = Rp18.390 per dolar AS [1].
2. JISDOR disusun dari kurs transaksi USD/IDR antarbank di pasar valas domestik, dipantau BI secara real time lewat SISMONTAVAR, dan terbit sejak 20 Mei 2013 untuk tiap hari kerja [2].
3. Indonesia memakai sistem nilai tukar mengambang sejak 14 Agustus 1997 [3][8].
4. Dalam sistem mengambang, kurs bergerak menurut permintaan dan penawaran valas: rupiah melemah bila permintaan valas melebihi penawarannya [3].
5. Tahun 1997 BI melepas pita intervensi karena cadangan devisa terkuras oleh permintaan valas untuk utang luar negeri swasta dan serangan spekulasi [3]. Pita sempat dilebarkan dari 8% ke 12% pada 11 Juli 1997 [8].
6. Krisis Asia bermula dari devaluasi baht Thailand pada 2 Juli 1997, lalu menjalar ke Indonesia [7].
7. Rupiah jatuh dari kisaran dua ribuan per dolar (Agustus 1997) [9] ke sekitar Rp16.800 pada 17 Juni 1998 [8].
8. Pada 2026 rupiah mencetak rekor terlemah: menembus Rp17.000 pada April [8] dan Rp18.000 (18.028) pada awal Juni [6][8].
9. RDG BI 17–18 November 2026 menaikkan BI-Rate 25 bps menjadi 6,00% untuk memperkuat stabilisasi rupiah [4].
10. BI mengintervensi pasar valas lewat NDF di luar negeri serta spot dan DNDF di pasar domestik [4].
11. BI menyebut tekanan dari ketidakpastian global, prakiraan kenaikan Fed Funds Rate, dan imbal hasil US Treasury yang tinggi [4].
12. Modal asing keluar dari pasar saham sekitar 0,9 miliar dolar AS pada triwulan IV 2026 (hingga 16 November 2026) [4].
13. Defisit neraca migas Indonesia turun pada triwulan III 2026 seiring impor minyak dan gas yang lebih rendah; impor migas adalah salah satu sumber permintaan dolar [5].

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md.** Hook "Tidak ada yang mengatur angka kurs tiap pagi" hanya separuh benar. Tidak ada pihak yang *menetapkan* kurs sejak 14 Agustus 1997 [3]. Namun Bank Indonesia *menerbitkan* kurs acuan harian JISDOR [2] dan aktif *mengintervensi* untuk meredam gejolak [4]. Detail "tiap pagi" tidak terverifikasi; jam terbit JISDOR tidak dipakai di naskah. Naskah draf memakai versi yang akurat: "tidak ada pejabat yang menulis angka itu", lalu menjelaskan peran BI di c06.
- **Label "mengambang bebas".** Sumber [3] menyebut "mengambang (bebas)", tetapi praktiknya BI tetap mengintervensi [4][8]. Naskah tidak memakai kata "bebas".
- **Angka puncak 1998.** Sumber MEDIUM berbeda: ±Rp16.800 pada Juni 1998 [8] vs ±Rp15.000 pada Januari 1998 [9]. Keduanya benar untuk bulan berbeda. Naskah memakai "sekitar Rp16.800, Juni 1998"; sebaiknya dicek ulang ke data historis BI di tahap 2 produksi sebelum dipakai sebagai callout.
- **Rekor terlemah.** "Rekor terlemah" di c05 mengacu Juni 2026 [6]. Kurs 26 November 2026 (Rp18.390) [1] lebih lemah lagi. Angka kurs cepat basi: cek ulang JISDOR terbaru tepat sebelum VO dikunci.
- **Netralitas (rule 15).** Penyebab pelemahan dijelaskan sebagai mekanisme pasar dan faktor global/domestik, tanpa menyalahkan pejabat atau partai. Tokoh politik 1998 sengaja tidak disebut.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| Rp18.390 | JISDOR per 26 November 2026 | 1 |
| 14 Agustus 1997 | Mulai sistem nilai tukar mengambang | 3, 8 |
| JISDOR · sejak 20 Mei 2013 | Kurs acuan harian dari transaksi antarbank | 2 |
| 0,9 miliar dolar AS | Modal keluar pasar saham, hingga 16 Nov 2026 | 4 |
| ± Rp16.800 · Juni 1998 | Titik terdalam krisis 1998 | 8 |
| "dua ribuan" · Agustus 1997 | Kurs sebelum krisis memuncak | 9 |
| Rp18.000 · Juni 2026 | Rekor terlemah tercatat saat itu | 6, 8 |
| BI-Rate 6,00% · 18 Nov 2026 | Kenaikan 25 bps untuk stabilisasi rupiah | 4 |
| Spot · DNDF · NDF | Instrumen intervensi BI | 4 |

## Poin kunci

- Kurs rupiah adalah harga, bukan keputusan: dibentuk permintaan dan penawaran dolar di pasar valas.
- Rupiah melemah saat yang butuh dolar (importir, pembayar utang luar negeri, investor yang keluar) lebih banyak daripada yang menjual dolar.
- Faktor global (suku bunga AS, imbal hasil obligasi AS, ketidakpastian geopolitik) sering jadi pemicu terbesar.
- BI tidak mematok kurs, tetapi meredam gejolak lewat intervensi dan suku bunga.
- Semua angka kurs harus ditulis "per <tanggal>" dan dicek ulang sebelum produksi.
