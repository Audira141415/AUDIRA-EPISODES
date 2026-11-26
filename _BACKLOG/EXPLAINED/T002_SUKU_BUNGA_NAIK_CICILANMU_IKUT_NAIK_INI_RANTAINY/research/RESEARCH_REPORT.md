# Research Report — Suku Bunga Naik, Cicilanmu Ikut Naik — Ini Rantainya

> Riset pra-produksi backlog, 2026-11-26. Angka yang bisa berubah ditulis "per 26 November 2026".

## Sumber utama

- Bank Indonesia: siaran pers RDG 17–18 November 2026 (#1, #10), tabel BI-Rate (#2), halaman fungsi Moneter (#3), halaman penjelasan BI-Rate (#4).
- OJK: halaman Suku Bunga Dasar Kredit (#5).
- BP Tapera: ketentuan KPR FLPP (#6).
- Pendukung (MEDIUM): Wikipedia ID "Kredit pemilikan rumah" (#7), Wikipedia EN "Monetary transmission mechanism" (#8), Wikipedia EN "Mortgage calculator" untuk rumus simulasi (#9).

## Fakta terverifikasi

1. Per 26 November 2026, BI-Rate 6,00% setelah RDG 17–18 November 2026 menaikkannya 25 bps; DF 5,25%, LF 6,75% (#1).
2. Alasan resmi: memperkuat stabilisasi nilai tukar Rupiah di tengah ketidakpastian global dan langkah pre-emptive menjaga inflasi 2026–2027 dalam sasaran 2,5±1% (#1).
3. BI-Rate pada 22 April 2026 masih 4,75%; lalu naik bertahap: 5,25% (20 Mei), 5,50% (9 Juni), 5,75% (18 Juni), ditahan Juli–Oktober, 6,00% (18 November). Total +125 bps sejak April (#2).
4. Perubahan BI-Rate memengaruhi suku bunga deposito dan suku bunga kredit perbankan (jalur suku bunga) (#3).
5. BI-Rate dirancang memengaruhi suku bunga pasar uang, termasuk PUAB, lalu suku bunga perbankan (#4).
6. Transmisi tidak instan: tiap jalur punya time lag berbeda; bank bisa merespons lebih lambat tergantung kondisi risiko dan permodalan (#3).
7. OJK mempublikasikan SBDK bank umum; sejak periode November 2025 lewat Portal Data OJK (#5).
8. KPR umumnya memakai bunga tetap untuk periode tertentu lalu floating, atau floating sejak awal; floating berubah mengikuti bunga kredit pasar (#7).
9. KPR Sejahtera FLPP rumah tapak berbunga tetap 5% selama jangka waktu kredit (tenor maks. 40 tahun) (#6).
10. Simulasi anuitas: Rp500 juta, 15 tahun, 9% → 9,25% membuat angsuran naik ±Rp74,6 ribu/bulan (±Rp895,5 ribu/tahun) (#9, hitungan ilustrasi).
11. Kredit perbankan Oktober 2026 tumbuh 13,21% yoy; kredit konsumsi 4,73% yoy (#10).

## Perselisihan / Kontroversi

- **Koreksi hook**: "Satu keputusan rapat bank sentral bisa sampai ke tagihan KPR di rumahmu" benar hanya sebagian. Dampak hanya ke KPR yang sedang floating; KPR dalam masa fixed dan KPR subsidi FLPP (bunga tetap 5%) tidak terdampak langsung. Naskah memakai kata "bisa merambat" dan menyebut pengecualian.
- **Judul**: "Cicilanmu ikut naik" bukan otomatis. Bank tidak wajib meneruskan 25 bps secara penuh atau seketika; BI sendiri menyebut ada time lag dan respons bank bergantung kondisi (#3). Sarankan judul final tetap berbentuk "bisa ikut naik" atau tambahkan teks layar "kalau KPR-mu floating".
- **Simulasi bukan data bank**: bunga 9% → 9,25% adalah angka ilustrasi, bukan suku bunga KPR riil bank mana pun. Di layar wajib label "Simulasi" dan rumus anuitas.
- **Arah kebijakan berubah cepat**: BI-Rate bisa berubah di RDG Desember 2026. Cek ulang #2 sebelum VO dikunci; ganti angka dan tanggal bila berubah.
- **Netralitas (rule 15)**: jangan menilai keputusan BI baik/buruk; jangan tampilkan wajah Gubernur/Deputi atau logo BI, OJK, BP Tapera, atau bank komersial. Gunakan name plate teks "Bank Indonesia" saja.

## Angka kunci untuk HUD

| angka/tahun/nama | konteks | # sumber |
|---|---|---|
| 6,00% | BI-Rate per 18 Nov 2026 | 1, 2 |
| +25 bps | kenaikan RDG 17–18 Nov 2026 | 1 |
| 18 November 2026 | tanggal keputusan diumumkan | 1, 2 |
| 4,75% → 6,00% | BI-Rate April → November 2026 | 2 |
| +125 bps | total kenaikan sejak April 2026 | 2 |
| 2,5±1% | sasaran inflasi 2026–2027 | 1 |
| SBDK | patokan bunga kredit bank, dipublikasikan OJK | 5 |
| 5% tetap | bunga KPR FLPP selama tenor | 6 |
| Rp500 juta · 15 thn | asumsi simulasi | 9 |
| 9% → 9,25% | asumsi kenaikan bunga floating (simulasi) | 9 |
| +±Rp75 ribu/bulan | selisih angsuran (simulasi) | 9 |
| ±Rp900 ribu/tahun | selisih angsuran setahun (simulasi, Rp895.542) | 9 |

## Poin kunci

- Rantai: RDG → BI-Rate → bunga pasar uang (PUAB) → biaya dana bank → SBDK/bunga kredit → bunga KPR floating → cicilan.
- Yang terdampak: KPR floating. Yang aman: KPR masih fixed, KPR FLPP.
- Efek tidak instan dan tidak selalu 1:1 (time lag, kebijakan tiap bank).
- Ajakan praktis tanpa saran investasi: cek kapan masa bunga tetap KPR berakhir.
- Topik cepat basi: angka BI-Rate harus dicek ulang sebelum produksi.
